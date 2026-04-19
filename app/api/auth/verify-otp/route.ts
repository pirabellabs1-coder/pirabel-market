import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendWelcomeEmail } from '@/lib/email';

type Body = { email?: string; code?: string };

export async function POST(request: Request) {
  let body: Body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const email = body.email?.trim().toLowerCase();
  const code = body.code?.trim();
  if (!email || !code) return NextResponse.json({ error: 'Email et code requis' }, { status: 400 });

  const sb = createAdminClient();

  const { data: otp, error: fetchErr } = await sb
    .from('otp_codes')
    .select('*')
    .eq('email', email)
    .eq('purpose', 'signup')
    .maybeSingle();

  if (fetchErr || !otp) return NextResponse.json({ error: 'Code introuvable. Redemande un nouveau code.' }, { status: 404 });

  if (new Date(otp.expires_at).getTime() < Date.now()) {
    await sb.from('otp_codes').delete().eq('email', email).eq('purpose', 'signup');
    return NextResponse.json({ error: 'Code expiré. Redemande un nouveau code.' }, { status: 410 });
  }

  if (otp.attempts >= 5) {
    await sb.from('otp_codes').delete().eq('email', email).eq('purpose', 'signup');
    return NextResponse.json({ error: 'Trop de tentatives. Redemande un nouveau code.' }, { status: 429 });
  }

  if (otp.code !== code) {
    await sb.from('otp_codes').update({ attempts: otp.attempts + 1 }).eq('email', email).eq('purpose', 'signup');
    return NextResponse.json({ error: 'Code incorrect.' }, { status: 400 });
  }

  // Success — confirm email + cleanup
  if (otp.user_id) {
    await sb.auth.admin.updateUserById(otp.user_id, { email_confirm: true });
  }
  await sb.from('otp_codes').delete().eq('email', email).eq('purpose', 'signup');

  // Welcome email + mark profile welcomed
  if (otp.user_id) {
    sendWelcomeEmail(email).catch(e => console.error('[welcome]', e));
    await sb.from('profiles').update({ welcomed_at: new Date().toISOString() }).eq('id', otp.user_id);
  }

  return NextResponse.json({ ok: true });
}
