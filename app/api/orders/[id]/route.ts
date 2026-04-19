import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

type Params = { id: string };

export async function GET(_request: Request, ctx: { params: Promise<Params> }) {
  const { id } = await ctx.params;
  const sb = createAdminClient();

  const { data: order, error } = await sb
    .from('orders')
    .select('id, status, total, subtotal, delivery, payment_method, shipping_name, shipping_phone, shipping_city, shipping_zone, created_at, paid_at, shipped_at, delivered_at')
    .eq('id', id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  const { data: items } = await sb
    .from('order_items')
    .select('name, img, price, qty, size, color')
    .eq('order_id', id);

  return NextResponse.json({ ...order, items: items ?? [] });
}
