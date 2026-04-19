'use client';

import { useState, type FormEvent } from 'react';

export function BackInStock({ productId }: { productId: string }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setState('sending'); setError(null);
    try {
      const res = await fetch('/api/stock-alert', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, product_id: productId }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Erreur');
      setState('done');
    } catch (e) { setState('error'); setError((e as Error).message); }
  };

  if (state === 'done') {
    return (
      <div className="mt-4" style={{ padding: 16, background: 'var(--ivory-2)', border: '1px solid var(--line)', fontSize: 13 }}>
        ✓ Tu seras prévenu(e) à <strong>{email}</strong> dès que cet article revient en stock.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-4" style={{ padding: 16, background: 'var(--ivory-2)', border: '1px solid var(--line)' }}>
      <div className="caps mb-2" style={{ fontSize: 10, color: 'var(--ink-mute)' }}>Article en rupture</div>
      <div className="serif" style={{ fontSize: 16, marginBottom: 8 }}>Préviens-moi quand il revient</div>
      <div className="row gap-2">
        <input
          className="input" type="email" required placeholder="ton@email.com"
          value={email} onChange={e => setEmail(e.target.value)}
          style={{ flex: 1, background: 'var(--ivory)' }}
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={state === 'sending'}>
          {state === 'sending' ? '…' : 'M\'alerter'}
        </button>
      </div>
      {error && <p style={{ color: '#a63d2a', fontSize: 12, marginTop: 8 }}>{error}</p>}
    </form>
  );
}
