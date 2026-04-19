'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { createApiKey, revokeApiKey } from './actions';

type ApiKeyRow = {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

export function ApiKeysManager({ keys: initialKeys }: { keys: ApiKeyRow[] }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const onCreate = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      try {
        const { key } = await createApiKey(newName.trim() || 'Clé sans nom');
        setCreatedKey(key);
        setAdding(false);
        setNewName('');
      } catch (err) { setError((err as Error).message); }
    });
  };

  const onRevoke = (id: string, name: string) => {
    if (!confirm(`Révoquer la clé "${name}" ? Les intégrations qui l'utilisent perdront l'accès immédiatement.`)) return;
    setError(null);
    start(async () => {
      try { await revokeApiKey(id); }
      catch (err) { setError((err as Error).message); }
    });
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div>
      {/* Just-created key — shown ONCE, after create */}
      {createdKey && (
        <div className="admin-card" style={{ background: '#e7f3ea', borderColor: '#1a7a3f', marginBottom: 16 }}>
          <div className="caps mute mb-2" style={{ fontSize: 10, color: '#0d6534' }}>✓ Clé créée — copie-la maintenant, elle ne sera plus jamais affichée</div>
          <div className="row gap-2 wrap" style={{ alignItems: 'center' }}>
            <code style={{ flex: 1, minWidth: 300, padding: '12px 16px', background: 'var(--white)', border: '1px solid var(--line)', fontSize: 14, wordBreak: 'break-all' }}>{createdKey}</code>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => copy(createdKey)}>
              {copied ? '✓ Copié' : 'Copier'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCreatedKey(null)}>J&apos;ai noté</button>
          </div>
        </div>
      )}

      {error && <p style={{ color: '#a63d2a', marginBottom: 12 }}>{error}</p>}

      {/* Create form */}
      {adding && (
        <form onSubmit={onCreate} className="admin-card mb-6">
          <div className="field span-all">
            <label>Nom de la clé (utilité, nom du collaborateur…) *</label>
            <input
              className="input"
              required
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Ex: Zapier production, App mobile iOS, Compta Mariam"
            />
          </div>
          <div className="row gap-3 mt-4">
            <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? '…' : 'Créer la clé'}</button>
            <button type="button" className="btn btn-ghost" onClick={() => { setAdding(false); setNewName(''); }}>Annuler</button>
          </div>
        </form>
      )}

      {/* Keys table */}
      <div className="admin-card" style={{ padding: 0 }}>
        <div className="row between wrap gap-3" style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
          <div>
            <div style={{ fontWeight: 500 }}>{initialKeys.filter(k => !k.revoked_at).length} clé{initialKeys.filter(k => !k.revoked_at).length !== 1 ? 's' : ''} active{initialKeys.filter(k => !k.revoked_at).length !== 1 ? 's' : ''}</div>
            <div className="mute" style={{ fontSize: 12, marginTop: 2 }}>{initialKeys.filter(k => k.revoked_at).length} révoquée{initialKeys.filter(k => k.revoked_at).length !== 1 ? 's' : ''}</div>
          </div>
          {!adding && !createdKey && (
            <button className="btn btn-primary" onClick={() => setAdding(true)}>+ Nouvelle clé API</button>
          )}
        </div>

        <table className="admin-table">
          <thead>
            <tr><th>Nom</th><th>Préfixe</th><th>Créée le</th><th>Dernier usage</th><th>État</th><th></th></tr>
          </thead>
          <tbody>
            {initialKeys.map(k => (
              <tr key={k.id} style={{ opacity: k.revoked_at ? 0.55 : 1 }}>
                <td style={{ fontWeight: 500 }}>{k.name}</td>
                <td className="mono" style={{ fontSize: 12 }}>{k.prefix}…</td>
                <td className="mute" style={{ fontSize: 12 }}>{new Date(k.created_at).toLocaleDateString('fr-FR')}</td>
                <td className="mute" style={{ fontSize: 12 }}>{k.last_used_at ? new Date(k.last_used_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                <td>
                  <span className="admin-badge" style={{ background: k.revoked_at ? '#fce8e8' : '#e7f3ea', color: k.revoked_at ? '#8b1f1f' : '#0d6534' }}>
                    {k.revoked_at ? 'Révoquée' : 'Active'}
                  </span>
                </td>
                <td>
                  {!k.revoked_at && (
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ borderColor: '#c56060', color: '#a63d2a' }}
                      disabled={pending}
                      onClick={() => onRevoke(k.id, k.name)}
                    >Révoquer</button>
                  )}
                </td>
              </tr>
            ))}
            {initialKeys.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}><p className="mute">Aucune clé pour l&apos;instant.</p></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
