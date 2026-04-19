import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { getProducts } from '@/lib/db';
import { LookbookForm } from '../_form';

export const dynamic = 'force-dynamic';

export default async function EditLookbookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = createAdminClient();
  const [{ data: lookbook }, products] = await Promise.all([
    sb.from('lookbooks').select('*').eq('id', id).maybeSingle(),
    getProducts(),
  ]);
  if (!lookbook) notFound();
  return (
    <div>
      <div className="admin-page-head"><h1>{lookbook.title_fr}</h1></div>
      <LookbookForm lookbook={lookbook} products={products}/>
    </div>
  );
}
