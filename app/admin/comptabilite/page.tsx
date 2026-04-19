import { createAdminClient } from '@/lib/supabase/admin';
import { fmt } from '@/lib/format';
import { PeriodPicker } from './_period-picker';
import { ChartBar } from '@/components/chart-bar';

export const dynamic = 'force-dynamic';

type Range = { label: string; from: Date; to: Date };

function presetRange(preset: string): Range {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  switch (preset) {
    case 'today':
      return { label: "Aujourd'hui", from: start, to: end };
    case 'yesterday': {
      const y = new Date(start); y.setDate(y.getDate() - 1);
      const ye = new Date(end); ye.setDate(ye.getDate() - 1);
      return { label: 'Hier', from: y, to: ye };
    }
    case '7d': {
      const f = new Date(start); f.setDate(f.getDate() - 6);
      return { label: '7 derniers jours', from: f, to: end };
    }
    case '30d': {
      const f = new Date(start); f.setDate(f.getDate() - 29);
      return { label: '30 derniers jours', from: f, to: end };
    }
    case 'mtd': {
      const f = new Date(start); f.setDate(1);
      return { label: 'Ce mois-ci', from: f, to: end };
    }
    case 'last_month': {
      const f = new Date(start.getFullYear(), start.getMonth() - 1, 1);
      const e = new Date(start.getFullYear(), start.getMonth(), 0, 23, 59, 59, 999);
      return { label: 'Mois dernier', from: f, to: e };
    }
    case 'ytd': {
      const f = new Date(start.getFullYear(), 0, 1);
      return { label: 'Cette année', from: f, to: end };
    }
    default: {
      const f = new Date(start); f.setDate(f.getDate() - 29);
      return { label: '30 derniers jours', from: f, to: end };
    }
  }
}

function previousRange(r: Range): Range {
  const span = r.to.getTime() - r.from.getTime();
  return {
    label: 'Période précédente',
    from: new Date(r.from.getTime() - span - 1),
    to: new Date(r.from.getTime() - 1),
  };
}

async function fetchOrders(sb: ReturnType<typeof createAdminClient>, from: Date, to: Date) {
  const { data } = await sb
    .from('orders')
    .select('id, total, subtotal, delivery, discount, status, payment_method, created_at, order_items(product_id, name, price, qty)')
    .gte('created_at', from.toISOString())
    .lte('created_at', to.toISOString())
    .in('status', ['paid', 'preparing', 'shipped', 'delivered']);
  return data ?? [];
}

function aggregate(orders: Array<{ total: number; discount?: number | null; delivery: number }>) {
  const gross = orders.reduce((s, o) => s + (o.total || 0), 0);
  const discount = orders.reduce((s, o) => s + (o.discount || 0), 0);
  const delivery = orders.reduce((s, o) => s + (o.delivery || 0), 0);
  const count = orders.length;
  const aov = count > 0 ? Math.round(gross / count) : 0;
  return { gross, discount, delivery, count, aov };
}

function dailyBuckets(orders: Array<{ created_at: string; total: number }>, from: Date, to: Date) {
  const days = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / (24 * 3600 * 1000)));
  const labels: { label: string; value: number }[] = [];
  const dayMs = 24 * 3600 * 1000;
  for (let i = 0; i < days; i++) {
    const d = new Date(from.getTime() + i * dayMs);
    const label = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    const next = new Date(d.getTime() + dayMs);
    const value = orders
      .filter(o => { const t = new Date(o.created_at).getTime(); return t >= d.getTime() && t < next.getTime(); })
      .reduce((s, o) => s + (o.total || 0), 0);
    labels.push({ label, value });
  }
  return labels.slice(-30); // cap to last 30 bars on large ranges
}

function topProducts(orders: Array<{ order_items: Array<{ product_id: string | null; name: string; price: number; qty: number }> | null }>) {
  const map = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const o of orders) {
    for (const it of o.order_items ?? []) {
      const key = it.product_id ?? it.name;
      const prev = map.get(key) ?? { name: it.name, qty: 0, revenue: 0 };
      prev.qty += it.qty;
      prev.revenue += it.qty * it.price;
      map.set(key, prev);
    }
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
}

function deltaPct(current: number, previous: number): { pct: number; up: boolean } {
  if (previous === 0) return { pct: current > 0 ? 100 : 0, up: current > 0 };
  const d = ((current - previous) / previous) * 100;
  return { pct: Math.abs(d), up: d >= 0 };
}

