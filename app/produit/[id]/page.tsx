import { ProductView } from '@/components/product-view';
import { getProductById, getRelatedProducts } from '@/lib/db';

export const revalidate = 60;

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  const related = product ? await getRelatedProducts(id, product.category, 4) : [];
  return <ProductView product={product} related={related}/>;
}
