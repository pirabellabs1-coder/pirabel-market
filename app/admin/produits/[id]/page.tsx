import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { ProductForm } from '../_form';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = createAdminClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    sb.from('products').select('*').eq('id', id).maybeSingle(),
    sb.from('categories').select('id, fr').order('sort_order'),
  ]);

  if (!product) notFound();

  return (
    <div>
      <div className="admin-page-head">
        <h1>{product.name_fr}</h1>
        <p className="mute mono" style={{ fontSize: 12 }}>{product.id}</p>
      </div>
      <ProductForm product={product} categories={categories ?? []}/>
    </div>
  );
}
