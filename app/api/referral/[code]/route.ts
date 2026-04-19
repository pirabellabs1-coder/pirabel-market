import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(_request: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const sb = createAdminClient();
  const { data } = await sb.from('referrals').select('user_id, referrals_count').eq('code', code.toUpperCase()).maybeSingle();
  if (!data) return NextResponse.json({ error: 'Code inconnu' }, { status: 404 });
  // Publicly expose only the fact the code exists — not the referrer identity.
  return NextResponse.json({ valid: true });
}
