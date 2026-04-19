import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { fmt } from '@/lib/format';

export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<string, string> = {
  pending: 'En attente',
  paid: 'Payée',
  preparing: 'En préparation',
  shipped: 'En route',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
};

export default async function AdminOrdersPage() {
  const sb = createAdminClient();
  const { data: orders, error } = await sb
    .from('orders')
    .select('id, status, total, payment_method, shipping_name, shipping_city, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div>
      <div className="admin-page-head">
        <h1>Commandes</h1>
        <p className="mute">{orders?.length ?? 0} commande{(orders?.length ?? 0) > 1 ? 's' : ''}</p>
      </div>

      {error && <div className="admin-card" style={{ color: '#a63d2a' }}>{error.message}</div>}

      <div className="admin-card" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Date</th>
              <th>Client</th>
              <th>Paiement</th>
              <th>Total</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders?.map(o => (
              <tr key={o.id}>
                <td className="mono">{o.id}</td>
                <td className="mute" style={{ fontSize: 12 }}>{new Date(o.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                <td>
                  <div>{o.shipping_name}</div>
                  <div className="mute" style={{ fontSize: 12 }}>{o.shipping_city}</div>
                </td>
                <td className="mute" style={{ fontSize: 13 }}>{o.payment_method?.toUpperCase()}</td>
                <td style={{ fontWeight: 500 }}>{fmt(o.total)}</td>
                <td><span className="admin-badge">{STATUS_LABEL[o.status] ?? o.status}</span></td>
                <td><Link className="btn btn-outline btn-sm" href={`/admin/commandes/${o.id}`}>Voir</Link></td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 60 }}><p className="mute">Aucune commande pour l&apos;instant.</p></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
