import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireApiKey } from '@/lib/api-auth';

export async function GET(request: Request) {
  const deny = requireApiKey(request); if (deny) return deny;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const status = searchParams.get('status');
  const since = searchParams.get('since'); // ISO date

  const sb = createAdminClient();
  let q = sb.from('orders').select('*', { count: 'exact' }).order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  if (since) q = q.gte('created_at', since);
  q = q.range(offset, offset + limit - 1);
  const { data, count, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, count, limit, offset });
}
