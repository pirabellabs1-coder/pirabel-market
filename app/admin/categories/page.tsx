import { createAdminClient } from '@/lib/supabase/admin';
import { CategoriesManager } from './_manager';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const sb = createAdminClient();
  const { data: categories } = await sb
    .from('categories')
    .select('id, fr, en, img, sort_order')
    .order('sort_order');

  return (
    <div>
      <div className="admin-page-head">
        <h1>Catégories</h1>
        <p className="mute">Organise ton catalogue.</p>
      </div>
      <CategoriesManager categories={categories ?? []}/>
    </div>
  );
}
