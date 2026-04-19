/**
 * Data access layer with Supabase + local fallback.
 *
 * - When NEXT_PUBLIC_SUPABASE_URL is set, fetches from Supabase.
 * - Otherwise, returns seeded data from lib/products.ts + lib/categories.ts.
 *
 * This keeps the site functional before schema is applied AND gives a single
 * point to add caching/revalidation later.
 */
import { unstable_cache } from 'next/cache';
import { createAdminClient } from './supabase/admin';
import { products as localProducts } from './products';
import { categories as localCategories } from './categories';
import type { Product, Category, Color } from './types';

function hasSupabase(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}

type DBProduct = {
  id: string;
  category: string | null;
  collection: string | null;
  name_fr: string;
  name_en: string;
  desc_fr: string | null;
  desc_en: string | null;
  price: number;
  old_price: number | null;
  img: string;
  img2: string | null;
  tag: string | null;
  sizes: string[] | null;
  colors: Color[] | null;
  stock: number;
  published: boolean;
  created_at: string;
};

type DBCategory = {
  id: string;
  fr: string;
  en: string;
  img: string | null;
  sort_order: number;
};

function toProduct(p: DBProduct): Product {
  return {
    id: p.id,
    category: p.category ?? '',
    collection: p.collection ?? '',
    fr: { name: p.name_fr, desc: p.desc_fr ?? undefined },
    en: { name: p.name_en, desc: p.desc_en ?? undefined },
    price: p.price,
    old: p.old_price ?? undefined,
    img: p.img,
    img2: p.img2 ?? undefined,
    tag: p.tag ?? undefined,
    size: p.sizes ?? undefined,
    color: p.colors ?? undefined,
    stock: p.stock,
  };
}

function toCategory(c: DBCategory): Category {
  return {
    id: c.id,
    fr: c.fr,
    en: c.en,
    img: c.img ?? '',
    count: 0,
  };
}

// ========== Products ==========

async function _fetchProducts(): Promise<Product[]> {
  if (!hasSupabase()) return localProducts;
  try {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from('products')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });
    if (error || !data) return localProducts;
    return (data as DBProduct[]).map(toProduct);
  } catch {
    return localProducts;
  }
}

export const getProducts = unstable_cache(_fetchProducts, ['products'], {
  revalidate: 60,
  tags: ['products'],
});

export async function getProductById(id: string): Promise<Product | null> {
  const all = await getProducts();
  return all.find(p => p.id === id) ?? null;
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const all = await getProducts();
  return all.filter(p => p.category === category);
}

export async function getRelatedProducts(id: string, category: string, limit = 4): Promise<Product[]> {
  const all = await getProducts();
  return all.filter(p => p.category === category && p.id !== id).slice(0, limit);
}

// ========== Categories ==========

async function _fetchCategories(): Promise<Category[]> {
  if (!hasSupabase()) return localCategories;
  try {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error || !data) return localCategories;
    return (data as DBCategory[]).map(toCategory);
  } catch {
    return localCategories;
  }
}

export const getCategories = unstable_cache(_fetchCategories, ['categories'], {
  revalidate: 60,
  tags: ['categories'],
});
