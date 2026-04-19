import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { fmt } from '@/lib/format';
import { StatusUpdater } from './_status-updater';

export const dynamic = 'force-dynamic';

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = createAdminClient();

  const [{ data: order }, { data: items }] = await Promise.all([
    sb.from('orders').select('*').eq('id', id).maybeSingle(),
    sb.from('order_items').select('*').eq('order_id', id),
  ]);

  if (!order) notFound();

  return (
    <div>
      <div className="admin-page-head row between wrap gap-4">
        <div>
          <h1 className="mono">{order.id}</h1>
          <p className="mute">{new Date(order.created_at).toLocaleString('fr-FR')}</p>
        </div>
        <Link className="btn btn-ghost" href="/admin/commandes">← Toutes les commandes</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }} className="grid-form">
        <div className="admin-card">
          <h2 className="serif" style={{ fontSize: 20, fontWeight: 400, marginBottom: 16 }}>Articles</h2>
          <table className="admin-table">
            <thead><tr><th></th><th>Article</th><th>Qté</th><th>Prix</th><th>Sous-total</th></tr></thead>
            <tbody>
              {items?.map(it => (
                <tr key={it.id}>
                  <td>{it.img && <div style={{ width: 40, height: 40, overflow: 'hidden' }}><img src={it.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/></div>}</td>
                  <td>
                    <div>{it.name}</div>
                    <div className="mute" style={{ fontSize: 12 }}>
                      {[it.size, it.color].filter(Boolean).join(' · ')}
                    </div>
                  </td>
                  <td>× {it.qty}</td>
                  <td>{fmt(it.price)}</td>
                  <td>{fmt(it.price * it.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-6" style={{ borderTop: '1px solid var(--line)', paddingTop: 16, maxWidth: 320, marginLeft: 'auto' }}>
            <div className="row between mb-2"><span className="mute">Sous-total</span><span>{fmt(order.subtotal)}</span></div>
            <div className="row between mb-2"><span className="mute">Livraison</span><span>{order.delivery === 0 ? 'Offerte' : fmt(order.delivery)}</span></div>
            <div className="row between" style={{ paddingTop: 8, borderTop: '1px solid var(--line)', fontWeight: 500 }}>
              <span>Total</span><span>{fmt(order.total)}</span>
            </div>
          </div>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="admin-card">
            <div className="caps mute mb-2" style={{ fontSize: 10 }}>Statut</div>
            <StatusUpdater id={order.id} current={order.status}/>
          </div>

          <div className="admin-card">
            <div className="caps mute mb-2" style={{ fontSize: 10 }}>Livraison</div>
            <div>{order.shipping_name}</div>
            <div className="mute" style={{ fontSize: 13 }}>{order.shipping_phone}</div>
            {order.shipping_email && <div className="mute" style={{ fontSize: 13 }}>{order.shipping_email}</div>}
            <div className="mt-2" style={{ fontSize: 13 }}>{[order.shipping_zone, order.shipping_city].filter(Boolean).join(', ')}</div>
            {order.shipping_address && <div className="mute" style={{ fontSize: 13 }}>{order.shipping_address}</div>}
          </div>

          <div className="admin-card">
            <div className="caps mute mb-2" style={{ fontSize: 10 }}>Paiement</div>
            <div>{order.payment_method?.toUpperCase()}</div>
            {order.payment_ref && <div className="mute mono" style={{ fontSize: 12 }}>{order.payment_ref}</div>}
          </div>
        </aside>
      </div>
    </div>
  );
}
