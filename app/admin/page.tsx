import { createAdminClient } from '@/lib/supabase/admin';
import { fmt } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const sb = createAdminClient();

  const [prodCount, orderCount, pendingCount, todayRevenue] = await Promise.all([
    sb.from('products').select('id', { count: 'exact', head: true }).then(r => r.count ?? 0),
    sb.from('orders').select('id', { count: 'exact', head: true }).then(r => r.count ?? 0),
    sb.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending').then(r => r.count ?? 0),
    sb.from('orders').select('total').gte('created_at', new Date(Date.now() - 24*3600*1000).toISOString()).then(r => (r.data ?? []).reduce((s, o) => s + (o.total || 0), 0)),
  ]);

  return (
    <div>
      <div className="admin-page-head">
        <h1>Tableau de bord</h1>
        <p className="mute">Vue d&apos;ensemble de ton activité.</p>
      </div>

      <div className="admin-stats">
        <Stat label="Produits" value={prodCount.toString()}/>
        <Stat label="Commandes totales" value={orderCount.toString()}/>
        <Stat label="En attente" value={pendingCount.toString()}/>
        <Stat label="Ventes 24h" value={fmt(todayRevenue)}/>
      </div>

      <div className="admin-card mt-8">
        <h2 className="serif" style={{ fontSize: 20, fontWeight: 400, marginBottom: 8 }}>Prochaines étapes</h2>
        <ol style={{ marginLeft: 20, fontSize: 14, lineHeight: 1.8, color: 'var(--ink-soft)' }}>
          <li>Remplacer les photos Unsplash par tes vraies photos produits</li>
          <li>Ajuster les prix et descriptions dans l&apos;onglet <strong>Produits</strong></li>
          <li>Créer tes propres catégories si besoin dans <strong>Catégories</strong></li>
          <li>Activer le paiement Kkiapay (phase 3)</li>
        </ol>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="admin-card">
      <div className="caps mute" style={{ fontSize: 10 }}>{label}</div>
      <div className="serif" style={{ fontSize: 32, fontWeight: 400, marginTop: 8 }}>{value}</div>
    </div>
  );
}
