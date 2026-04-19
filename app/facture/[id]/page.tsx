import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { fmt } from '@/lib/format';
import { BRAND } from '@/lib/brand';
import { PrintButton } from './_print-button';

export const dynamic = 'force-dynamic';

const PAY_LABEL: Record<string, string> = {
  mtn: 'MTN Mobile Money', moov: 'Moov Money', celtiis: 'Celtiis Cash',
  card: 'Carte bancaire', cod: 'Paiement à la livraison',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'En attente', paid: 'Payée', preparing: 'En préparation',
  shipped: 'En route', delivered: 'Livrée', cancelled: 'Annulée', refunded: 'Remboursée',
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `Facture ${id}`,
    description: `Facture Pirabel — commande ${id}`,
    robots: { index: false, follow: false },
  };
}

export default async function PublicInvoice({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = createAdminClient();

  const [{ data: order }, { data: items }] = await Promise.all([
    sb.from('orders').select('*').eq('id', id).maybeSingle(),
    sb.from('order_items').select('*').eq('order_id', id),
  ]);

  if (!order) notFound();

  const createdAt = new Date(order.created_at);
  const invoiceNumber = `FAC-${order.id.replace('PB-', '')}`;
  const date = createdAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const isPaid = ['paid', 'preparing', 'shipped', 'delivered'].includes(order.status);

  return (
    <>
      <div className="invoice-actions">
        <PrintButton/>
      </div>

      <div className="invoice-sheet">
        <div className="inv-head">
          <div>
            <div className="inv-brand">Pirabel</div>
            <div className="inv-brand-sub">Maison · Cotonou · Est. 2026</div>
            <div style={{ fontSize: 12, color: '#6b6459', marginTop: 16, lineHeight: 1.6 }}>
              {BRAND.address}<br/>
              {BRAND.country}<br/>
              {BRAND.contactEmail}<br/>
              {BRAND.phoneDisplay}
            </div>
          </div>
          <div className="inv-meta">
            <div style={{ fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase', color: '#6b6459' }}>Facture</div>
            <div className="num">{invoiceNumber}</div>
            <div style={{ marginTop: 20, fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: '#6b6459' }}>Date</div>
            <div style={{ fontSize: 13 }}>{date}</div>
            <div style={{ marginTop: 14, fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: '#6b6459' }}>Commande</div>
            <div className="num" style={{ fontSize: 13 }}>{order.id}</div>
            <div style={{ marginTop: 14, fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: '#6b6459' }}>Statut</div>
            <div style={{ fontSize: 12, padding: '6px 10px', display: 'inline-block',
              background: isPaid ? '#e7f3ea' : order.payment_method === 'cod' ? '#fff4e0' : '#fde7e7',
              color: isPaid ? '#0d6534' : order.payment_method === 'cod' ? '#7a4d00' : '#7a1f1f',
              marginTop: 4, borderRadius: 2 }}>
              {STATUS_LABEL[order.status] ?? order.status}
            </div>
          </div>
        </div>

        <div className="inv-parties">
          <div>
            <div className="caps">Facturée à</div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{order.shipping_name}</div>
            <div style={{ color: '#6b6459' }}>{order.shipping_phone}</div>
            {order.shipping_email && <div style={{ color: '#6b6459' }}>{order.shipping_email}</div>}
          </div>
          <div>
            <div className="caps">Livraison</div>
            <div>{[order.shipping_zone, order.shipping_city].filter(Boolean).join(', ')}</div>
            {order.shipping_address && <div style={{ color: '#6b6459' }}>{order.shipping_address}</div>}
            <div style={{ marginTop: 12, fontSize: 11, color: '#6b6459' }}>Paiement : <strong>{PAY_LABEL[order.payment_method] ?? order.payment_method}</strong></div>
          </div>
        </div>

        <table className="inv-table">
          <thead>
            <tr><th>Article</th><th style={{ textAlign: 'center' }}>Qté</th><th style={{ textAlign: 'right' }}>P.U.</th><th style={{ textAlign: 'right' }}>Total</th></tr>
          </thead>
          <tbody>
            {(items ?? []).map(it => (
              <tr key={it.id}>
                <td>
                  <div style={{ fontWeight: 500 }}>{it.name}</div>
                  {(it.size || it.color) && <div style={{ fontSize: 11, color: '#6b6459', marginTop: 2 }}>{[it.size, it.color].filter(Boolean).join(' · ')}</div>}
                </td>
                <td style={{ textAlign: 'center' }}>{it.qty}</td>
                <td style={{ textAlign: 'right' }}>{fmt(it.price)}</td>
                <td style={{ textAlign: 'right', fontWeight: 500 }}>{fmt(it.price * it.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="inv-totals">
          <div><span>Sous-total</span><span>{fmt(order.subtotal)}</span></div>
          {order.discount > 0 && (
            <div><span>Remise{order.promo_code ? ` (${order.promo_code})` : ''}</span><span style={{ color: '#8a6b3a' }}>−{fmt(order.discount)}</span></div>
          )}
          <div><span>Livraison</span><span>{order.delivery === 0 ? 'Offerte' : fmt(order.delivery)}</span></div>
          <div className="total"><span>Total TTC</span><span>{fmt(order.total)}</span></div>
        </div>

        <div className="inv-footer">
          <p><strong>Mentions légales :</strong> Pirabel, {BRAND.address}, {BRAND.country}. (Ajouter IFU + RCCM une fois obtenus.)</p>
          <p>TVA non applicable — article 293 B du Code Général des Impôts (ou à adapter selon ton régime fiscal).</p>
          <p>Les produits restent propriété du Vendeur jusqu&apos;au complet paiement du prix.</p>
          <p>En cas de retard de paiement, des pénalités au taux légal sont exigibles.</p>
          <p style={{ marginTop: 12, textAlign: 'center', fontStyle: 'italic' }}>Merci de votre confiance — pirabel-one.store</p>
        </div>
      </div>
    </>
  );
}
