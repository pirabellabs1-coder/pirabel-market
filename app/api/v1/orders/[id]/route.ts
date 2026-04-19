import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireApiKey } from '@/lib/api-auth';

export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = requireApiKey(request); if (deny) return deny;
  const { id } = await ctx.params;
  const sb = createAdminClient();
  const [{ data: order, error: e1 }, { data: items, error: e2 }] = await Promise.all([
    sb.from('orders').select('*').eq('id', id).maybeSingle(),
    sb.from('order_items').select('*').eq('order_id', id),
  ]);
  if (e1 || e2) return NextResponse.json({ error: (e1 || e2)!.message }, { status: 500 });
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ...order, items: items ?? [] });
}

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = requireApiKey(request); if (deny) return deny;
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  const sb = createAdminClient();
  const { data, error } = await sb.from('orders').update(body).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
