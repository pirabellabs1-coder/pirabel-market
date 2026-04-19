'use client';

import Link from 'next/link';
import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SimplePage } from '@/components/simple-page';
import { useStore } from '@/components/store-provider';
import { createClient } from '@/lib/supabase/client';

function LoginContent() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') || '/compte';
  const { lang } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const sb = createClient();

    if (mode === 'signup') {
      const { error } = await sb.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}${next}` },
      });
      setLoading(false);
      if (error) return setError(error.message);
      setInfo(lang === 'fr'
        ? 'Inscription réussie — vérifie ta boîte mail pour confirmer.'
        : 'Signed up — check your email to confirm.');
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return setError(error.message);
      router.push(next);
      router.refresh();
    }
  };

  return (
    <SimplePage
      title={mode === 'login' ? (lang === 'fr' ? 'Connexion' : 'Sign in') : (lang === 'fr' ? 'Créer un compte' : 'Create account')}
      eyebrow={lang === 'fr' ? 'Espace client' : 'Customer area'}
    >
      <div style={{ maxWidth: 440, margin: '0 auto' }}>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)}/>
          </div>
          <div className="field">
            <label>{lang === 'fr' ? 'Mot de passe' : 'Password'}</label>
            <input className="input" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}/>
          </div>

          {error && <p style={{ color: '#a63d2a', fontSize: 13 }}>{error}</p>}
          {info && <p className="mute" style={{ fontSize: 13 }}>{info}</p>}

          <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={loading}>
            {loading
              ? (lang === 'fr' ? 'Patientez…' : 'Please wait…')
              : mode === 'login'
              ? (lang === 'fr' ? 'Se connecter' : 'Sign in')
              : (lang === 'fr' ? 'Créer mon compte' : 'Create account')}
          </button>

          <button
            type="button"
            onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(null); setInfo(null); }}
            className="mute"
            style={{ fontSize: 13, letterSpacing: '.08em', textTransform: 'uppercase', padding: 8 }}
          >
            {mode === 'login'
              ? (lang === 'fr' ? "Pas encore de compte ? S'inscrire" : 'No account yet? Sign up')
              : (lang === 'fr' ? 'Déjà inscrit ? Se connecter' : 'Already registered? Sign in')}
          </button>

          {mode === 'login' && (
            <div style={{ textAlign: 'center' }}>
              <Link href="/mot-de-passe-oublie" className="mute" style={{ fontSize: 12, letterSpacing: '.08em' }}>
                {lang === 'fr' ? 'Mot de passe oublié ?' : 'Forgot password?'}
              </Link>
            </div>
          )}
        </form>

        <div className="mute mt-8" style={{ textAlign: 'center', fontSize: 12 }}>
          <Link href="/">{lang === 'fr' ? "Retour à l'accueil" : 'Back home'}</Link>
        </div>
      </div>
    </SimplePage>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="container" style={{ padding: 80 }}/>}>
      <LoginContent/>
    </Suspense>
  );
}
