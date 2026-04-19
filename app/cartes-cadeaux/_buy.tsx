'use client';

import { useState, type FormEvent } from 'react';

const PRESETS = [25000, 50000, 100000, 200000];

export function GiftCardBuy() {
  const [amount, setAmount] = useState(50000);
  const [recipient_email, setRecipientEmail] = useState('');
  const [recipient_name, setRecipientName] = useState('');
  const [buyer_email, setBuyerEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ code: string } | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const res = await fetch('/api/gift-card', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ amount, recipient_email, recipient_name, buyer_email, message }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Erreur');
      setDone({ code: j.code });
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  if (done) {
    return (
      <div className="admin-card" style={{ textAlign: 'center' }}>
        <div className="serif" style={{ fontSize: 22, margin: '8px 0 12px' }}>Carte envoyée ✓</div>
        <p className="mute" style={{ fontSize: 14, lineHeight: 1.6 }}>
          Code cadeau : <code style={{ fontFamily: 'monospace', padding: '4px 10px', background: 'var(--ivory-2)', border: '1px solid var(--line)' }}>{done.code}</code>
        </p>
        <p className="mute mt-4" style={{ fontSize: 12 }}>
          Un email a été envoyé à {recipient_email} avec le code et ton message. (En attendant l&apos;intégration paiement, la carte est créée immédiatement.)
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="admin-card">
      <div className="caps mute mb-4" style={{ fontSize: 10 }}>Montant</div>
      <div className="row gap-2 wrap mb-6">
        {PRESETS.map(p => (
          <button
            key={p} type="button"
            onClick={() => setAmount(p)}
            className="btn btn-outline btn-sm"
            style={amount === p ? { background: 'var(--ink)', color: 'var(--ivory)', borderColor: 'var(--ink)' } : {}}
          >{new Intl.NumberFormat('fr-FR').format(p)} F</button>
        ))}
        <input
          type="number" min={10000} max={500000} step={1000}
          className="input" value={amount} onChange={e => setAmount(Number(e.target.value))}
          style={{ width: 140 }}
        />
      </div>

      <div className="grid-form">
        <div className="field span-all"><label>Prénom du destinataire</label><input className="input" value={recipient_name} onChange={e => setRecipientName(e.target.value)}/></div>
        <div className="field span-all"><label>Email du destinataire *</label><input className="input" type="email" required value={recipient_email} onChange={e => setRecipientEmail(e.target.value)}/></div>
        <div className="field span-all"><label>Message (optionnel)</label><textarea className="textarea" rows={3} value={message} onChange={e => setMessage(e.target.value)} placeholder="Bon anniversaire !"/></div>
        <div className="field span-all"><label>Ton email</label><input className="input" type="email" required value={buyer_email} onChange={e => setBuyerEmail(e.target.value)}/></div>
      </div>

      {error && <p style={{ color: '#a63d2a', marginTop: 12 }}>{error}</p>}

      <button type="submit" className="btn btn-primary btn-lg btn-block mt-6" disabled={loading}>
        {loading ? '…' : `Envoyer ${new Intl.NumberFormat('fr-FR').format(amount)} FCFA`}
      </button>
      <p className="mute mt-4" style={{ fontSize: 11, textAlign: 'center' }}>
        Paiement Kkiapay à venir. Pour l&apos;instant la carte est créée à l&apos;émission (usage test).
      </p>
    </form>
  );
}
