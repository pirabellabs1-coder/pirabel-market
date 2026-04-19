import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AccountContent } from './_content';

export const dynamic = 'force-dynamic';

export default async function AccountPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) redirect('/connexion?next=/compte');

  const sb = createAdminClient();
  const [{ data: profile }, { data: orders }, { data: wishlist }] = await Promise.all([
    sb.from('profiles').select('first_name, last_name, phone, is_admin').eq('id', user.id).maybeSingle(),
    sb.from('orders').select('id, status, total, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
    sb.from('wishlists').select('product_id').eq('user_id', user.id),
  ]);

  const wishIds = (wishlist ?? []).map(w => w.product_id);
  const { data: wishProducts } = wishIds.length > 0
    ? await sb.from('products').select('id, category, collection, name_fr, name_en, price, old_price, img, img2, tag, sizes, colors').in('id', wishIds).eq('published', true)
    : { data: [] as any[] };

  return (
    <Suspense fallback={<main className="container" style={{ padding: 80 }}/>}>
      <AccountContent
        initialTab={(params.tab as any) ?? 'orders'}
        email={user.email ?? ''}
        profile={profile ?? { first_name: null, last_name: null, phone: null, is_admin: false }}
        orders={orders ?? []}
        wishProducts={wishProducts ?? []}
      />
    </Suspense>
  );
}
