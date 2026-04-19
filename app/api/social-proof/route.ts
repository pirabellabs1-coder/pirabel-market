import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Returns up to 5 recent public-safe purchase events for the SocialProof toast.
 * Uses the first name + city from shipping + the product name — no sensitive info.
 */
export const revalidate = 120; // edge-cached for 2 min

export async function GET() {
  const sb = createAdminClient();
  const sinceHours = 72;
  const since = new Date(Date.now() - sinceHours * 3600 * 1000).toISOString();

  const { data } = await sb
    .from('orders')
    .select('shipping_name, shipping_city, created_at, order_items(name)')
    .gte('created_at', since)
    .in('status', ['paid', 'preparing', 'shipped', 'delivered'])
    .order('created_at', { ascending: false })
    .limit(12);

  const events = (data ?? [])
    .filter(o => Array.isArray(o.order_items) && o.order_items.length > 0)
    .slice(0, 5)
    .map(o => {
      const firstName = (o.shipping_name || '').split(' ')[0] || 'Un client';
      const initial = firstName.length > 0 ? firstName : '';
      const discreet = initial.length > 1 ? `${initial[0].toUpperCase()}${initial.slice(1).toLowerCase()}.` : initial;
      const minutes = Math.max(2, Math.floor((Date.now() - new Date(o.created_at).getTime()) / 60000));
      return {
        name: discreet,
        city: o.shipping_city,
        product: (o.order_items as { name: string }[])[0]?.name || 'une pièce Pirabel',
        time: minutes,
      };
    });

  return NextResponse.json({ events });
}
