import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireApiKey } from '@/lib/api-auth';

export async function GET(request: Request) {
  const deny = requireApiKey(request); if (deny) return deny;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const category = searchParams.get('category') || undefined;
  const published = searchParams.get('published');

  const sb = createAdminClient();
  let q = sb.from('products').select('*', { count: 'exact' }).order('created_at', { ascending: false });
  if (category) q = q.eq('category', category);
  if (published === 'true') q = q.eq('published', true);
  if (published === 'false') q = q.eq('published', false);
  q = q.range(offset, offset + limit - 1);
  const { data, count, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, count, limit, offset });
}

export async function POST(request: Request) {
  const deny = requireApiKey(request); if (deny) return deny;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  const sb = createAdminClient();
  const { data, error } = await sb.from('products').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
