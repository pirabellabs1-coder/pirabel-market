import { createAdminClient } from '@/lib/supabase/admin';
import { ReviewsManager } from './_manager';

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  const sb = createAdminClient();
  const { data: reviews } = await sb
    .from('reviews')
    .select('id, product_id, author_name, rating, title, body, approved, created_at')
    .order('created_at', { ascending: false });

  const pending = (reviews ?? []).filter(r => !r.approved).length;

  return (
    <div>
      <div className="admin-page-head">
        <h1>Avis clients</h1>
        <p className="mute">{pending} en attente de modération · {(reviews?.length ?? 0) - pending} approuvés</p>
      </div>
      <ReviewsManager reviews={reviews ?? []}/>
    </div>
  );
}
