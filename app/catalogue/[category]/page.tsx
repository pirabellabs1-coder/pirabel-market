import { CatalogView } from '@/components/catalog-view';
import { categories } from '@/lib/categories';

export function generateStaticParams() {
  return categories.map(c => ({ category: c.id }));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  return <CatalogView category={category}/>;
}
