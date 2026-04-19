import type { Metadata } from 'next';
import { CatalogView } from '@/components/catalog-view';
import { getProducts, getCategories } from '@/lib/db';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Catalogue — Toutes les pièces',
  description: 'Découvrez la sélection complète Pirabel : souliers, mode, lunetterie, accessoires et pièces pour enfant. Livraison partout au Bénin.',
  alternates: { canonical: '/catalogue' },
};

export default async function CataloguePage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return <CatalogView products={products} categories={categories}/>;
}