export default async function AccountingPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const params = await searchParams;
  const preset = params.p ?? '30d';
  const current = presetRange(preset);
  const previous = previousRange(current);

  const sb = createAdminClient();
  const [currentOrders, previousOrders] = await Promise.all([
    fetchOrders(sb, current.from, current.to),
    fetchOrders(sb, previous.from, previous.to),
  ]);

  const agg = aggregate(currentOrders);
  const prev = aggregate(previousOrders);
  const daily = dailyBuckets(currentOrders, current.from, current.to);
  const dailyCount = currentOrders.reduce<Record<string, number>>((acc, o) => {
    const k = new Date(o.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
  const dailyCountArr = daily.map(d => ({ label: d.label, value: dailyCount[d.label] ?? 0 }));
  const top = topProducts(currentOrders);

  // Payment method breakdown
  const byMethod = currentOrders.reduce<Record<string, number>>((acc, o) => {
    const k = (o as { payment_method?: string }).payment_method ?? 'other';
    acc[k] = (acc[k] ?? 0) + (o.total || 0);
    return acc;
  }, {});

  return (
    <div>
      <div className="admin-page-head">
        <h1>Comptabilité</h1>
        <p className="mute">
          Période : <strong>{current.label}</strong>{' '}
          <span style={{ fontSize: 11, letterSpacing: '.1em', color: 'var(--ink-mute)' }}>
            ({current.from.toLocaleDateString('fr-FR')} → {current.to.toLocaleDateString('fr-FR')})
          </span>
        </p>
      </div>

      <PeriodPicker current={preset}/>

      <div className="admin-stats">
        <KpiCard label="Chiffre d'affaires" value={fmt(agg.gross)} delta={deltaPct(agg.gross, prev.gross)}/>
        <KpiCard label="Commandes" value={agg.count.toString()} delta={deltaPct(agg.count, prev.count)}/>
        <KpiCard label="Panier moyen" value={fmt(agg.aov)} delta={deltaPct(agg.aov, prev.aov)}/>
        <KpiCard label="Remises accordées" value={fmt(agg.discount)} delta={deltaPct(agg.discount, prev.discount)} invertColor/>
      </div>

      <div className="admin-stats mt-6">
        <KpiCard label="Livraisons encaissées" value={fmt(agg.delivery)} delta={deltaPct(agg.delivery, prev.delivery)}/>
        <KpiCard label="Total période précédente" value={fmt(prev.gross)}/>
        <KpiCard label="Diff absolue" value={(agg.gross >= prev.gross ? '+' : '−') + fmt(Math.abs(agg.gross - prev.gross))}/>
        <KpiCard label="Catégorie top" value={top[0]?.name?.slice(0, 18) ?? '—'}/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }} className="mt-6 grid-form">
        <div className="admin-card">
          <ChartBar label={`Ventes — ${current.label}`} data={daily} format={n => n >= 1000 ? `${Math.round(n/1000)}k` : n.toString()}/>
        </div>
        <div className="admin-card">
          <ChartBar label={`Commandes — ${current.label}`} data={dailyCountArr}/>
        </div>
      </div>

      <div className="admin-card mt-6">
        <h2 className="serif" style={{ fontSize: 20, fontWeight: 400, marginBottom: 16 }}>Top produits (par CA)</h2>
        <table className="admin-table">
          <thead><tr><th>#</th><th>Produit</th><th>Quantité</th><th>Revenus</th></tr></thead>
          <tbody>
            {top.map((p, i) => (
              <tr key={i}>
                <td className="mute" style={{ fontFamily: 'var(--font-serif)', fontSize: 16 }}>0{i + 1}</td>
                <td style={{ fontWeight: 500 }}>{p.name}</td>
                <td className="mute">× {p.qty}</td>
                <td style={{ fontWeight: 500 }}>{fmt(p.revenue)}</td>
              </tr>
            ))}
            {top.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40 }}><p className="mute">Aucune vente sur la période.</p></td></tr>}
          </tbody>
        </table>
      </div>

      <div className="admin-card mt-6">
        <h2 className="serif" style={{ fontSize: 20, fontWeight: 400, marginBottom: 16 }}>Répartition par moyen de paiement</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.entries(byMethod).map(([method, amount]) => {
            const pct = agg.gross > 0 ? (amount / agg.gross) * 100 : 0;
            return (
              <div key={method}>
                <div className="row between mb-2" style={{ fontSize: 13 }}>
                  <span style={{ fontWeight: 500 }}>{method.toUpperCase()}</span>
                  <span>{fmt(amount)} <span className="mute">({pct.toFixed(0)}%)</span></span>
                </div>
                <div style={{ height: 6, background: 'var(--ivory-2)', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'var(--ink)', transition: 'width .3s' }}/>
                </div>
              </div>
            );
          })}
          {Object.keys(byMethod).length === 0 && <p className="mute">Aucune donnée.</p>}
        </div>
      </div>

      <div className="admin-card mt-6" style={{ fontSize: 12, color: 'var(--ink-mute)', lineHeight: 1.6 }}>
        <strong>Notes comptables</strong> — Les montants incluent uniquement les commandes avec statut <code>paid</code>, <code>preparing</code>, <code>shipped</code>, <code>delivered</code>. Les <code>pending</code> (en attente de paiement) et <code>cancelled</code> / <code>refunded</code> ne sont pas comptabilisées. Export CSV via <code>/api/v1/orders?since={'{ISO}'}</code> pour ton comptable.
      </div>
    </div>
  );
}

function KpiCard({ label, value, delta, invertColor }: { label: string; value: string; delta?: { pct: number; up: boolean }; invertColor?: boolean }) {
  const isPositive = invertColor ? !delta?.up : delta?.up;
  return (
    <div className="admin-card">
      <div className="caps mute" style={{ fontSize: 10 }}>{label}</div>
      <div className="serif" style={{ fontSize: 26, fontWeight: 400, marginTop: 8, lineHeight: 1.1 }}>{value}</div>
      {delta && (
        <div style={{ fontSize: 12, marginTop: 6, color: isPositive ? '#0d6534' : '#a63d2a', letterSpacing: '.04em' }}>
          {delta.up ? '↑' : '↓'} {delta.pct.toFixed(1)}% <span className="mute">vs période précédente</span>
        </div>
      )}
    </div>
  );
}
