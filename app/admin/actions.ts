'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

async function requireAdmin() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data: profile } = await sb.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
  if (!profile?.is_admin) throw new Error('Not admin');
}

function slugify(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40);
}

// ============ PRODUCTS ============

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const sb = createAdminClient();

  const name_fr = formData.get('name_fr')?.toString() || '';
  const id = (formData.get('id')?.toString() || `${slugify(name_fr)}-${Date.now().toString(36).slice(-4)}`);

  const row = {
    id,
    category: formData.get('category')?.toString() || null,
    collection: formData.get('collection')?.toString() || null,
    name_fr,
    name_en: formData.get('name_en')?.toString() || name_fr,
    desc_fr: formData.get('desc_fr')?.toString() || null,
    desc_en: formData.get('desc_en')?.toString() || null,
    price: parseInt(formData.get('price')?.toString() || '0', 10),
    old_price: parseInt(formData.get('old_price')?.toString() || '0', 10) || null,
    img: formData.get('img')?.toString() || '',
    img2: formData.get('img2')?.toString() || null,
    tag: formData.get('tag')?.toString() || null,
    sizes: parseList(formData.get('sizes')?.toString()),
    colors: parseColors(formData.get('colors')?.toString()),
    stock: parseInt(formData.get('stock')?.toString() || '0', 10),
    published: formData.get('published') === 'on',
  };

  const { error } = await sb.from('products').insert(row);
  if (error) throw new Error(error.message);

  updateTag('products');
  revalidatePath('/admin/produits', 'page');
  redirect('/admin/produits');
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin();
  const sb = createAdminClient();

  const name_fr = formData.get('name_fr')?.toString() || '';
  const row = {
    category: formData.get('category')?.toString() || null,
    collection: formData.get('collection')?.toString() || null,
    name_fr,
    name_en: formData.get('name_en')?.toString() || name_fr,
    desc_fr: formData.get('desc_fr')?.toString() || null,
    desc_en: formData.get('desc_en')?.toString() || null,
    price: parseInt(formData.get('price')?.toString() || '0', 10),
    old_price: parseInt(formData.get('old_price')?.toString() || '0', 10) || null,
    img: formData.get('img')?.toString() || '',
    img2: formData.get('img2')?.toString() || null,
    tag: formData.get('tag')?.toString() || null,
    sizes: parseList(formData.get('sizes')?.toString()),
    colors: parseColors(formData.get('colors')?.toString()),
    stock: parseInt(formData.get('stock')?.toString() || '0', 10),
    published: formData.get('published') === 'on',
    updated_at: new Date().toISOString(),
  };

  const { error } = await sb.from('products').update(row).eq('id', id);
  if (error) throw new Error(error.message);

  updateTag('products');
  revalidatePath('/admin/produits', 'page');
  redirect('/admin/produits');
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const sb = createAdminClient();
  const { error } = await sb.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
  updateTag('products');
  revalidatePath('/admin/produits', 'page');
}

// ============ CATEGORIES ============

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const sb = createAdminClient();
  const fr = formData.get('fr')?.toString() || '';
  const row = {
    id: formData.get('id')?.toString() || slugify(fr),
    fr,
    en: formData.get('en')?.toString() || fr,
    img: formData.get('img')?.toString() || null,
    sort_order: parseInt(formData.get('sort_order')?.toString() || '0', 10),
  };
  const { error } = await sb.from('categories').insert(row);
  if (error) throw new Error(error.message);
  updateTag('categories');
  revalidatePath('/admin/categories', 'page');
}

export async function updateCategory(id: string, formData: FormData) {
  await requireAdmin();
  const sb = createAdminClient();
  const fr = formData.get('fr')?.toString() || '';
  const row = {
    fr,
    en: formData.get('en')?.toString() || fr,
    img: formData.get('img')?.toString() || null,
    sort_order: parseInt(formData.get('sort_order')?.toString() || '0', 10),
  };
  const { error } = await sb.from('categories').update(row).eq('id', id);
  if (error) throw new Error(error.message);
  updateTag('categories');
  revalidatePath('/admin/categories', 'page');
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const sb = createAdminClient();
  const { error } = await sb.from('categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
  updateTag('categories');
  revalidatePath('/admin/categories', 'page');
}

// ============ ORDERS ============

export async function updateOrderStatus(id: string, status: string) {
  await requireAdmin();
  const sb = createAdminClient();
  const patch: Record<string, unknown> = { status };
  if (status === 'paid') patch.paid_at = new Date().toISOString();
  if (status === 'shipped') patch.shipped_at = new Date().toISOString();
  if (status === 'delivered') patch.delivered_at = new Date().toISOString();
  const { error } = await sb.from('orders').update(patch).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/commandes', 'page');
  revalidatePath(`/admin/commandes/${id}`, 'page');
}

// ============ HELPERS ============

function parseList(raw: string | undefined): string[] | null {
  if (!raw) return null;
  const list = raw.split(',').map(s => s.trim()).filter(Boolean);
  return list.length ? list : null;
}

function parseColors(raw: string | undefined): { n: string; c: string }[] | null {
  if (!raw) return null;
  // format: "Nom:#hex, Nom:#hex"
  const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
  const colors = parts
    .map(p => {
      const [n, c] = p.split(':').map(s => s.trim());
      if (!n || !c) return null;
      return { n, c };
    })
    .filter((x): x is { n: string; c: string } => !!x);
  return colors.length ? colors : null;
}
