import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  const cart_items = body.cart_items;
  const subtotal = Number(body.subtotal || 0);

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  if (!Array.isArray(cart_items) || cart_items.length === 0) return NextResponse.json({ error: 'Empty cart' }, { status: 400 });

  const sb = createAdminClient();
  await sb.from('abandoned_carts').insert({
    email, cart_items, subtotal,
  }).then(() => undefined, () => undefined);

  return NextResponse.json({ ok: true });
}
