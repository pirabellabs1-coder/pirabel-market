import { Resend } from 'resend';
import { fmt } from './format';

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

const FROM = 'Pirabel <onboarding@resend.dev>'; // replace with verified domain later
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'pirabellabs@gmail.com';

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
      <td style="padding:12px 0;border-bottom:1px solid #e4dccd;">
        <div style="font-family:Georgia,serif;font-size:15px;color:#14110d;">${escape(it.name)}</div>
        <div style="color:#6b6459;font-size:12px;margin-top:2px;">× ${it.qty}${it.size ? ` · ${escape(it.size)}` : ''}${it.color ? ` · ${escape(it.color)}` : ''}</div>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #e4dccd;text-align:right;font-size:13px;color:#2c2821;">${fmt(it.price * it.qty)}</td>
    </tr>
  `).join('');
}

function layout(title: string, innerHtml: string): string {
  return `<!DOCTYPE html><html lang="fr"><body style="margin:0;padding:0;background:#f7f3ec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#14110d;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f3ec;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fdfbf7;border:1px solid #e4dccd;">
          <tr><td style="padding:36px 40px;text-align:center;border-bottom:1px solid #e4dccd;">
            <div style="font-family:Georgia,serif;font-size:28px;letter-spacing:0.04em;color:#14110d;">Pirabel</div>
            <div style="font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#6b6459;margin-top:4px;">Cotonou · Est. 2026</div>
          </td></tr>
          <tr><td style="padding:40px;">${innerHtml}</td></tr>
          <tr><td style="padding:24px 40px;background:#14110d;color:#f7f3ec;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;text-align:center;">
            © 2026 Pirabel · Haie Vive, Cotonou · Bénin
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
  const inner = `
    <div style="font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:#6b6459;margin-bottom:8px;">Confirmation de commande</div>
    <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;margin:0 0 8px;color:#14110d;">Merci ${escape(order.shipping_name.split(' ')[0] || '')}.</h1>
    <p style="font-size:14px;line-height:1.6;color:#2c2821;margin:0 0 24px;">Votre commande <strong style="font-family:monospace;">${escape(order.id)}</strong> est bien reçue. Nous la préparons avec soin — vous recevrez un message dès qu&apos;elle partira en livraison.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${itemsHtml(order.items)}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#2c2821;">
      <tr><td>Sous-total</td><td align="right">${fmt(order.subtotal)}</td></tr>
      <tr><td>Livraison</td><td align="right">${order.delivery === 0 ? 'Offerte' : fmt(order.delivery)}</td></tr>
      <tr><td style="padding-top:12px;border-top:1px solid #e4dccd;font-weight:500;font-size:14px;">Total</td>
          <td style="padding-top:12px;border-top:1px solid #e4dccd;font-weight:500;font-size:14px;" align="right">${fmt(order.total)}</td></tr>
    </table>

    <div style="margin-top:32px;padding:20px;background:#ede7dc;">
      <div style="font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#6b6459;margin-bottom:8px;">Livraison</div>
      <div>${escape(order.shipping_name)} · ${escape(order.shipping_phone)}</div>
      <div style="color:#6b6459;font-size:13px;margin-top:4px;">${[order.shipping_zone, order.shipping_city].filter((x): x is string => !!x).map(escape).join(', ')}</div>
      ${order.shipping_address ? `<div style="color:#6b6459;font-size:13px;">${escape(order.shipping_address)}</div>` : ''}
      <div style="margin-top:12px;font-size:12px;color:#6b6459;">Paiement : ${escape(PAY_LABEL[order.payment_method] ?? order.payment_method)}</div>
    </div>

    <div style="margin-top:32px;text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://pirabel-market.vercel.app'}/suivi?id=${encodeURIComponent(order.id)}"
         style="display:inline-block;background:#14110d;color:#f7f3ec;padding:14px 28px;text-decoration:none;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;">
        Suivre ma commande
      </a>
    </div>

    <p style="margin-top:32px;font-size:12px;color:#9c9589;line-height:1.6;">Une question ? Réponds à cet email ou contacte-nous sur WhatsApp au +229 01 97 12 34 56.</p>
  `;

  const html = layout('Commande confirmée', inner);

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
      <div style="font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:#6b6459;margin-bottom:8px;">Nouvelle commande</div>
      <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:400;margin:0 0 16px;">${escape(order.id)} — ${fmt(order.total)}</h1>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemsHtml(order.items)}</table>
      <div style="margin-top:24px;padding:16px;background:#ede7dc;">
        <div style="font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#6b6459;margin-bottom:4px;">Client</div>
        <div>${escape(order.shipping_name)} · ${escape(order.shipping_phone)}${order.shipping_email ? ` · ${escape(order.shipping_email)}` : ''}</div>
        <div style="color:#6b6459;font-size:13px;margin-top:4px;">${[order.shipping_zone, order.shipping_city, order.shipping_address].filter((x): x is string => !!x).map(escape).join(' · ')}</div>
        <div style="margin-top:8px;font-size:12px;">Paiement : ${escape(PAY_LABEL[order.payment_method] ?? order.payment_method)}</div>
      </div>
      <div style="margin-top:24px;text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://pirabel-market.vercel.app'}/admin/commandes/${encodeURIComponent(order.id)}"
           style="display:inline-block;background:#14110d;color:#f7f3ec;padding:12px 24px;text-decoration:none;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;">
          Voir dans l'admin
        </a>
      </div>
    `),
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

  const inner = `
    <div style="font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:#6b6459;margin-bottom:8px;">${escape(label)}</div>
    <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:400;margin:0 0 12px;">${escape(label)}.</h1>
    <p style="font-size:14px;color:#2c2821;line-height:1.6;">Votre commande <strong style="font-family:monospace;">${escape(order.id)}</strong> vient de passer à l&apos;état <strong>${escape(label)}</strong>.</p>
    <div style="margin-top:24px;text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://pirabel-market.vercel.app'}/suivi?id=${encodeURIComponent(order.id)}"
         style="display:inline-block;background:#14110d;color:#f7f3ec;padding:12px 24px;text-decoration:none;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;">
        Suivre ma commande
      </a>
    </div>
  `;
  await safeSend({
    from: FROM,
    to: order.shipping_email,
    subject: `${label} · ${order.id}`,
    html: layout(label, inner),
  });
}
