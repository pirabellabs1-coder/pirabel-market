import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { BRAND } from '@/lib/brand';

const FROM = process.env.EMAIL_FROM || 'Pirabel <onboarding@resend.dev>';

async function requireAdmin() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return false;
  const { data: profile } = await sb.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
  return !!profile?.is_admin;
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const subject = String(body.subject || '').trim();
  const html = String(body.html || '').trim();
  const previewText = String(body.preview || '').slice(0, 140);
  if (!subject || !html) return NextResponse.json({ error: 'Sujet et contenu requis' }, { status: 400 });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'RESEND_API_KEY manquante' }, { status: 500 });

  const sb = createAdminClient();
  const { data: subs } = await sb.from('newsletter').select('email');
  const emails = (subs ?? []).map(s => s.email).filter(Boolean);
  if (emails.length === 0) return NextResponse.json({ error: 'Aucun abonné.' }, { status: 400 });

  const resend = new Resend(apiKey);

  const fullHtml = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>${subject}</title></head><body style="margin:0;padding:0;background:#f7f3ec;font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#14110d;">
    ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>` : ''}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f3ec;padding:28px 14px;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fdfbf7;border:1px solid #e4dccd;">
          <tr><td style="background:#14110d;padding:40px;text-align:center;">
            <div style="font-family:Georgia,serif;font-size:38px;color:#f7f3ec;letter-spacing:0.04em;">Pirabel</div>
            <div style="width:32px;height:1px;background:#8a6b3a;margin:14px auto;"></div>
            <div style="font-size:9px;letter-spacing:0.32em;text-transform:uppercase;color:rgba(247,243,236,.5);">Maison de Cotonou</div>
          </td></tr>
          <tr><td style="padding:32px 40px;">${html}</td></tr>
          <tr><td style="padding:20px 40px;background:#14110d;color:rgba(247,243,236,0.55);font-size:10px;letter-spacing:0.16em;text-transform:uppercase;text-align:center;line-height:1.8;">
            © 2026 Pirabel · Cotonou, Bénin<br/>
            <a href="${BRAND.whatsappUrl}" style="color:rgba(247,243,236,0.55);">WhatsApp</a> ·
            <a href="mailto:${BRAND.contactEmail}" style="color:rgba(247,243,236,0.55);">${BRAND.contactEmail}</a>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;

  // Batch send — Resend supports an array of up to 100 recipients per call (BCC-like via audiences).
  // For simplicity we send individually; 30 msg/sec on free tier.
  let sent = 0, failed = 0;
  const BATCH = 10;
  for (let i = 0; i < emails.length; i += BATCH) {
    const chunk = emails.slice(i, i + BATCH);
    await Promise.all(chunk.map(async (to) => {
      try {
        await resend.emails.send({ from: FROM, to, subject, html: fullHtml });
        sent++;
      } catch {
        failed++;
      }
    }));
  }

  return NextResponse.json({ sent, failed, total: emails.length });
}
