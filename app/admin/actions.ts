'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { sendOrderStatusUpdate, sendCollaboratorInvite } from '@/lib/email';

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

  // Fetch current state (for email context + previous status)
  const { data: prev } = await sb.from('orders').select('*').eq('id', id).maybeSingle();
  if (!prev) throw new Error('Order not found');
  const previousStatus = prev.status;

  const patch: Record<string, unknown> = { status };
  if (status === 'paid') patch.paid_at = new Date().toISOString();
  if (status === 'shipped') patch.shipped_at = new Date().toISOString();
  if (status === 'delivered') patch.delivered_at = new Date().toISOString();
  const { error } = await sb.from('orders').update(patch).eq('id', id);
  if (error) throw new Error(error.message);

  // Fire status-change email (client only), non-blocking
  if (previousStatus !== status) {
    const { data: items } = await sb.from('order_items').select('name, qty, price, size, color, img').eq('order_id', id);
    sendOrderStatusUpdate({
      ...prev,
      status,
      items: items ?? [],
    }, previousStatus).catch(e => console.error('[status email]', e));
  }

  revalidatePath('/admin/commandes', 'page');
  revalidatePath(`/admin/commandes/${id}`, 'page');
}

// ============ HELPERS ============

// ============ JOURNAL POSTS ============

export async function createJournalPost(formData: FormData) {
  await requireAdmin();
  const sb = createAdminClient();

  const title_fr = formData.get('title_fr')?.toString() || '';
  const slug = (formData.get('slug')?.toString() || slugify(title_fr));
  const published = formData.get('published') === 'on';

  const row = {
    slug,
    title_fr,
    title_en: formData.get('title_en')?.toString() || null,
    excerpt_fr: formData.get('excerpt_fr')?.toString() || null,
    excerpt_en: formData.get('excerpt_en')?.toString() || null,
    body_fr: formData.get('body_fr')?.toString() || '',
    body_en: formData.get('body_en')?.toString() || null,
    cover_img: formData.get('cover_img')?.toString() || null,
    category: formData.get('category')?.toString() || null,
    author: formData.get('author')?.toString() || 'Pirabel',
    published,
    published_at: published ? new Date().toISOString() : null,
  };

  const { error } = await sb.from('journal_posts').insert(row);
  if (error) throw new Error(error.message);

  updateTag('journal');
  revalidatePath('/admin/journal', 'page');
  revalidatePath('/journal', 'page');
  redirect('/admin/journal');
}

