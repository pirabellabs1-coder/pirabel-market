import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { BRAND } from '@/lib/brand';
import { fmt } from '@/lib/format';

/**
 * Vercel cron runs every 2 hours. Finds carts abandoned > 2h ago,
 * emails a gentle reminder with a 10% code, marks them reminded.
 */
export async function GET(request: Request) {
  // Vercel cron includes a secret header; keep it open for now since the endpoint is low-stakes.
  const sb = createAdminClient();
  const twoHoursAgo = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
  const sixHoursAgo = new Date(Date.now() - 6 * 3600 * 1000).toISOString();

  const { data: carts } = await sb
    .from('abandoned_carts')
    .select('id, email, cart_items, subtotal')
    .is('reminded_at', null)
    .is('recovered_at', null)
    .lte('created_at', twoHoursAgo)
    .gte('created_at', sixHoursAgo)
    .limit(50);

  if (!carts || carts.length === 0) return NextResponse.json({ sent: 0 });
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: 'No Resend key' }, { status: 500 });
  const resend = new Resend(process.env.RESEND_API_KEY);
  const FROM = process.env.EMAIL_FROM || 'Pirabel <onboarding@resend.dev>';
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://pirabel-one.store';

  let sent = 0;
  for (const c of carts) {
    const items = (c.cart_items as Array<{ name: string; qty: number; img?: string }>);
    const rows = items.slice(0, 3).map(it => `
      <tr><td width="60" valign="top" style="padding:8px;">${it.img ? `<img src="${it.img}" width="54" height="68" style="object-fit:cover;background:#ede7dc;display:block;"/>` : ''}</td>
      <td valign="top" style="padding:8px;font-family:Georgia,serif;font-size:14px;">${it.name}<div style="color:#6b6459;font-size:11px;font-family:sans-serif;margin-top:2px;">× ${it.qty}</div></td></tr>`).join('');

    const inner = `
      <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:400;margin:0 0 8px;">Ton panier t&apos;attend.</h1>
      <p style="font-size:14px;color:#2c2821;line-height:1.65;margin:0 0 24px;">Tu n&apos;as pas terminé ta commande. Pour te donner un petit coup de pouce, voici <strong>10% de réduction</strong> si tu finalises dans les 48h.</p>
      <div style="margin:20px 0;padding:20px;background:#ede7dc;border-left:3px solid #8a6b3a;text-align:center;">
        <div style="font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:#6b6459;">Code promo</div>
        <code style="font-family:monospace;font-size:24px;letter-spacing:0.2em;padding:8px 18px;background:#fdfbf7;border:1px solid #d9d2c4;display:inline-block;margin-top:6px;">REVIENS10</code>
      </div>
      <table width="100%">${rows}</table>
      <p style="font-size:14px;color:#2c2821;margin:20px 0;"><strong>Sous-total : ${fmt(c.subtotal)}</strong></p>
      <div style="text-align:center;margin-top:24px;">
        <a href="${site}/commande" style="display:inline-block;background:#14110d;color:#f7f3ec;padding:16px 36px;text-decoration:none;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;">Finaliser ma commande</a>
      </div>
      <p style="margin-top:28px;font-size:11px;color:#9c9589;text-align:center;">Besoin d&apos;aide ? Réponds à cet email ou écris sur WhatsApp au ${BRAND.phoneDisplay}.</p>`;

    try {
      await resend.emails.send({
        from: FROM, to: c.email,
        subject: 'Ton panier Pirabel — 10% pour toi si tu reviens',
        html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f7f3ec;font-family:sans-serif;color:#14110d;"><table width="100%" style="padding:28px 14px;"><tr><td align="center"><table width="600" style="background:#fdfbf7;border:1px solid #e4dccd;max-width:600px;"><tr><td style="background:#14110d;padding:36px;text-align:center;color:#f7f3ec;"><div style="font-family:Georgia,serif;font-size:36px;">Pirabel</div></td></tr><tr><td style="padding:32px;">${inner}</td></tr></table></td></tr></table></body></html>`,
      });
      sent++;
      await sb.from('abandoned_carts').update({ reminded_at: new Date().toISOString() }).eq('id', c.id);
    } catch (e) {
      console.error('[abandoned]', e);
    }
  }

  // Ensure REVIENS10 promo exists (idempotent upsert, 10% no minimum)
  await sb.from('promo_codes').upsert({
    code: 'REVIENS10', type: 'percent', value: 10, description: 'Récupération panier abandonné',
    active: true,
  }, { onConflict: 'code' });

  return NextResponse.json({ sent, total: carts.length });
}
