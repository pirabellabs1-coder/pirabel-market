import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  if (!email) return NextResponse.json({ ok: false });
  const sb = createAdminClient();
  await sb
    .from('abandoned_carts')
    .update({ recovered_at: new Date().toISOString() })
    .eq('email', email)
    .is('recovered_at', null)
    .then(() => undefined, () => undefined);
  return NextResponse.json({ ok: true });
}
