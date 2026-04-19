'use client';

import Link from 'next/link';
import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SimplePage } from '@/components/simple-page';
import { useStore } from '@/components/store-provider';
import { createClient } from '@/lib/supabase/client';

type Step = 'form' | 'otp';

function LoginContent() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') || '/compte';
  const { lang } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(search.get('error'));
  const [info, setInfo] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    const sb = createClient();
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) { setGoogleLoading(false); setError(error.message); }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null); setInfo(null); setLoading(true);
    const sb = createClient();

    if (mode === 'signup') {
      // Our OTP-based signup
      const res = await fetch('/api/auth/signup', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const j = await res.json().catch(() => ({}));
      setLoading(false);
      if (!res.ok) return setError(j.error || 'Erreur inscription');
      setStep('otp');
      setInfo(lang === 'fr'
        ? `Un code à 6 chiffres a été envoyé à ${email}. Vérifie aussi les spams.`
        : `A 6-digit code was sent to ${email}. Check spam too.`);
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return setError(error.message);
      router.push(next);
      router.refresh();
    }
  };

  const onVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, code: otp }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) { setLoading(false); return setError(j.error || 'Code invalide'); }

    // Now sign in
    const sb = createClient();
    const { error: signInErr } = await sb.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInErr) return setError(signInErr.message);
    router.push(next);
    router.refresh();
  };

  const resendOtp = async () => {
    setError(null); setInfo(null); setLoading(true);
    const res = await fetch('/api/auth/signup', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const j = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setError(j.error || 'Erreur');
    setInfo(lang === 'fr' ? 'Nouveau code envoyé.' : 'New code sent.');
  };

  if (step === 'otp') {
    return (
      <SimplePage
        title={lang === 'fr' ? 'Vérifie ton email' : 'Verify your email'}
        eyebrow={lang === 'fr' ? 'Code envoyé' : 'Code sent'}
      >
        <div style={{ maxWidth: 440, margin: '0 auto' }}>
          <p className="mute" style={{ fontSize: 14, lineHeight: 1.7, textAlign: 'center', marginBottom: 32 }}>
            {info || (lang === 'fr'
              ? `Entre le code à 6 chiffres envoyé à ${email}.`
              : `Enter the 6-digit code sent to ${email}.`)}
          </p>
          <form onSubmit={onVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="field">
              <label>{lang === 'fr' ? 'Code de vérification' : 'Verification code'}</label>
              <input
                className="input"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoComplete="one-time-code"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                autoFocus
                style={{ letterSpacing: '0.5em', fontSize: 24, textAlign: 'center', fontFamily: 'monospace' }}
                placeholder="· · · · · ·"
              />
            </div>
            {error && <p style={{ color: '#a63d2a', fontSize: 13 }}>{error}</p>}
            <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={loading || otp.length < 6}>
              {loading ? '…' : lang === 'fr' ? 'Vérifier & me connecter' : 'Verify & sign in'}
            </button>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button type="button" onClick={resendOtp} disabled={loading} className="mute" style={{ fontSize: 12, letterSpacing: '.08em', padding: 4 }}>
                {lang === 'fr' ? 'Renvoyer un code' : 'Resend a code'}
              </button>
              <button type="button" onClick={() => { setStep('form'); setOtp(''); setError(null); setInfo(null); }} className="mute" style={{ fontSize: 12, letterSpacing: '.08em', padding: 4 }}>
                ← {lang === 'fr' ? 'Changer d\'email' : 'Change email'}
              </button>
            </div>
          </form>
        </div>
      </SimplePage>
    );
  }

  return (
    <SimplePage
      title={mode === 'login' ? (lang === 'fr' ? 'Connexion' : 'Sign in') : (lang === 'fr' ? 'Créer un compte' : 'Create account')}
      eyebrow={lang === 'fr' ? 'Espace client' : 'Customer area'}
    >
      <div style={{ maxWidth: 440, margin: '0 auto' }}>
        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={googleLoading || loading}
          className="btn btn-outline btn-lg btn-block"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, letterSpacing: '.08em' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.24 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.95l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38z"/>
          </svg>
          {googleLoading ? (lang === 'fr' ? 'Redirection…' : 'Redirecting…') : (lang === 'fr' ? 'Continuer avec Google' : 'Continue with Google')}
        </button>

        <div className="mt-6 mb-6" style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--ink-mute)' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }}/>
          <span style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase' }}>{lang === 'fr' ? 'ou' : 'or'}</span>
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }}/>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"/>
          </div>
          <div className="field">
            <label>{lang === 'fr' ? 'Mot de passe' : 'Password'}</label>
            <input className="input" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'}/>
          </div>

          {error && <p style={{ color: '#a63d2a', fontSize: 13 }}>{error}</p>}
          {info && <p className="mute" style={{ fontSize: 13 }}>{info}</p>}

          <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={loading}>
            {loading
              ? (lang === 'fr' ? 'Patientez…' : 'Please wait…')
              : mode === 'login'
              ? (lang === 'fr' ? 'Se connecter' : 'Sign in')
              : (lang === 'fr' ? 'Recevoir un code' : 'Get a code')}
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
