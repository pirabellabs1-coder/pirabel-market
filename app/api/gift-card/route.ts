import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { Resend } from 'resend';
import { BRAND } from '@/lib/brand';

const FROM = process.env.EMAIL_FROM || 'Pirabel <onboarding@resend.dev>';

function genCode(): string {
  return 'GIFT-' + randomBytes(6).toString('base64url').toUpperCase().slice(0, 10);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const amount = Number(body.amount);
  const recipient_email = String(body.recipient_email || '').trim().toLowerCase();
  const recipient_name = String(body.recipient_name || '').trim();
  const buyer_email = String(body.buyer_email || '').trim().toLowerCase();
  const message = String(body.message || '').trim().slice(0, 500);

  if (!amount || amount < 10000 || amount > 500000) return NextResponse.json({ error: 'Montant entre 10 000 et 500 000 FCFA' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient_email)) return NextResponse.json({ error: 'Email destinataire invalide' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer_email)) return NextResponse.json({ error: 'Ton email est invalide' }, { status: 400 });

  const sb = createAdminClient();
  const code = genCode();
  const expires_at = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();

  const { error } = await sb.from('gift_cards').insert({
    code, amount, balance: amount, buyer_email, recipient_email, recipient_name: recipient_name || null, message: message || null, expires_at,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fire email
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const inner = `
      <div style="text-align:center;">
        <div style="font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:#6b6459;">Une carte cadeau vous attend</div>
        <h1 style="font-family:Georgia,serif;font-size:30px;font-weight:400;margin:12px 0 4px;">Chez Pirabel${recipient_name ? `, ${String(recipient_name).replace(/[<>]/g, '')}` : ''}.</h1>
        <div style="margin:24px auto;padding:40px 28px;background:#ede7dc;border:1px solid #d9d2c4;max-width:420px;">
          <div style="font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#6b6459;">Montant</div>
          <div style="font-family:Georgia,serif;font-size:44px;letter-spacing:-0.01em;margin:8px 0 14px;">${new Intl.NumberFormat('fr-FR').format(amount)} FCFA</div>
          <div style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#6b6459;margin-bottom:6px;">Code à saisir au checkout</div>
          <code style="font-family:monospace;font-size:20px;letter-spacing:0.2em;padding:10px 16px;background:#fdfbf7;border:1px solid #d9d2c4;display:inline-block;">${code}</code>
          <div style="font-size:11px;color:#9c9589;margin-top:16px;">Valable 12 mois</div>
        </div>
        ${message ? `<p style="max-width:440px;margin:24px auto;padding:16px;background:#fdfbf7;border-left:3px solid #8a6b3a;font-style:italic;text-align:left;font-size:14px;color:#2c2821;line-height:1.6;">« ${String(message).replace(/[<>]/g, '')} »</p>` : ''}
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://pirabel-one.store'}/catalogue" style="display:inline-block;background:#14110d;color:#f7f3ec;padding:16px 36px;text-decoration:none;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;margin-top:12px;">Découvrir la boutique</a>
      </div>`;
    await resend.emails.send({
      from: FROM,
      to: recipient_email,
      subject: `🎁 Tu as reçu une carte cadeau Pirabel`,
      html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f7f3ec;font-family:sans-serif;color:#14110d;"><table width="100%" style="padding:28px 14px;"><tr><td align="center"><table width="600" style="background:#fdfbf7;border:1px solid #e4dccd;max-width:600px;"><tr><td style="background:#14110d;padding:40px;text-align:center;color:#f7f3ec;"><div style="font-family:Georgia,serif;font-size:38px;letter-spacing:.04em;">Pirabel</div></td></tr><tr><td style="padding:40px;">${inner}</td></tr><tr><td style="padding:20px;background:#14110d;color:rgba(247,243,236,.6);font-size:10px;text-align:center;letter-spacing:.16em;text-transform:uppercase;">© 2026 Pirabel · ${BRAND.address}</td></tr></table></td></tr></table></body></html>`,
    }).catch(e => console.error('[gift email]', e));
  }

  return NextResponse.json({ ok: true, code });
}
