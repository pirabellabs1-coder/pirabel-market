'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { SimplePage } from '@/components/simple-page';
import { useStore } from '@/components/store-provider';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const { lang } = useStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    const sb = createClient();
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nouveau-mot-de-passe`,
    });
    setLoading(false);
    if (error) return setError(error.message);
    setSent(true);
  };

  return (
    <SimplePage
      title={lang === 'fr' ? 'Mot de passe oublié' : 'Forgot password'}
      eyebrow={lang === 'fr' ? 'Récupération' : 'Recovery'}
    >
      <div style={{ maxWidth: 440, margin: '0 auto' }}>
        {sent ? (
          <div style={{ textAlign: 'center', padding: 40, border: '1px solid var(--line)' }}>
            <p className="serif" style={{ fontSize: 20, marginBottom: 12 }}>
              {lang === 'fr' ? 'Email envoyé.' : 'Email sent.'}
            </p>
            <p className="mute" style={{ fontSize: 14, lineHeight: 1.6 }}>
              {lang === 'fr'
                ? `Si un compte existe avec ${email}, tu recevras un lien pour choisir un nouveau mot de passe. Pense à regarder tes spams.`
                : `If an account exists with ${email}, you'll receive a link to set a new password. Check your spam folder.`}
            </p>
            <Link className="btn btn-outline mt-8" href="/connexion">{lang === 'fr' ? 'Retour connexion' : 'Back to sign in'}</Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <p className="mute" style={{ fontSize: 14, lineHeight: 1.6 }}>
              {lang === 'fr'
                ? 'Entre ton email. On t\'envoie un lien sécurisé pour choisir un nouveau mot de passe.'
                : "Enter your email. We'll send you a secure link to set a new password."}
            </p>
            <div className="field">
              <label>Email</label>
              <input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)}/>
            </div>
            {error && <p style={{ color: '#a63d2a', fontSize: 13 }}>{error}</p>}
            <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={loading}>
              {loading ? '…' : lang === 'fr' ? 'Envoyer le lien' : 'Send link'}
            </button>
            <div className="mute" style={{ textAlign: 'center', fontSize: 12 }}>
              <Link href="/connexion">← {lang === 'fr' ? 'Retour connexion' : 'Back to sign in'}</Link>
            </div>
          </form>
        )}
      </div>
    </SimplePage>
  );
}
