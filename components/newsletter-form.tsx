'use client';

import { useState, type FormEvent } from 'react';
import { Icon } from './icons';
import { useStore } from './store-provider';

export function NewsletterForm() {
  const { lang } = useStore();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setState('sending'); setMsg(null);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, lang }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Erreur');
      setState('done');
      setMsg(lang === 'fr' ? '✓ Inscription confirmée. À bientôt.' : '✓ Subscribed. See you soon.');
      setEmail('');
    } catch (err) {
      setState('error');
      setMsg((err as Error).message);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      style={{ display: 'flex', gap: 12, maxWidth: 480, margin: '0 auto', borderBottom: '1px solid rgba(247,243,236,.3)' }}
    >
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder={lang === 'fr' ? 'Votre adresse e-mail' : 'Your email'}
        disabled={state === 'sending' || state === 'done'}
        style={{ flex: 1, background: 'transparent', border: 0, padding: '14px 0', color: 'var(--ivory)', outline: 0, fontSize: 15 }}
      />
      <button
        type="submit"
        disabled={state === 'sending' || state === 'done' || !email}
        style={{
          color: 'var(--ivory)', fontSize: 11, letterSpacing: '.2em',
          textTransform: 'uppercase', padding: '14px 0',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'transparent', border: 0,
          cursor: state === 'sending' ? 'wait' : 'pointer',
          opacity: state === 'done' ? 0.6 : 1,
        }}
      >
        {state === 'sending' ? '…' : state === 'done' ? '✓' : (lang === 'fr' ? "S'inscrire" : 'Subscribe')} <Icon.Arrow/>
      </button>
      {msg && (
        <div style={{ position: 'absolute', marginTop: 56, fontSize: 12, color: state === 'error' ? '#ff9a9a' : 'rgba(247,243,236,.75)' }}>
          {msg}
        </div>
      )}
    </form>
  );
}
