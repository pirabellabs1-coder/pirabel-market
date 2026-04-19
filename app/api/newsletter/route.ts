import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = body.email?.trim().toLowerCase();
  const lang = body.lang === 'en' ? 'en' : 'fr';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
  }
  const sb = createAdminClient();
  const { error } = await sb.from('newsletter').upsert({ email, lang }, { onConflict: 'email' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
