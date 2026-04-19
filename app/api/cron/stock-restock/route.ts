import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { BRAND } from '@/lib/brand';

/**
 * Hourly cron. For each stock_alert with notified_at=null, check the product's
 * stock. If stock != 0 (i.e. restocked or unlimited), send the "back in stock"
 * email and mark notified.
 */
export async function GET() {
  const sb = createAdminClient();
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: 'No Resend key' }, { status: 500 });
  const resend = new Resend(process.env.RESEND_API_KEY);
  const FROM = process.env.EMAIL_FROM || 'Pirabel <onboarding@resend.dev>';
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://pirabel-one.store';

  const { data: alerts } = await sb
    .from('stock_alerts')
    .select('id, email, product_id')
    .is('notified_at', null)
    .limit(100);

  if (!alerts || alerts.length === 0) return NextResponse.json({ sent: 0 });

  const productIds = [...new Set(alerts.map(a => a.product_id))];
  const { data: prods } = await sb.from('products').select('id, name_fr, img, stock, published').in('id', productIds);
  const byId = new Map(prods?.map(p => [p.id, p]) ?? []);

  let sent = 0;
  for (const a of alerts) {
    const p = byId.get(a.product_id);
    if (!p || !p.published) continue;
    if (p.stock === 0) continue; // still out of stock

    try {
      await resend.emails.send({
        from: FROM, to: a.email,
        subject: `${p.name_fr} est de nouveau disponible`,
        html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f7f3ec;font-family:sans-serif;color:#14110d;"><table width="100%" style="padding:28px 14px;"><tr><td align="center"><table width="600" style="background:#fdfbf7;border:1px solid #e4dccd;max-width:600px;"><tr><td style="background:#14110d;padding:36px;text-align:center;color:#f7f3ec;"><div style="font-family:Georgia,serif;font-size:36px;">Pirabel</div></td></tr><tr><td style="padding:32px;"><h1 style="font-family:Georgia,serif;font-size:26px;font-weight:400;margin:0 0 16px;">${p.name_fr} est revenu.</h1>${p.img ? `<img src="${p.img}" style="width:100%;max-width:520px;aspect-ratio:4/5;object-fit:cover;display:block;margin:16px 0;"/>` : ''}<p style="font-size:14px;line-height:1.7;color:#2c2821;">Il est de nouveau disponible sur pirabel-one.store. Les stocks partent vite — on te recommande de le réserver maintenant.</p><div style="text-align:center;margin-top:24px;"><a href="${site}/produit/${p.id}" style="display:inline-block;background:#14110d;color:#f7f3ec;padding:16px 36px;text-decoration:none;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;">Acheter maintenant</a></div><p style="margin-top:28px;font-size:11px;color:#9c9589;text-align:center;">Écris-nous sur WhatsApp au ${BRAND.phoneDisplay} si besoin.</p></td></tr></table></td></tr></table></body></html>`,
      });
      sent++;
      await sb.from('stock_alerts').update({ notified_at: new Date().toISOString() }).eq('id', a.id);
    } catch (e) {
      console.error('[stock-restock]', e);
    }
  }

  return NextResponse.json({ sent, total: alerts.length });
}
