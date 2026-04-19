import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireApiKey } from '@/lib/api-auth';

export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = requireApiKey(request); if (deny) return deny;
  const { id } = await ctx.params;
  const sb = createAdminClient();
  const { data, error } = await sb.from('products').select('*').eq('id', id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = requireApiKey(request); if (deny) return deny;
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  const sb = createAdminClient();
  const { data, error } = await sb.from('products').update(body).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = requireApiKey(request); if (deny) return deny;
  const { id } = await ctx.params;
  const sb = createAdminClient();
  const { error } = await sb.from('products').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
