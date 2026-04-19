import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  const product_id = String(body.product_id || '').trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
  if (!product_id) return NextResponse.json({ error: 'Produit requis' }, { status: 400 });

  const sb = createAdminClient();
  const { error } = await sb.from('stock_alerts').insert({ email, product_id }).select();
  if (error && !error.message.includes('duplicate')) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
