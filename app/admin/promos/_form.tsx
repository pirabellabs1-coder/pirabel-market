'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createPromo, updatePromo } from '../actions';

type PromoInput = {
  code?: string;
  type?: 'percent' | 'fixed' | 'free_shipping';
  value?: number;
  min_order?: number;
  max_uses?: number | null;
  valid_until?: string | null;
  description?: string | null;
  active?: boolean;
};

export function PromoForm({ promo }: { promo?: PromoInput }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState(promo?.type ?? 'percent');
  const editing = !!promo?.code;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      try {
        if (editing) await updatePromo(promo!.code!, fd);
        else await createPromo(fd);
        router.push('/admin/promos');
      } catch (err) { setError((err as Error).message); }
    });
  };

  return (
    <form onSubmit={onSubmit} className="admin-card">
      <div className="grid-form">
        <div className="field">
          <label>Code *</label>
          <input className="input" name="code" required defaultValue={promo?.code ?? ''} readOnly={editing} placeholder="BIENVENUE20" style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}/>
        </div>
        <div className="field">
          <label>Type *</label>
          <select className="select" name="type" value={type} onChange={e => setType(e.target.value as 'percent' | 'fixed' | 'free_shipping')}>
            <option value="percent">% remise</option>
            <option value="fixed">Remise fixe (FCFA)</option>
            <option value="free_shipping">Livraison offerte</option>
          </select>
        </div>
        {type !== 'free_shipping' && (
          <div className="field">
            <label>{type === 'percent' ? 'Pourcentage' : 'Montant (FCFA)'} *</label>
            <input className="input" name="value" type="number" min={0} step={type === 'percent' ? 1 : 500} required defaultValue={promo?.value ?? ''}/>
          </div>
        )}
        <div className="field">
          <label>Panier minimum (FCFA)</label>
          <input className="input" name="min_order" type="number" min={0} step={500} defaultValue={promo?.min_order ?? 0}/>
        </div>
        <div className="field">
          <label>Utilisations max</label>
          <input className="input" name="max_uses" type="number" min={1} defaultValue={promo?.max_uses ?? ''} placeholder="Illimité si vide"/>
        </div>
        <div className="field">
          <label>Date d&apos;expiration</label>
          <input className="input" name="valid_until" type="datetime-local" defaultValue={promo?.valid_until ? new Date(promo.valid_until).toISOString().slice(0, 16) : ''}/>
        </div>
        <div className="field span-all">
          <label>Description (interne)</label>
          <input className="input" name="description" defaultValue={promo?.description ?? ''}/>
        </div>
        <div className="field span-all row gap-3" style={{ flexDirection: 'row', alignItems: 'center' }}>
          <input type="checkbox" name="active" id="active" defaultChecked={promo?.active ?? true} style={{ width: 18, height: 18 }}/>
          <label htmlFor="active" style={{ marginBottom: 0, letterSpacing: 0, textTransform: 'none', fontSize: 14 }}>Actif</label>
        </div>
      </div>
      {error && <p style={{ color: '#a63d2a', fontSize: 13, marginTop: 16 }}>{error}</p>}
      <div className="row gap-3 mt-8">
        <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? '…' : editing ? 'Enregistrer' : 'Créer le code'}</button>
        <button type="button" className="btn btn-ghost" onClick={() => router.push('/admin/promos')}>Annuler</button>
      </div>
    </form>
  );
}
