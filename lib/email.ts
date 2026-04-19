import { Resend } from 'resend';
import { fmt } from './format';
import { BRAND } from './brand';

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

// Use verified domain when EMAIL_FROM is set; fallback to Resend's shared sender.
const FROM = process.env.EMAIL_FROM || 'Pirabel <onboarding@resend.dev>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@pirabel-one.store';

type OrderItem = { name: string; qty: number; price: number; size?: string | null; color?: string | null; img?: string | null };

type Order = {
  id: string;
  subtotal: number;
  delivery: number;
  total: number;
  payment_method: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_email?: string | null;
  shipping_city: string;
  shipping_zone?: string | null;
  shipping_address?: string | null;
  items: OrderItem[];
};

/** Fire-and-forget email send. Swallows errors so a failed email never breaks the order flow. */
async function safeSend(payload: Parameters<NonNullable<typeof resend>['emails']['send']>[0]) {
  if (!resend) return;
  try {
    await resend.emails.send(payload);
  } catch (err) {
    console.error('[email] send failed', err);
  }
}

function itemsHtml(items: OrderItem[]): string {
  return items.map(it => `
    <tr>
      ${it.img ? `<td width="68" valign="top" style="padding:14px 14px 14px 0;border-bottom:1px solid #e4dccd;">
        <img src="${it.img}" width="60" height="75" alt="" style="display:block;width:60px;height:75px;object-fit:cover;background:#ede7dc;border-radius:1px;"/>
      </td>` : ''}
      <td valign="top" style="padding:14px 0;border-bottom:1px solid #e4dccd;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#14110d;line-height:1.3;">${escape(it.name)}</div>
        <div style="color:#6b6459;font-size:12px;margin-top:4px;letter-spacing:0.02em;">× ${it.qty}${it.size ? ` · ${escape(it.size)}` : ''}${it.color ? ` · ${escape(it.color)}` : ''}</div>
      </td>
      <td valign="top" style="padding:14px 0;border-bottom:1px solid #e4dccd;text-align:right;font-size:14px;color:#2c2821;white-space:nowrap;">${fmt(it.price * it.qty)}</td>
    </tr>
  `).join('');
}

