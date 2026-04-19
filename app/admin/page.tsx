import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { fmt } from '@/lib/format';
import { ChartBar } from '@/components/chart-bar';

export const dynamic = 'force-dynamic';

function dayLabel(d: Date): string {
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}
function shortDayLabel(d: Date): string {
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  return days[d.getDay()];
}

export default async function AdminDashboard() {
  const sb = createAdminClient();
  const since24h = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const since30d = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  const since7d = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

  const [
    prodCount, orderCount, pendingOrders, revenue24h, revenue30d,
    pendingReviews, subsCount, lowStock, ordersLast7,
  ] = await Promise.all([
    sb.from('products').select('id', { count: 'exact', head: true }).then(r => r.count ?? 0),
    sb.from('orders').select('id', { count: 'exact', head: true }).then(r => r.count ?? 0),
    sb.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending').then(r => r.count ?? 0),
    sb.from('orders').select('total').gte('created_at', since24h).then(r => (r.data ?? []).reduce((s, o) => s + (o.total || 0), 0)),
    sb.from('orders').select('total').gte('created_at', since30d).then(r => (r.data ?? []).reduce((s, o) => s + (o.total || 0), 0)),
    sb.from('reviews').select('id', { count: 'exact', head: true }).eq('approved', false).then(r => r.count ?? 0),
    sb.from('newsletter').select('email', { count: 'exact', head: true }).then(r => r.count ?? 0),
    sb.from('products').select('id, name_fr, stock').gte('stock', 0).lte('stock', 5).order('stock').limit(10).then(r => r.data ?? []),
    sb.from('orders').select('total, created_at').gte('created_at', since7d).then(r => r.data ?? []),
  ]);

  // Build 7-day aggregates (count + revenue)
  const now = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const countPerDay = days.map(d => {
    const next = new Date(d); next.setDate(next.getDate() + 1);
    return {
      label: shortDayLabel(d),
      value: (ordersLast7 ?? []).filter(o => {
        const ts = new Date(o.created_at).getTime();
        return ts >= d.getTime() && ts < next.getTime();
      }).length,
    };
  });
  const revenuePerDay = days.map(d => {
    const next = new Date(d); next.setDate(next.getDate() + 1);
    return {
      label: shortDayLabel(d),
      value: (ordersLast7 ?? []).filter(o => {
        const ts = new Date(o.created_at).getTime();
        return ts >= d.getTime() && ts < next.getTime();
      }).reduce((s, o) => s + (o.total || 0), 0),
    };
  });

  const recentOrders = await sb
    .from('orders')
    .select('id, status, total, shipping_name, created_at')
    .order('created_at', { ascending: false })
    .limit(5)
    .then(r => r.data ?? []);

  return (
    <div>
      <div className="admin-page-head">
        <h1>Tableau de bord</h1>
        <p className="mute">Vue d&apos;ensemble de ton activité.</p>
      </div>

      <div className="admin-stats">
        <Stat label="Produits" value={prodCount.toString()} href="/admin/produits"/>
        <Stat label="Commandes totales" value={orderCount.toString()} href="/admin/commandes"/>
        <Stat label="En attente" value={pendingOrders.toString()} href="/admin/commandes" accent={pendingOrders > 0}/>
        <Stat label="Ventes 24h" value={fmt(revenue24h)}/>
      </div>

      <div className="admin-stats mt-6">
        <Stat label="Ventes 30 jours" value={fmt(revenue30d)}/>
        <Stat label="Avis à modérer" value={pendingReviews.toString()} href="/admin/avis" accent={pendingReviews > 0}/>
        <Stat label="Abonnés newsletter" value={subsCount.toString()} href="/admin/newsletter"/>
        <Stat label="Stock faible" value={lowStock.length.toString()} accent={lowStock.length > 0}/>
      </div>

      {/* Graphs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }} className="mt-6 grid-form">
        <div className="admin-card">
          <ChartBar label="Commandes (7 derniers jours)" data={countPerDay}/>
        </div>
        <div className="admin-card">
          <ChartBar label="Ventes (FCFA, 7 derniers jours)" data={revenuePerDay} format={n => n >= 1000 ? `${Math.round(n/1000)}k` : n.toString()}/>
        </div>
      </div>

      {/* Low stock */}
      {lowStock.length > 0 && (
        <div className="admin-card mt-6">
          <div className="row between mb-4">
            <h2 className="serif" style={{ fontSize: 20, fontWeight: 400, margin: 0 }}>⚠️ Stock faible ou épuisé</h2>
            <Link href="/admin/produits" className="mute" style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase' }}>Gérer →</Link>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {lowStock.map(p => (
              <li key={p.id} className="row between" style={{ padding: '8px 12px', background: p.stock === 0 ? '#fce8e8' : 'var(--ivory-2)', fontSize: 13 }}>
                <Link href={`/admin/produits/${p.id}`} style={{ color: 'var(--ink)' }}>{p.name_fr}</Link>
                <span style={{ fontFamily: 'monospace', color: p.stock === 0 ? '#8b1f1f' : 'var(--ink)' }}>{p.stock === 0 ? 'Rupture' : `${p.stock} restants`}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="admin-card mt-6">
        <div className="row between mb-4">
          <h2 className="serif" style={{ fontSize: 20, fontWeight: 400, margin: 0 }}>Dernières commandes</h2>
          <Link href="/admin/commandes" className="mute" style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase' }}>Tout voir →</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="mute">Aucune commande pour l&apos;instant.</p>
        ) : (
          <table className="admin-table">
            <thead><tr><th>№</th><th>Client</th><th>Total</th><th>Statut</th><th>Date</th></tr></thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id}>
                  <td className="mono"><Link href={`/admin/commandes/${o.id}`}>{o.id}</Link></td>
                  <td>{o.shipping_name}</td>
                  <td>{fmt(o.total)}</td>
                  <td><span className="admin-badge">{o.status}</span></td>
                  <td className="mute" style={{ fontSize: 12 }}>{dayLabel(new Date(o.created_at))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, href, accent }: { label: string; value: string; href?: string; accent?: boolean }) {
  const content = (
    <div className="admin-card" style={{ ...(accent ? { background: '#fff3cd' } : {}), height: '100%' }}>
      <div className="caps mute" style={{ fontSize: 10 }}>{label}</div>
      <div className="serif" style={{ fontSize: 30, fontWeight: 400, marginTop: 8 }}>{value}</div>
    </div>
  );
  return href ? <Link href={href} style={{ display: 'block' }}>{content}</Link> : content;
}
