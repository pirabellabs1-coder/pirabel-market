'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SimplePage } from '@/components/simple-page';
import { useStore } from '@/components/store-provider';
import { fmt } from '@/lib/format';

type OrderLookup = {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  delivery: number;
  payment_method: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_city: string;
  shipping_zone: string | null;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  items: { name: string; img: string | null; price: number; qty: number; size: string | null; color: string | null }[];
};

const STATUS_LABELS: Record<string, { fr: string; en: string }> = {
  pending:    { fr: 'En attente',    en: 'Pending' },
  paid:       { fr: 'Payée',         en: 'Paid' },
  preparing:  { fr: 'En préparation',en: 'Preparing' },
  shipped:    { fr: 'En route',      en: 'In transit' },
  delivered:  { fr: 'Livrée',        en: 'Delivered' },
  cancelled:  { fr: 'Annulée',       en: 'Cancelled' },
  refunded:   { fr: 'Remboursée',    en: 'Refunded' },
};

function TrackContent() {
  const search = useSearchParams();
  const { lang } = useStore();
  const [query, setQuery] = useState(search.get('id') ?? '');
  const [order, setOrder] = useState<OrderLookup | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doLookup = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true); setError(null); setOrder(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(id.trim())}`);
      if (res.status === 404) throw new Error(lang === 'fr' ? 'Commande introuvable' : 'Order not found');
      if (!res.ok) throw new Error(lang === 'fr' ? 'Erreur de chargement' : 'Failed to load');
      setOrder(await res.json());
    } catch (e) {
      setError((e as Error).message);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const pre = search.get('id');
    if (pre) { setQuery(pre); doLookup(pre); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = order ? buildSteps(order, lang) : null;

  return (
    <SimplePage title={lang === 'fr' ? 'Suivre votre commande' : 'Track your order'} eyebrow={lang === 'fr' ? 'Suivi' : 'Tracking'}>
      <form className="row gap-3 mb-8" style={{ maxWidth: 560 }} onSubmit={e => { e.preventDefault(); doLookup(query); }}>
        <input className="input" placeholder="PB-XXXXXX" style={{ flex: 1 }} value={query} onChange={e => setQuery(e.target.value)}/>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? '…' : lang === 'fr' ? 'Suivre' : 'Track'}
        </button>
      </form>

      {error && <p style={{ color: '#a63d2a', marginBottom: 24 }}>{error}</p>}

      {order && (
        <div style={{ padding: 'clamp(20px, 4vw, 32px)', background: 'var(--ivory-2)' }}>
          <div className="row between wrap gap-4 mb-6">
            <div>
              <div className="caps mute mb-2">{lang === 'fr' ? 'Commande' : 'Order'}</div>
              <div className="mono">{order.id}</div>
            </div>
            <div>
              <div className="caps mute mb-2">{lang === 'fr' ? 'Total' : 'Total'}</div>
              <div className="serif" style={{ fontSize: 20 }}>{fmt(order.total)}</div>
            </div>
            <span style={{ padding: '8px 16px', background: 'var(--ink)', color: 'var(--ivory)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase' }}>
              {STATUS_LABELS[order.status]?.[lang] ?? order.status}
            </span>
          </div>

          <div style={{ position: 'relative', paddingLeft: 32 }}>
            <div style={{ position: 'absolute', left: 7, top: 6, bottom: 6, width: 1, background: 'var(--line)' }}/>
            {steps!.map((s, i) => (
              <div key={i} style={{ paddingBottom: 20, position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: -25, top: 4, width: 15, height: 15, borderRadius: 999,
                  background: s.active || s.done ? 'var(--ink)' : 'var(--ivory)',
                  border: '1px solid var(--ink)',
                }}/>
                <div style={{ fontSize: 14, fontWeight: s.active ? 500 : 400, color: s.done || s.active ? 'var(--ink)' : 'var(--ink-faint)' }}>{s.t}</div>
                <div className="mute" style={{ fontSize: 12, marginTop: 2 }}>{s.d}</div>
              </div>
            ))}
          </div>

          <div className="mt-8" style={{ borderTop: '1px solid var(--line)', paddingTop: 24 }}>
            <div className="caps mute mb-4">{lang === 'fr' ? 'Articles' : 'Items'}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {order.items.map((it, i) => (
                <div key={i} className="row gap-3">
                  <div style={{ width: 48, aspectRatio: '4/5', overflow: 'hidden', flexShrink: 0 }}>
                    {it.img && <img src={it.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div>{it.name}</div>
                    <div className="mute" style={{ fontSize: 12 }}>× {it.qty}{it.size ? ` · ${it.size}` : ''}{it.color ? ` · ${it.color}` : ''}</div>
                  </div>
                  <div>{fmt(it.price * it.qty)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!order && !loading && !error && (
        <p className="mute" style={{ fontSize: 14 }}>
          {lang === 'fr'
            ? 'Entrez votre numéro de commande (format PB-XXXXXX) pour voir son statut.'
            : 'Enter your order number (format PB-XXXXXX) to see its status.'}
        </p>
      )}
    </SimplePage>
  );
}

function buildSteps(o: OrderLookup, lang: 'fr' | 'en') {
  const statusOrder = ['pending', 'paid', 'preparing', 'shipped', 'delivered'];
  const currentIdx = Math.max(0, statusOrder.indexOf(o.status));
  const fmtDate = (iso: string | null) => iso ? new Date(iso).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

  return [
    { t: lang === 'fr' ? 'Commande confirmée' : 'Order confirmed', d: fmtDate(o.created_at), done: currentIdx >= 0, active: currentIdx === 0 && o.status === 'pending' },
    { t: lang === 'fr' ? 'Paiement reçu'     : 'Payment received', d: fmtDate(o.paid_at),    done: currentIdx >= 1, active: o.status === 'paid' },
    { t: lang === 'fr' ? 'En préparation'    : 'Being prepared',   d: currentIdx >= 2 ? '✓' : '—', done: currentIdx >= 2, active: o.status === 'preparing' },
    { t: lang === 'fr' ? 'En route'          : 'Out for delivery', d: fmtDate(o.shipped_at), done: currentIdx >= 3, active: o.status === 'shipped' },
    { t: lang === 'fr' ? 'Livrée'            : 'Delivered',        d: fmtDate(o.delivered_at), done: currentIdx >= 4, active: o.status === 'delivered' },
  ];
}

export default function TrackPage() {
  return (
    <Suspense fallback={<main className="container" style={{ padding: 80 }}/>}>
      <TrackContent/>
    </Suspense>
  );
}
