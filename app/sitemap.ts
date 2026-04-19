import type { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://pirabel-one.store';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sb = createAdminClient();

  const [prodRes, catRes, postRes] = await Promise.all([
    sb.from('products').select('id, updated_at').eq('published', true),
    sb.from('categories').select('id'),
    sb.from('journal_posts').select('slug, updated_at').eq('published', true),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    '', '/catalogue', '/propos', '/contact', '/journal', '/suivi', '/connexion',
  ].map(path => ({
    url: `${SITE}${path}`,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));

  const products: MetadataRoute.Sitemap = (prodRes.data ?? []).map(p => ({
    url: `${SITE}/produit/${p.id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const cats: MetadataRoute.Sitemap = (catRes.data ?? []).map(c => ({
    url: `${SITE}/catalogue/${c.id}`,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const posts: MetadataRoute.Sitemap = (postRes.data ?? []).map(p => ({
    url: `${SITE}/journal/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticPages, ...products, ...cats, ...posts];
}
