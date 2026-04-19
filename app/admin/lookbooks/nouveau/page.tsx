import { getProducts } from '@/lib/db';
import { LookbookForm } from '../_form';

export const dynamic = 'force-dynamic';

export default async function NewLookbookPage() {
  const products = await getProducts();
  return (
    <div>
      <div className="admin-page-head"><h1>Nouveau lookbook</h1></div>
      <LookbookForm products={products}/>
    </div>
  );
}
