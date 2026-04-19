import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { sendOrderConfirmation } from '@/lib/email';

type IncomingItem = { id: string; qty: number; size?: string; color?: string };

type IncomingOrder = {
  items: IncomingItem[];
  payment_method: 'mtn' | 'moov' | 'celtiis' | 'card' | 'cod';
  promo_code?: string;
  shipping: {
    name: string;
    phone: string;
    email?: string;
    city: string;
    zone?: string;
    address?: string;
  };
};

function orderId(): string {
  // PB-XXXXXX (6 digits from timestamp + random)
  const ts = Date.now().toString(36).toUpperCase().slice(-4);
  const r = Math.random().toString(36).toUpperCase().slice(2, 4);
  return `PB-${ts}${r}`;
}

export async function POST(request: Request) {
  let body: IncomingOrder;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: 'Empty cart' }, { status: 400 });
  }
  if (!body.shipping?.name || !body.shipping?.phone || !body.shipping?.city) {
    return NextResponse.json({ error: 'Missing shipping fields' }, { status: 400 });
  }
  if (!['mtn', 'moov', 'celtiis', 'card', 'cod'].includes(body.payment_method)) {
    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
  }

  // Optional: link to user if signed in
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  const user_id = user?.id ?? null;

  const sb = createAdminClient();

  // Fetch real prices from DB — never trust client-sent prices.
  const ids = body.items.map(i => i.id);
  const { data: dbProducts, error: pErr } = await sb
    .from('products')
    .select('id, name_fr, price, img, stock')
    .in('id', ids);
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  const byId = new Map(dbProducts?.map(p => [p.id, p]));
  const lines: { id: string; qty: number; size?: string; color?: string; price: number; name: string; img: string | null }[] = [];
  for (const it of body.items) {
    const p = byId.get(it.id);
    if (!p) return NextResponse.json({ error: `Product ${it.id} not found` }, { status: 400 });
    if (it.qty <= 0 || !Number.isFinite(it.qty)) {
      return NextResponse.json({ error: `Invalid qty for ${it.id}` }, { status: 400 });
    }
    lines.push({ id: it.id, qty: Math.floor(it.qty), size: it.size, color: it.color, price: p.price, name: p.name_fr, img: p.img });
  }

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  let delivery = subtotal > 50000 ? 0 : 2500;
  let discount = 0;
  let appliedPromo: string | null = null;

  // Server-side promo validation
  if (body.promo_code) {
    const code = body.promo_code.trim().toUpperCase();
    const { data: promo } = await sb.from('promo_codes').select('*').eq('code', code).eq('active', true).maybeSingle();
    if (promo
      && (!promo.valid_until || new Date(promo.valid_until).getTime() > Date.now())
      && (promo.max_uses == null || promo.uses_count < promo.max_uses)
      && subtotal >= (promo.min_order || 0)
    ) {
      if (promo.type === 'percent') discount = Math.floor(subtotal * (promo.value / 100));
      else if (promo.type === 'fixed') discount = Math.min(promo.value, subtotal);
      else if (promo.type === 'free_shipping') delivery = 0;
      appliedPromo = promo.code;
    }
  }

  const total = Math.max(0, subtotal + delivery - discount);
  const id = orderId();

  // Insert order
  const { error: oErr } = await sb.from('orders').insert({
    id,
    user_id,
    status: 'pending',
    subtotal,
    delivery,
    total,
    discount,
    promo_code: appliedPromo,
    payment_method: body.payment_method,
    shipping_name: body.shipping.name,
    shipping_phone: body.shipping.phone,
    shipping_email: body.shipping.email ?? null,
    shipping_city: body.shipping.city,
    shipping_zone: body.shipping.zone ?? null,
    shipping_address: body.shipping.address ?? null,
  });
  if (oErr) return NextResponse.json({ error: oErr.message }, { status: 500 });

  // Increment promo uses_count
  if (appliedPromo) {
    const { data: p } = await sb.from('promo_codes').select('uses_count').eq('code', appliedPromo).single();
    if (p) {
      await sb.from('promo_codes').update({ uses_count: (p.uses_count ?? 0) + 1 }).eq('code', appliedPromo);
    }
  }

  // Insert items
  const { error: iErr } = await sb.from('order_items').insert(
    lines.map(l => ({
      order_id: id,
      product_id: l.id,
      name: l.name,
      img: l.img,
      price: l.price,
      qty: l.qty,
      size: l.size ?? null,
      color: l.color ?? null,
    }))
  );
  if (iErr) {
    // rollback the order if items failed
    await sb.from('orders').delete().eq('id', id);
    return NextResponse.json({ error: iErr.message }, { status: 500 });
  }

  // Fire confirmation emails (non-blocking — errors are swallowed)
  sendOrderConfirmation({
    id,
    subtotal, delivery, total,
    payment_method: body.payment_method,
    shipping_name: body.shipping.name,
    shipping_phone: body.shipping.phone,
    shipping_email: body.shipping.email,
    shipping_city: body.shipping.city,
    shipping_zone: body.shipping.zone,
    shipping_address: body.shipping.address,
    items: lines.map(l => ({ name: l.name, qty: l.qty, price: l.price, size: l.size, color: l.color, img: l.img })),
  }).catch(e => console.error('[order email]', e));

  return NextResponse.json({ id, total, status: 'pending' });
}
