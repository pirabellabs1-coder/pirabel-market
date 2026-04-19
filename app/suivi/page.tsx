'use client';

import { SimplePage } from '@/components/simple-page';
import { useStore } from '@/components/store-provider';

export default function TrackPage() {
  const { lang } = useStore();
  return (
    <SimplePage title={lang === 'fr' ? 'Suivre votre commande' : 'Track your order'} eyebrow={lang === 'fr' ? 'Suivi' : 'Tracking'}>
      <div className="row gap-3 mb-8" style={{ maxWidth: 560 }}>
        <input className="input" placeholder="PB-XXXXXX" style={{ flex: 1 }}/>
        <button className="btn btn-primary">{lang === 'fr' ? 'Suivre' : 'Track'}</button>
      </div>
      <div style={{ padding: 32, background: 'var(--ivory-2)' }}>
        <div className="row between wrap gap-4 mb-6">
          <div><div className="caps mute mb-2">{lang === 'fr' ? 'Commande' : 'Order'}</div><div className="mono">PB-284719</div></div>
          <div><div className="caps mute mb-2">{lang === 'fr' ? 'Livraison estimée' : 'ETA'}</div><div>{lang === 'fr' ? "Aujourd'hui, 17h–18h" : 'Today, 5–6pm'}</div></div>
          <span style={{ padding: '8px 16px', background: 'var(--ink)', color: 'var(--ivory)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase' }}>{lang === 'fr' ? 'En route' : 'In transit'}</span>
        </div>
        <div style={{ position: 'relative', paddingLeft: 32 }}>
          <div style={{ position: 'absolute', left: 7, top: 6, bottom: 6, width: 1, background: 'var(--line)' }}/>
          {[
            { t: lang === 'fr' ? 'Commande confirmée' : 'Order confirmed', d: '12:34', done: true },
            { t: lang === 'fr' ? 'Paiement reçu' : 'Payment received', d: '12:35', done: true },
            { t: lang === 'fr' ? 'En préparation' : 'Being prepared', d: '13:10', done: true },
            { t: lang === 'fr' ? 'En route' : 'Out for delivery', d: '15:45', done: true, active: true },
            { t: lang === 'fr' ? 'Livrée' : 'Delivered', d: lang === 'fr' ? 'Attendu ~17:30' : 'Expected ~17:30', done: false },
          ].map((s, i) => (
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
      </div>
    </SimplePage>
  );
}
