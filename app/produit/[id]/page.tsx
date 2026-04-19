import type { Metadata } from 'next';
import { ProductView } from '@/components/product-view';
import { getProductById, getRelatedProducts } from '@/lib/db';
import { fmt } from '@/lib/format';
import { productJsonLd, breadcrumbJsonLd } from '@/lib/seo';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = await getProductById(id);
  if (!p) return { title: 'Produit introuvable' };
  return {
    title: p.fr.name,
    description: p.fr.desc ?? `${p.collection} · ${fmt(p.price)}`,
    alternates: { canonical: `/produit/${p.id}` },
    openGraph: {
      type: 'website',
      title: p.fr.name,
      description: p.fr.desc ?? p.collection,
      images: [{ url: p.img, alt: p.fr.name }],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  const related = product ? await getRelatedProducts(id, product.category, 4) : [];

  const productLd = product ? productJsonLd(product) : null;
  const breadcrumbs = product ? breadcrumbJsonLd([
    { name: 'Accueil', url: '/' },
    { name: product.collection || 'Catalogue', url: `/catalogue/${product.category}` },
    { name: product.fr.name, url: `/produit/${product.id}` },
  ]) : null;

  return (
    <>
      {productLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}/>}
      {breadcrumbs && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}/>}
      <ProductView product={product} related={related}/>
    </>
  );
}