function layout(title: string, innerHtml: string, badge?: string): string {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)}</title></head><body style="margin:0;padding:0;background:#f7f3ec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#14110d;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f3ec;padding:28px 14px;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fdfbf7;border:1px solid #e4dccd;border-radius:2px;">

          <!-- HERO BANNER -->
          <tr><td style="background:#14110d;padding:48px 40px 40px;text-align:center;">
            ${badge ? `<div style="display:inline-block;padding:6px 14px;background:rgba(182,149,99,0.15);color:#d9b783;font-size:10px;letter-spacing:0.24em;text-transform:uppercase;margin-bottom:20px;border:1px solid rgba(182,149,99,0.3);">${escape(badge)}</div>` : ''}
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:44px;letter-spacing:0.04em;color:#f7f3ec;line-height:1;">Pirabel</div>
            <div style="width:40px;height:1px;background:#8a6b3a;margin:16px auto;"></div>
            <div style="font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:rgba(247,243,236,0.6);">Maison · Cotonou · Est. 2026</div>
          </td></tr>

          <!-- CONTENT -->
          <tr><td style="padding:40px 40px 32px;">${innerHtml}</td></tr>

          <!-- CONTACT STRIP -->
          <tr><td style="padding:24px 40px;background:#ede7dc;border-top:1px solid #d9d2c4;text-align:center;font-size:12px;color:#2c2821;line-height:1.8;">
            <a href="${BRAND.whatsappUrl}" style="color:#14110d;text-decoration:none;">📱 WhatsApp ${escape(BRAND.phoneDisplay)}</a> &nbsp;·&nbsp;
            <a href="mailto:${BRAND.contactEmail}" style="color:#14110d;text-decoration:none;">✉ ${escape(BRAND.contactEmail)}</a>
          </td></tr>

          <!-- FOOTER -->
          <tr><td style="padding:20px 40px 24px;background:#14110d;color:rgba(247,243,236,0.55);font-size:10px;letter-spacing:0.16em;text-transform:uppercase;text-align:center;line-height:1.8;">
            © 2026 Pirabel — ${escape(BRAND.address)} · ${escape(BRAND.country)}<br/>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://pirabel-one.store'}" style="color:rgba(247,243,236,0.55);text-decoration:underline;">pirabel-one.store</a>
          </td></tr>

        </table>
      </td></tr>
    </table>
  </body></html>`;
}

function escape(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

const PAY_LABEL: Record<string, string> = {
  mtn: 'MTN Mobile Money', moov: 'Moov Money', celtiis: 'Celtiis Cash',
  card: 'Carte bancaire', cod: 'Paiement à la livraison',
};

export async function sendOrderConfirmation(order: Order) {
  const firstName = order.shipping_name.split(' ')[0] || '';
  const inner = `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:32px;font-weight:400;margin:0 0 12px;color:#14110d;line-height:1.15;">Merci ${escape(firstName)}.</h1>
    <p style="font-size:15px;line-height:1.65;color:#2c2821;margin:0 0 32px;">Votre commande <strong style="font-family:monospace;color:#14110d;">${escape(order.id)}</strong> est bien reçue. Nous la préparons avec soin — vous recevrez un message dès qu&apos;elle partira en livraison.</p>

    <div style="font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:#6b6459;margin-bottom:12px;border-bottom:1px solid #14110d;padding-bottom:8px;display:inline-block;">Votre commande</div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${itemsHtml(order.items)}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#2c2821;">
      <tr><td style="padding:4px 0;">Sous-total</td><td align="right" style="padding:4px 0;">${fmt(order.subtotal)}</td></tr>
      <tr><td style="padding:4px 0;">Livraison</td><td align="right" style="padding:4px 0;">${order.delivery === 0 ? '<span style="color:#8a6b3a;">Offerte</span>' : fmt(order.delivery)}</td></tr>
      <tr><td style="padding:14px 0 4px;border-top:1px solid #14110d;font-family:Georgia,serif;font-size:20px;">Total</td>
          <td style="padding:14px 0 4px;border-top:1px solid #14110d;font-family:Georgia,serif;font-size:20px;" align="right">${fmt(order.total)}</td></tr>
    </table>

    <div style="margin-top:32px;padding:24px;background:#ede7dc;border-left:3px solid #8a6b3a;">
      <div style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#6b6459;margin-bottom:12px;">Livraison</div>
      <div style="font-size:15px;font-weight:500;">${escape(order.shipping_name)}</div>
      <div style="color:#6b6459;font-size:13px;margin-top:2px;">${escape(order.shipping_phone)}</div>
      <div style="color:#6b6459;font-size:13px;margin-top:6px;">${[order.shipping_zone, order.shipping_city].filter((x): x is string => !!x).map(escape).join(', ')}</div>
      ${order.shipping_address ? `<div style="color:#6b6459;font-size:13px;">${escape(order.shipping_address)}</div>` : ''}
      <div style="margin-top:14px;padding-top:12px;border-top:1px solid #d9d2c4;font-size:12px;color:#6b6459;">
        <span style="letter-spacing:0.14em;text-transform:uppercase;font-size:10px;">Paiement : </span>
        <span style="color:#14110d;">${escape(PAY_LABEL[order.payment_method] ?? order.payment_method)}</span>
      </div>
    </div>

    <div style="margin-top:36px;text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://pirabel-one.store'}/suivi?id=${encodeURIComponent(order.id)}"
         style="display:inline-block;background:#14110d;color:#f7f3ec;padding:16px 36px;text-decoration:none;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;font-weight:500;">
        Suivre ma commande
      </a>
    </div>

    <p style="margin-top:36px;font-size:12px;color:#9c9589;line-height:1.7;text-align:center;">Une question ? Réponds directement à cet email<br/>ou contacte-nous sur WhatsApp au ${escape(BRAND.phoneDisplay)}.</p>
  `;

  const html = layout('Commande confirmée', inner, 'Commande confirmée');

  // Customer
  if (order.shipping_email) {
    await safeSend({
      from: FROM,
      to: order.shipping_email,
      subject: `Commande confirmée · ${order.id}`,
      html,
    });
  }
  // Admin copy
  await safeSend({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `🛎 Nouvelle commande · ${order.id} · ${fmt(order.total)}`,
    html: layout('Nouvelle commande', `
      <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:400;margin:0 0 8px;">${fmt(order.total)}</h1>
      <div style="font-family:monospace;color:#6b6459;margin-bottom:28px;">${escape(order.id)}</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">${itemsHtml(order.items)}</table>
      <div style="padding:20px;background:#ede7dc;border-left:3px solid #14110d;">
        <div style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#6b6459;margin-bottom:8px;">Client</div>
        <div style="font-size:15px;font-weight:500;">${escape(order.shipping_name)}</div>
        <div style="color:#6b6459;font-size:13px;margin-top:2px;">${escape(order.shipping_phone)}${order.shipping_email ? ` · ${escape(order.shipping_email)}` : ''}</div>
        <div style="color:#6b6459;font-size:13px;margin-top:6px;">${[order.shipping_zone, order.shipping_city, order.shipping_address].filter((x): x is string => !!x).map(escape).join(' · ')}</div>
        <div style="margin-top:10px;padding-top:8px;border-top:1px solid #d9d2c4;font-size:12px;color:#6b6459;">Paiement : <span style="color:#14110d;">${escape(PAY_LABEL[order.payment_method] ?? order.payment_method)}</span></div>
      </div>
      <div style="margin-top:28px;text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://pirabel-one.store'}/admin/commandes/${encodeURIComponent(order.id)}"
           style="display:inline-block;background:#14110d;color:#f7f3ec;padding:14px 28px;text-decoration:none;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;font-weight:500;">
          Ouvrir dans l'admin
        </a>
      </div>
    `, 'Nouvelle commande'),
  });
}

export async function sendSignupOtp(email: string, code: string) {
  const inner = `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:400;margin:0 0 12px;text-align:center;">Bienvenue chez Pirabel.</h1>
    <p style="font-size:15px;color:#2c2821;line-height:1.6;text-align:center;margin:0 0 32px;">Pour finaliser la création de ton compte, entre le code ci-dessous sur la page d&apos;inscription.</p>

    <div style="margin:0 auto;padding:28px;background:#ede7dc;border:1px solid #d9d2c4;text-align:center;max-width:340px;">
      <div style="font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:#6b6459;margin-bottom:12px;">Ton code de vérification</div>
      <div style="font-family:'Courier New',Courier,monospace;font-size:36px;font-weight:500;letter-spacing:0.3em;color:#14110d;line-height:1;">${escape(code)}</div>
      <div style="font-size:11px;color:#9c9589;margin-top:16px;">Valable 10 minutes</div>
    </div>

    <p style="margin-top:32px;font-size:12px;color:#9c9589;line-height:1.7;text-align:center;">Si tu n&apos;as pas demandé ce code, ignore simplement cet email.</p>
  `;
  await safeSend({
    from: FROM,
    to: email,
    subject: `Ton code Pirabel : ${code}`,
    html: layout('Code de vérification', inner, 'Code de vérification'),
  });
}

export async function sendWelcomeEmail(email: string, firstName?: string | null) {
  const greet = firstName ? `Bienvenue ${escape(firstName)}.` : 'Bienvenue.';
  const inner = `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:34px;font-weight:400;margin:0 0 16px;line-height:1.15;">${greet}</h1>
    <p style="font-size:15px;color:#2c2821;line-height:1.7;margin:0 0 28px;">Ton compte Pirabel est actif. Tu peux désormais passer commande, suivre tes livraisons, enregistrer tes favoris et bénéficier de nos collections exclusives — depuis Cotonou, livré avec soin partout au Bénin.</p>

    <div style="margin:24px 0;padding:24px;background:#ede7dc;border-left:3px solid #8a6b3a;">
      <div style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#6b6459;margin-bottom:8px;">Cadeau de bienvenue</div>
      <div style="font-family:Georgia,serif;font-size:22px;line-height:1.2;margin-bottom:8px;">20% sur ta première commande</div>
      <div style="font-size:13px;color:#2c2821;">Code : <code style="font-family:monospace;background:#fdfbf7;padding:4px 10px;border:1px solid #d9d2c4;">BIENVENUE20</code></div>
      <div style="font-size:11px;color:#9c9589;margin-top:8px;">Valable à l&apos;achat, sans minimum.</div>
    </div>

    <div style="margin-top:32px;text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://pirabel-one.store'}/catalogue"
         style="display:inline-block;background:#14110d;color:#f7f3ec;padding:16px 36px;text-decoration:none;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;font-weight:500;">
        Découvrir la boutique
      </a>
    </div>

    <p style="margin-top:32px;font-size:12px;color:#9c9589;line-height:1.7;text-align:center;">Besoin d&apos;aide ? Réponds à cet email — on répond en 2h ouvrées.</p>
  `;
  await safeSend({
    from: FROM,
    to: email,
    subject: 'Bienvenue chez Pirabel',
    html: layout('Bienvenue', inner, 'Bienvenue'),
  });
}

export async function sendOrderStatusUpdate(order: Order & { status: string }, previousStatus: string) {
  if (!order.shipping_email) return;
  const labels: Record<string, string> = {
    paid: 'Paiement reçu',
    preparing: 'Commande en préparation',
    shipped: 'Commande en route',
    delivered: 'Commande livrée',
    cancelled: 'Commande annulée',
    refunded: 'Commande remboursée',
  };
  const label = labels[order.status];
  if (!label) return;

  const icons: Record<string, string> = { paid: '✓', preparing: '◍', shipped: '→', delivered: '✓', cancelled: '✕', refunded: '↺' };
  const icon = icons[order.status] || '·';

  const inner = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:72px;height:72px;border:2px solid #14110d;border-radius:50%;font-size:32px;line-height:68px;color:#14110d;">${icon}</div>
    </div>
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:400;margin:0 0 12px;text-align:center;line-height:1.2;">${escape(label)}.</h1>
    <p style="font-size:15px;color:#2c2821;line-height:1.65;text-align:center;margin:0 0 32px;">Votre commande <strong style="font-family:monospace;color:#14110d;">${escape(order.id)}</strong> vient de passer à l&apos;état <strong>${escape(label)}</strong>.</p>
    <div style="text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://pirabel-one.store'}/suivi?id=${encodeURIComponent(order.id)}"
         style="display:inline-block;background:#14110d;color:#f7f3ec;padding:16px 36px;text-decoration:none;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;font-weight:500;">
        Suivre ma commande
      </a>
    </div>
  `;
  await safeSend({
    from: FROM,
    to: order.shipping_email,
    subject: `${label} · ${order.id}`,
    html: layout(label, inner, label),
  });
}
