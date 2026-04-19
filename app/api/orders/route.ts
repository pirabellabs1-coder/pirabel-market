import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

type IncomingItem = { id: string; qty: number; size?: string; color?: string };

type IncomingOrder = {
  items: IncomingItem[];
  payment_method: 'mtn' | 'moov' | 'celtiis' | 'card' | 'cod';
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
  const delivery = subtotal > 50000 ? 0 : 2500;
  const total = subtotal + delivery;

  const id = orderId();

  // Insert order
  const { error: oErr } = await sb.from('orders').insert({
    id,
    user_id,
    status: 'pending',
    subtotal,
    delivery,
    total,
    payment_method: body.payment_method,
    shipping_name: body.shipping.name,
    shipping_phone: body.shipping.phone,
    shipping_email: body.shipping.email ?? null,
    shipping_city: body.shipping.city,
    shipping_zone: body.shipping.zone ?? null,
    shipping_address: body.shipping.address ?? null,
  });
  if (oErr) return NextResponse.json({ error: oErr.message }, { status: 500 });

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

  return NextResponse.json({ id, total, status: 'pending' });
}
