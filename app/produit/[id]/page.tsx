import type { Metadata } from 'next';
import { ProductView } from '@/components/product-view';
import { getProductById, getRelatedProducts } from '@/lib/db';
import { fmt } from '@/lib/format';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = await getProductById(id);
  if (!p) return { title: 'Produit introuvable' };
  return {
    title: p.fr.name,
    description: p.fr.desc ?? `${p.collection} · ${fmt(p.price)}`,
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

  // JSON-LD for rich snippets
  const jsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.fr.name,
    description: product.fr.desc,
    image: [product.img, product.img2].filter(Boolean),
    category: product.collection,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'XOF',
      price: product.price,
      availability: 'https://schema.org/InStock',
    },
  } : null;

  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}/>}
      <ProductView product={product} related={related}/>
    </>
  );
}
