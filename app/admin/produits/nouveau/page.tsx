import { createAdminClient } from '@/lib/supabase/admin';
import { ProductForm } from '../_form';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const sb = createAdminClient();
  const { data: categories } = await sb.from('categories').select('id, fr').order('sort_order');

  return (
    <div>
      <div className="admin-page-head">
        <h1>Nouveau produit</h1>
        <p className="mute">Remplis les informations puis enregistre.</p>
      </div>
      <ProductForm categories={categories ?? []}/>
    </div>
  );
}
