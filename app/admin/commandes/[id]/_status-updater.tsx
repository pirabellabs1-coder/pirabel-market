'use client';

import { useState, useTransition } from 'react';
import { updateOrderStatus } from '../../actions';

const STATUSES = [
  { id: 'pending',    l: 'En attente' },
  { id: 'paid',       l: 'Payée' },
  { id: 'preparing',  l: 'En préparation' },
  { id: 'shipped',    l: 'En route' },
  { id: 'delivered',  l: 'Livrée' },
  { id: 'cancelled',  l: 'Annulée' },
  { id: 'refunded',   l: 'Remboursée' },
];

export function StatusUpdater({ id, current }: { id: string; current: string }) {
  const [value, setValue] = useState(current);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    setError(null);
    start(async () => {
      try { await updateOrderStatus(id, value); }
      catch (e) { setError((e as Error).message); }
    });
  };

  return (
    <div>
      <select className="select" value={value} onChange={e => setValue(e.target.value)} style={{ width: '100%', marginBottom: 12 }}>
        {STATUSES.map(s => <option key={s.id} value={s.id}>{s.l}</option>)}
      </select>
      <button className="btn btn-primary btn-sm btn-block" onClick={save} disabled={pending || value === current}>
        {pending ? 'Enregistrement…' : 'Mettre à jour'}
      </button>
      {error && <p style={{ color: '#a63d2a', fontSize: 12, marginTop: 8 }}>{error}</p>}
    </div>
  );
}
