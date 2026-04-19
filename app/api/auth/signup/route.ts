import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendSignupOtp } from '@/lib/email';
import { randomInt } from 'node:crypto';

type Body = { email?: string; password?: string };

function genOtp(): string {
  return String(randomInt(100000, 1000000)); // 6-digit
}

function isValidEmail(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export async function POST(request: Request) {
  let body: Body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  if (!email || !isValidEmail(email)) return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
  if (!password || password.length < 6) return NextResponse.json({ error: 'Mot de passe trop court (min 6)' }, { status: 400 });

  const sb = createAdminClient();

  // Check if user already exists + confirmed
  const { data: list } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const existing = list?.users?.find(u => u.email?.toLowerCase() === email);
  if (existing?.email_confirmed_at) {
    return NextResponse.json({ error: 'Un compte existe déjà avec cet email. Connecte-toi.' }, { status: 409 });
  }

  let userId: string;
  if (existing) {
    userId = existing.id;
    await sb.auth.admin.updateUserById(userId, { password });
  } else {
    const { data: created, error: createErr } = await sb.auth.admin.createUser({
      email, password, email_confirm: false,
    });
    if (createErr || !created.user) return NextResponse.json({ error: createErr?.message || 'Erreur création' }, { status: 400 });
    userId = created.user.id;
  }

  // Generate + store OTP (10 min TTL, 5 attempts max)
  const code = genOtp();
  const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error: otpErr } = await sb
    .from('otp_codes')
    .upsert({
      email, code, purpose: 'signup', expires_at,
      attempts: 0, user_id: userId, created_at: new Date().toISOString(),
    }, { onConflict: 'email,purpose' });
  if (otpErr) return NextResponse.json({ error: otpErr.message }, { status: 500 });

  // Fire OTP email (non-blocking)
  sendSignupOtp(email, code).catch(e => console.error('[signup otp]', e));

  return NextResponse.json({ ok: true, email });
}
