import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireApiKey } from '@/lib/api-auth';

export async function GET(request: Request) {
  const deny = requireApiKey(request); if (deny) return deny;
  const sb = createAdminClient();
  const since24h = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const since30d = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();

  const [products, orders, pending, revenue24h, revenue30d, subs, reviews] = await Promise.all([
    sb.from('products').select('id', { count: 'exact', head: true }).then(r => r.count ?? 0),
    sb.from('orders').select('id', { count: 'exact', head: true }).then(r => r.count ?? 0),
    sb.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending').then(r => r.count ?? 0),
    sb.from('orders').select('total').gte('created_at', since24h).then(r => (r.data ?? []).reduce((s, o) => s + (o.total || 0), 0)),
    sb.from('orders').select('total').gte('created_at', since30d).then(r => (r.data ?? []).reduce((s, o) => s + (o.total || 0), 0)),
    sb.from('newsletter').select('email', { count: 'exact', head: true }).then(r => r.count ?? 0),
    sb.from('reviews').select('id', { count: 'exact', head: true }).eq('approved', false).then(r => r.count ?? 0),
  ]);

  return NextResponse.json({
    products,
    orders: { total: orders, pending },
    revenue: { last_24h: revenue24h, last_30d: revenue30d, currency: 'XOF' },
    newsletter_subscribers: subs,
    pending_reviews: reviews,
  });
}
