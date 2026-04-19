import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://pirabel-one.store';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/compte', '/commande', '/connexion', '/mot-de-passe-oublie', '/nouveau-mot-de-passe', '/auth'] },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
