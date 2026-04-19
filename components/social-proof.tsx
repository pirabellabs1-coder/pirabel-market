'use client';

import { useEffect, useState } from 'react';

type ProofEvent = {
  name: string;
  city: string;
  product: string;
  time: number; // minutes ago
};

export function SocialProof() {
  const [events, setEvents] = useState<ProofEvent[]>([]);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try { if (sessionStorage.getItem('pb_sp_dismissed')) { setDismissed(true); return; } } catch {}
    let cancelled = false;
    fetch('/api/social-proof', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then((j) => { if (!cancelled && j?.events?.length) setEvents(j.events); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (dismissed || events.length === 0) return;
    const show = setTimeout(() => setVisible(true), 6000);
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % events.length);
        setVisible(true);
      }, 500);
    }, 14000);
    return () => { clearTimeout(show); clearInterval(cycle); };
  }, [events, dismissed]);

  if (dismissed || events.length === 0) return null;
  const e = events[idx];

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed', bottom: 96, left: 24, zIndex: 80,
        maxWidth: 320, padding: '12px 16px', paddingRight: 36,
        background: 'var(--ivory)', border: '1px solid var(--line)',
        boxShadow: '0 6px 24px rgba(0,0,0,.1)',
        fontSize: 12, lineHeight: 1.5,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity .3s, transform .3s',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <button
        onClick={() => { setDismissed(true); try { sessionStorage.setItem('pb_sp_dismissed', '1'); } catch {} }}
        aria-label="Fermer"
        style={{ position: 'absolute', top: 6, right: 8, fontSize: 14, color: 'var(--ink-mute)', padding: 2 }}
      >×</button>
      <div><strong>{e.name}</strong> à {e.city}</div>
      <div className="mute" style={{ fontSize: 11, marginTop: 2 }}>
        vient d&apos;acheter <em style={{ fontStyle: 'italic' }}>{e.product}</em> · il y a {e.time} min
      </div>
    </div>
  );
}