export async function updateJournalPost(id: string, formData: FormData) {
  await requireAdmin();
  const sb = createAdminClient();

  const title_fr = formData.get('title_fr')?.toString() || '';
  const published = formData.get('published') === 'on';

  // Fetch current to preserve published_at if already published
  const { data: current } = await sb.from('journal_posts').select('published, published_at').eq('id', id).maybeSingle();

  const row = {
    slug: formData.get('slug')?.toString() || slugify(title_fr),
    title_fr,
    title_en: formData.get('title_en')?.toString() || null,
    excerpt_fr: formData.get('excerpt_fr')?.toString() || null,
    excerpt_en: formData.get('excerpt_en')?.toString() || null,
    body_fr: formData.get('body_fr')?.toString() || '',
    body_en: formData.get('body_en')?.toString() || null,
    cover_img: formData.get('cover_img')?.toString() || null,
    category: formData.get('category')?.toString() || null,
    author: formData.get('author')?.toString() || 'Pirabel',
    published,
    published_at: published
      ? (current?.published ? current.published_at : new Date().toISOString())
      : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await sb.from('journal_posts').update(row).eq('id', id);
  if (error) throw new Error(error.message);

  updateTag('journal');
  revalidatePath('/admin/journal', 'page');
  revalidatePath('/journal', 'page');
  revalidatePath(`/journal/${row.slug}`, 'page');
  redirect('/admin/journal');
}

export async function deleteJournalPost(id: string) {
  await requireAdmin();
  const sb = createAdminClient();
  const { error } = await sb.from('journal_posts').delete().eq('id', id);
  if (error) throw new Error(error.message);
  updateTag('journal');
  revalidatePath('/admin/journal', 'page');
  revalidatePath('/journal', 'page');
}

// ============ PROMOS ============

export async function createPromo(formData: FormData) {
  await requireAdmin();
  const sb = createAdminClient();
  const code = (formData.get('code')?.toString() || '').toUpperCase().replace(/\s+/g, '');
  if (!code) throw new Error('Code requis');
  const row = {
    code,
    type: (formData.get('type')?.toString() as 'percent' | 'fixed' | 'free_shipping') || 'percent',
    value: parseInt(formData.get('value')?.toString() || '0', 10),
    min_order: parseInt(formData.get('min_order')?.toString() || '0', 10),
    max_uses: formData.get('max_uses') ? parseInt(formData.get('max_uses')!.toString(), 10) : null,
    valid_until: formData.get('valid_until')?.toString() || null,
    description: formData.get('description')?.toString() || null,
    active: formData.get('active') === 'on',
  };
  const { error } = await sb.from('promo_codes').insert(row);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/promos', 'page');
  redirect('/admin/promos');
}

export async function updatePromo(code: string, formData: FormData) {
  await requireAdmin();
  const sb = createAdminClient();
  const row = {
    type: formData.get('type')?.toString() as 'percent' | 'fixed' | 'free_shipping',
    value: parseInt(formData.get('value')?.toString() || '0', 10),
    min_order: parseInt(formData.get('min_order')?.toString() || '0', 10),
    max_uses: formData.get('max_uses') ? parseInt(formData.get('max_uses')!.toString(), 10) : null,
    valid_until: formData.get('valid_until')?.toString() || null,
    description: formData.get('description')?.toString() || null,
    active: formData.get('active') === 'on',
  };
  const { error } = await sb.from('promo_codes').update(row).eq('code', code);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/promos', 'page');
}

export async function deletePromo(code: string) {
  await requireAdmin();
  const sb = createAdminClient();
  const { error } = await sb.from('promo_codes').delete().eq('code', code);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/promos', 'page');
}

// ============ POPUPS ============

export async function upsertPopup(formData: FormData) {
  await requireAdmin();
  const sb = createAdminClient();
  const id = formData.get('id')?.toString();
  const row = {
    title: formData.get('title')?.toString() || '',
    body: formData.get('body')?.toString() || null,
    cta_label: formData.get('cta_label')?.toString() || null,
    cta_url: formData.get('cta_url')?.toString() || null,
    image: formData.get('image')?.toString() || null,
    position: formData.get('position')?.toString() || 'center',
    trigger_type: formData.get('trigger_type')?.toString() || 'delay',
    trigger_value: parseInt(formData.get('trigger_value')?.toString() || '5', 10),
    show_once: formData.get('show_once') === 'on',
    active: formData.get('active') === 'on',
    ends_at: formData.get('ends_at')?.toString() || null,
  };
  const { error } = id
    ? await sb.from('popups').update(row).eq('id', id)
    : await sb.from('popups').insert(row);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/popups', 'page');
  revalidatePath('/', 'layout');
}

export async function deletePopup(id: string) {
  await requireAdmin();
  const sb = createAdminClient();
  const { error } = await sb.from('popups').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/popups', 'page');
}

// ============ REVIEWS ============

export async function approveReview(id: string, approved: boolean) {
  await requireAdmin();
  const sb = createAdminClient();
  const { error } = await sb.from('reviews').update({ approved }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/avis', 'page');
}

export async function deleteReview(id: string) {
  await requireAdmin();
  const sb = createAdminClient();
  const { error } = await sb.from('reviews').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/avis', 'page');
}

// ============ LOOKBOOKS ============

export async function createLookbook(formData: FormData) {
  await requireAdmin();
  const sb = createAdminClient();
  const title_fr = formData.get('title_fr')?.toString() || '';
  const slug = (formData.get('slug')?.toString() || slugify(title_fr));
  const published = formData.get('published') === 'on';
  const product_ids = (formData.get('product_ids')?.toString() || '').split(',').map(s => s.trim()).filter(Boolean);
  const row = {
    slug,
    title_fr,
    title_en: formData.get('title_en')?.toString() || null,
    description_fr: formData.get('description_fr')?.toString() || null,
    description_en: formData.get('description_en')?.toString() || null,
    cover_img: formData.get('cover_img')?.toString() || null,
    product_ids,
    published,
  };
  const { error } = await sb.from('lookbooks').insert(row);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/lookbooks', 'page');
  revalidatePath('/lookbooks', 'page');
  redirect('/admin/lookbooks');
}

export async function updateLookbook(id: string, formData: FormData) {
  await requireAdmin();
  const sb = createAdminClient();
  const title_fr = formData.get('title_fr')?.toString() || '';
  const published = formData.get('published') === 'on';
  const product_ids = (formData.get('product_ids')?.toString() || '').split(',').map(s => s.trim()).filter(Boolean);
  const row = {
    slug: formData.get('slug')?.toString() || slugify(title_fr),
    title_fr,
    title_en: formData.get('title_en')?.toString() || null,
    description_fr: formData.get('description_fr')?.toString() || null,
    description_en: formData.get('description_en')?.toString() || null,
    cover_img: formData.get('cover_img')?.toString() || null,
    product_ids,
    published,
  };
  const { error } = await sb.from('lookbooks').update(row).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/lookbooks', 'page');
  revalidatePath('/lookbooks', 'page');
  revalidatePath(`/lookbooks/${row.slug}`, 'page');
  redirect('/admin/lookbooks');
}

export async function deleteLookbook(id: string) {
  await requireAdmin();
  const sb = createAdminClient();
  const { error } = await sb.from('lookbooks').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/lookbooks', 'page');
  revalidatePath('/lookbooks', 'page');
}

// ============ COLLABORATORS / ADMIN ROLE ============

export async function setAdmin(userId: string, isAdmin: boolean) {
  await requireAdmin();
  const sb = createAdminClient();
  const { error } = await sb.from('profiles').update({ is_admin: isAdmin }).eq('id', userId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/clients', 'page');
}

export async function inviteAdmin(formData: FormData): Promise<{ email: string; createdPassword?: string }> {
  await requireAdmin();
  const sb = createAdminClient();
  const email = formData.get('email')?.toString().trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Email invalide');
  const first_name = formData.get('first_name')?.toString() || null;
  const last_name = formData.get('last_name')?.toString() || null;

  const { data: list } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
  let user = list?.users?.find(u => u.email?.toLowerCase() === email);
  let createdPassword: string | undefined;

  if (!user) {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    createdPassword = Array.from(bytes, b => alphabet[b % alphabet.length]).join('');
    const { data: created, error: createErr } = await sb.auth.admin.createUser({
      email, password: createdPassword, email_confirm: true,
    });
    if (createErr || !created.user) throw new Error(createErr?.message || 'Création échouée');
    user = created.user;
  }

  const { error: upErr } = await sb
    .from('profiles')
    .upsert({ id: user.id, first_name, last_name, is_admin: true }, { onConflict: 'id' });
  if (upErr) throw new Error(upErr.message);

  // Send credentials via email if we created a new user with a password.
  // For existing users we don't send (they already have their password).
  if (createdPassword) {
    sendCollaboratorInvite(email, createdPassword).catch((e: unknown) => console.error('[invite email]', e));
  }

  revalidatePath('/admin/clients', 'page');
  return { email, createdPassword };
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
