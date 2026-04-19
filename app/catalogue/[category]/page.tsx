import type { Metadata } from 'next';
import { CatalogView } from '@/components/catalog-view';
import { getProducts, getCategories } from '@/lib/db';
import { breadcrumbJsonLd } from '@/lib/seo';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const cats = await getCategories();
  const cat = cats.find(c => c.id === category);
  const title = cat ? `${cat.fr} — Collection` : 'Catégorie';
  return {
    title,
    description: cat ? `Découvrez la sélection ${cat.fr.toLowerCase()} Pirabel. Livraison partout au Bénin.` : undefined,
    alternates: { canonical: `/catalogue/${category}` },
    openGraph: {
      title,
      images: cat?.img ? [{ url: cat.img }] : undefined,
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const cat = categories.find(c => c.id === category);
  const crumbs = breadcrumbJsonLd([
    { name: 'Accueil', url: '/' },
    { name: 'Catalogue', url: '/catalogue' },
    { name: cat?.fr ?? category, url: `/catalogue/${category}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }}/>
      <CatalogView products={products} categories={categories} category={category}/>
    </>
  );
}
