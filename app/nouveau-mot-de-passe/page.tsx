'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { SimplePage } from '@/components/simple-page';
import { useStore } from '@/components/store-provider';
import { createClient } from '@/lib/supabase/client';

export default function NewPasswordPage() {
  const router = useRouter();
  const { lang } = useStore();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase puts us in a recovery session when user lands from reset link
    const sb = createClient();
    sb.auth.getSession().then(({ data }) => {
      setReady(!!data.session);
      if (!data.session) setError(lang === 'fr' ? 'Lien expiré ou invalide. Redemande un lien de récupération.' : 'Invalid or expired link. Request a new recovery link.');
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) return setError(lang === 'fr' ? 'Les mots de passe ne correspondent pas.' : 'Passwords do not match.');
    if (password.length < 6) return setError(lang === 'fr' ? 'Au moins 6 caractères.' : 'At least 6 characters.');
    setLoading(true);
    const sb = createClient();
    const { error } = await sb.auth.updateUser({ password });
    setLoading(false);
    if (error) return setError(error.message);
    setDone(true);
    setTimeout(() => router.push('/compte'), 1500);
  };

  return (
    <SimplePage
      title={lang === 'fr' ? 'Nouveau mot de passe' : 'New password'}
      eyebrow={lang === 'fr' ? 'Sécurité' : 'Security'}
    >
      <div style={{ maxWidth: 440, margin: '0 auto' }}>
        {done ? (
          <div style={{ textAlign: 'center', padding: 40, border: '1px solid var(--line)' }}>
            <p className="serif" style={{ fontSize: 20, marginBottom: 12 }}>
              {lang === 'fr' ? 'Mot de passe changé.' : 'Password changed.'}
            </p>
            <p className="mute">{lang === 'fr' ? 'Redirection…' : 'Redirecting…'}</p>
          </div>
        ) : !ready ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            {error ? (
              <>
                <p style={{ color: '#a63d2a', marginBottom: 16 }}>{error}</p>
                <Link className="btn btn-outline" href="/mot-de-passe-oublie">{lang === 'fr' ? 'Redemander un lien' : 'Request new link'}</Link>
              </>
            ) : (
              <p className="mute">{lang === 'fr' ? 'Chargement…' : 'Loading…'}</p>
            )}
          </div>
        ) : (
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="field">
              <label>{lang === 'fr' ? 'Nouveau mot de passe' : 'New password'}</label>
              <input className="input" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}/>
            </div>
            <div className="field">
              <label>{lang === 'fr' ? 'Confirmer' : 'Confirm'}</label>
              <input className="input" type="password" required minLength={6} value={confirm} onChange={e => setConfirm(e.target.value)}/>
            </div>
            {error && <p style={{ color: '#a63d2a', fontSize: 13 }}>{error}</p>}
            <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={loading}>
              {loading ? '…' : lang === 'fr' ? 'Changer le mot de passe' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </SimplePage>
  );
}
