import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('product_id');
  if (!productId) return NextResponse.json({ error: 'product_id required' }, { status: 400 });
  const sb = createAdminClient();
  const { data, error } = await sb
    .from('reviews')
    .select('id, author_name, rating, title, body, created_at')
    .eq('product_id', productId)
    .eq('approved', true)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const avg = (data ?? []).length > 0
    ? (data!.reduce((s, r) => s + r.rating, 0) / data!.length)
    : 0;
  return NextResponse.json({ reviews: data ?? [], count: (data ?? []).length, average: Math.round(avg * 10) / 10 });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const user = await createClient();
  const { data: { user: u } } = await user.auth.getUser();
  if (!u) return NextResponse.json({ error: 'Auth requise pour laisser un avis' }, { status: 401 });

  const rating = Number(body.rating);
  if (!body.product_id || !body.author_name || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Champs manquants ou note invalide (1-5)' }, { status: 400 });
  }

  const sb = createAdminClient();
  const { error } = await sb.from('reviews').insert({
    product_id: body.product_id,
    user_id: u.id,
    author_name: String(body.author_name).slice(0, 60),
    rating,
    title: body.title ? String(body.title).slice(0, 120) : null,
    body: body.body ? String(body.body).slice(0, 2000) : null,
    approved: false, // admin moderation
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, status: 'pending_moderation' });
}
