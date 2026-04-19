import { HomeContent } from '@/components/home-content';
import { getProducts, getCategories } from '@/lib/db';

export const revalidate = 60;

export default async function HomePage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return <HomeContent products={products} categories={categories}/>;
}
