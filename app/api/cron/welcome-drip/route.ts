import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { BRAND } from '@/lib/brand';

/**
 * Daily cron. For every user:
 *   - day-3 mail  "Savoir-faire Pirabel"   if welcomed_at was ≥3 days ago and welcome_day3_at is null
 *   - day-7 mail  "Ton code bientôt expiré" if welcomed_at was ≥7 days ago and welcome_day7_at is null
 */
export async function GET() {
  const sb = createAdminClient();
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: 'No Resend key' }, { status: 500 });
  const resend = new Resend(process.env.RESEND_API_KEY);
  const FROM = process.env.EMAIL_FROM || 'Pirabel <onboarding@resend.dev>';
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://pirabel-one.store';

  const now = Date.now();
  const day3 = new Date(now - 3 * 24 * 3600 * 1000).toISOString();
  const day7 = new Date(now - 7 * 24 * 3600 * 1000).toISOString();

  const [{ data: day3Users }, { data: day7Users }] = await Promise.all([
    sb.from('profiles').select('id').lte('welcomed_at', day3).is('welcome_day3_at', null).not('welcomed_at', 'is', null).limit(50),
    sb.from('profiles').select('id').lte('welcomed_at', day7).is('welcome_day7_at', null).not('welcomed_at', 'is', null).limit(50),
  ]);

  // Fetch user emails from auth.users
  const { data: authUsers } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const emailById = new Map(authUsers?.users?.map(u => [u.id, u.email]) ?? []);

  let d3 = 0, d7 = 0;

  for (const u of day3Users ?? []) {
    const to = emailById.get(u.id);
    if (!to) continue;
    try {
      await resend.emails.send({
        from: FROM, to,
        subject: 'Notre savoir-faire — Pirabel',
        html: drip3(site),
      });
      await sb.from('profiles').update({ welcome_day3_at: new Date().toISOString() }).eq('id', u.id);
      d3++;
    } catch (e) { console.error('[drip3]', e); }
  }

  for (const u of day7Users ?? []) {
    const to = emailById.get(u.id);
    if (!to) continue;
    try {
      await resend.emails.send({
        from: FROM, to,
        subject: 'Ton code BIENVENUE20 expire bientôt',
        html: drip7(site),
      });
      await sb.from('profiles').update({ welcome_day7_at: new Date().toISOString() }).eq('id', u.id);
      d7++;
    } catch (e) { console.error('[drip7]', e); }
  }

  return NextResponse.json({ day3_sent: d3, day7_sent: d7 });
}

function wrapper(inner: string): string {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f7f3ec;font-family:sans-serif;color:#14110d;"><table width="100%" style="padding:28px 14px;"><tr><td align="center"><table width="600" style="background:#fdfbf7;border:1px solid #e4dccd;max-width:600px;"><tr><td style="background:#14110d;padding:36px;text-align:center;color:#f7f3ec;"><div style="font-family:Georgia,serif;font-size:36px;">Pirabel</div></td></tr><tr><td style="padding:36px;">${inner}</td></tr><tr><td style="padding:20px;background:#14110d;color:rgba(247,243,236,.55);font-size:10px;text-align:center;letter-spacing:.14em;text-transform:uppercase;">© 2026 Pirabel · ${BRAND.address}</td></tr></table></td></tr></table></body></html>`;
}

function drip3(site: string): string {
  return wrapper(`
    <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;margin:0 0 16px;">Derrière chaque pièce,<br/>une main.</h1>
    <p style="font-size:15px;line-height:1.7;color:#2c2821;">Pirabel sélectionne auprès d&apos;artisans et de maisons qui partagent notre obsession du détail. Cuir travaillé avec patience, tissus pensés pour durer, finitions cousues main.</p>
    <p style="font-size:15px;line-height:1.7;color:#2c2821;">Chaque pièce sur pirabel-one.store a une histoire : son atelier, ses matériaux, son itinéraire avant d&apos;arriver chez toi.</p>
    <div style="margin-top:32px;text-align:center;">
      <a href="${site}/journal" style="display:inline-block;background:#14110d;color:#f7f3ec;padding:16px 36px;text-decoration:none;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;">Lire le Journal</a>
    </div>
  `);
}

function drip7(site: string): string {
  return wrapper(`
    <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;margin:0 0 16px;">Ton cadeau de bienvenue<br/>expire dans 24h.</h1>
    <p style="font-size:15px;line-height:1.7;color:#2c2821;">Ton code <code style="font-family:monospace;background:#ede7dc;padding:4px 10px;border:1px solid #d9d2c4;">BIENVENUE20</code> offre <strong>20% sur ta première commande</strong>. Il reste valable quelques heures.</p>
    <div style="margin-top:28px;padding:20px;background:#ede7dc;border-left:3px solid #8a6b3a;text-align:center;">
      <div style="font-family:Georgia,serif;font-size:22px;margin:6px 0;">−20%</div>
      <div style="font-size:11px;color:#6b6459;">sans montant minimum</div>
    </div>
    <div style="margin-top:28px;text-align:center;">
      <a href="${site}/catalogue" style="display:inline-block;background:#14110d;color:#f7f3ec;padding:16px 36px;text-decoration:none;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;">Découvrir la boutique</a>
    </div>
  `);
}
