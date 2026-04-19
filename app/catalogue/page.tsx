import { CatalogView } from '@/components/catalog-view';
import { getProducts, getCategories } from '@/lib/db';

export const revalidate = 60;

export default async function CataloguePage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return <CatalogView products={products} categories={categories}/>;
}
