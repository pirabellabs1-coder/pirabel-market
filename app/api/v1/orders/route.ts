import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireApiKey } from '@/lib/api-auth';

export async function GET(request: Request) {
  const deny = await requireApiKey(request); if (deny) return deny;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const status = searchParams.get('status');
  const since = searchParams.get('since');   // ISO date — inclusive lower bound
  const before = searchParams.get('before'); // ISO date — exclusive upper bound
  const paymentMethod = searchParams.get('payment_method');

  const sb = createAdminClient();
  let q = sb.from('orders').select('*', { count: 'exact' }).order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  if (paymentMethod) q = q.eq('payment_method', paymentMethod);
  if (since) q = q.gte('created_at', since);
  if (before) q = q.lt('created_at', before);
  q = q.range(offset, offset + limit - 1);
  const { data, count, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, count, limit, offset });
}
