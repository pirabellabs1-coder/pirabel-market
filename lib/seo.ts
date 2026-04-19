import { BRAND } from './brand';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://pirabel-one.store';

/** Organization + WebSite schema — inject once in root layout for global identity. */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE}/#organization`,
        name: BRAND.name,
        url: SITE,
        logo: `${SITE}/favicon.svg`,
        email: BRAND.contactEmail,
        telephone: BRAND.phoneDisplay,
        address: {
          '@type': 'PostalAddress',
          streetAddress: BRAND.address,
          addressLocality: BRAND.city,
          addressCountry: 'BJ',
        },
        sameAs: [] as string[],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        url: SITE,
        name: BRAND.name,
        publisher: { '@id': `${SITE}/#organization` },
        inLanguage: 'fr-FR',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE}/catalogue?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };
}

/** Breadcrumb list for a single page. */
export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url.startsWith('http') ? it.url : `${SITE}${it.url}`,
    })),
  };
}

/** Article schema for journal posts. */
export function articleJsonLd(post: {
  slug: string;
  title_fr: string;
  excerpt_fr?: string | null;
  cover_img?: string | null;
  author?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title_fr,
    description: post.excerpt_fr ?? undefined,
    image: post.cover_img ? [post.cover_img] : undefined,
    author: { '@type': 'Person', name: post.author ?? BRAND.name },
    publisher: { '@id': `${SITE}/#organization` },
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at ?? post.published_at ?? undefined,
    mainEntityOfPage: `${SITE}/journal/${post.slug}`,
    inLanguage: 'fr-FR',
  };
}

/** Product schema — used in /produit/[id]. */
export function productJsonLd(p: {
  id: string;
  fr: { name: string; desc?: string };
  collection: string;
  price: number;
  img: string;
  img2?: string;
  stock?: number;
}) {
  const inStock = p.stock === 0 ? 'OutOfStock' : 'InStock';
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE}/produit/${p.id}`,
    name: p.fr.name,
    description: p.fr.desc,
    image: [p.img, p.img2].filter(Boolean),
    category: p.collection,
    brand: { '@type': 'Brand', name: BRAND.name },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'XOF',
      price: p.price,
      availability: `https://schema.org/${inStock}`,
      seller: { '@id': `${SITE}/#organization` },
      url: `${SITE}/produit/${p.id}`,
    },
  };
}
