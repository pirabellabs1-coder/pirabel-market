'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { setAdmin, inviteAdmin } from '../actions';

type Row = { id: string; email: string; first_name: string | null; last_name: string | null; phone: string | null; is_admin: boolean; created_at: string };

export function ClientsManager({ clients }: { clients: Row[] }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [filter, setFilter] = useState('');

  const onInvite = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); setInfo(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      try {
        const res = await inviteAdmin(fd);
        setInfo(`✓ ${res.email} est maintenant admin${res.createdPassword ? `. Mot de passe temporaire : ${res.createdPassword}` : ''}`);
        setInviting(false);
        (e.target as HTMLFormElement).reset();
      } catch (err) { setError((err as Error).message); }
    });
  };

  const onToggle = (id: string, next: boolean) => {
    setError(null);
    start(async () => {
      try { await setAdmin(id, next); }
      catch (err) { setError((err as Error).message); }
    });
  };

  const filtered = filter
    ? clients.filter(c =>
        c.email.toLowerCase().includes(filter.toLowerCase()) ||
        (c.first_name || '').toLowerCase().includes(filter.toLowerCase()) ||
        (c.last_name || '').toLowerCase().includes(filter.toLowerCase())
      )
    : clients;

  return (
    <div>
      {error && <p style={{ color: '#a63d2a', marginBottom: 12 }}>{error}</p>}
      {info && <p className="mute" style={{ marginBottom: 12, padding: 12, background: 'var(--ivory-2)', border: '1px solid var(--line)' }}>{info}</p>}

      <div className="row between wrap gap-3 mb-4">
        <input
          className="input"
          style={{ maxWidth: 320 }}
          placeholder="Chercher un email, un nom…"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        {!inviting && <button className="btn btn-primary" onClick={() => setInviting(true)}>+ Inviter un collaborateur admin</button>}
      </div>

      {inviting && (
        <form onSubmit={onInvite} className="admin-card mb-6">
          <div className="grid-form">
            <div className="field span-all"><label>Email du collaborateur *</label>
              <input name="email" type="email" required className="input" placeholder="collaborateur@exemple.com"/>
            </div>
            <div className="field"><label>Prénom</label><input name="first_name" className="input"/></div>
            <div className="field"><label>Nom</label><input name="last_name" className="input"/></div>
          </div>
          <p className="mute mt-4" style={{ fontSize: 12 }}>Un mot de passe temporaire sera généré. Transmets-le par un canal sécurisé (WhatsApp, message direct). Le collaborateur pourra le changer via <code>/mot-de-passe-oublie</code> après sa première connexion.</p>
          <div className="row gap-3 mt-4">
            <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? '…' : 'Créer & promouvoir admin'}</button>
            <button type="button" className="btn btn-ghost" onClick={() => setInviting(false)}>Annuler</button>
          </div>
        </form>
      )}

      <div className="admin-card" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead><tr><th>Nom</th><th>Email</th><th>Téléphone</th><th>Inscrit le</th><th>Rôle</th><th></th></tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td>{[p.first_name, p.last_name].filter(Boolean).join(' ') || '—'}</td>
                <td className="mute" style={{ fontSize: 13 }}>{p.email}</td>
                <td className="mute">{p.phone ?? '—'}</td>
                <td className="mute" style={{ fontSize: 12 }}>{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
                <td><span className="admin-badge" style={{ background: p.is_admin ? 'var(--ink)' : 'var(--ivory-2)', color: p.is_admin ? 'var(--ivory)' : 'var(--ink)' }}>{p.is_admin ? 'Admin' : 'Client'}</span></td>
                <td>
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={pending}
                    onClick={() => {
                      if (p.is_admin && !confirm(`Retirer les droits admin de ${p.email} ?`)) return;
                      onToggle(p.id, !p.is_admin);
                    }}
                  >{p.is_admin ? 'Retirer admin' : 'Promouvoir admin'}</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}><p className="mute">Aucun résultat.</p></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
