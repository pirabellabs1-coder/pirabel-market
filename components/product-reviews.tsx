'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useStore } from './store-provider';

type Review = { id: string; author_name: string; rating: number; title: string | null; body: string | null; created_at: string };

export function ProductReviews({ productId }: { productId: string }) {
  const { lang } = useStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch(`/api/reviews?product_id=${encodeURIComponent(productId)}`);
    const j = await res.json().catch(() => ({}));
    setReviews(j.reviews ?? []);
    setAverage(j.average ?? 0);
    setCount(j.count ?? 0);
  };

  useEffect(() => { load(); }, [productId]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null); setMsg(null); setSubmitting(true);
    const res = await fetch('/api/reviews', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ product_id: productId, author_name: name, rating, title, body }),
    });
    setSubmitting(false);
    const j = await res.json().catch(() => ({}));
    if (!res.ok) return setErr(j.error || 'Erreur');
    setMsg(lang === 'fr' ? 'Merci ! Ton avis sera visible après validation.' : 'Thanks! Your review will be visible after moderation.');
    setName(''); setTitle(''); setBody(''); setRating(5);
  };

  return (
    <section className="container" style={{ padding: '64px 40px 80px', borderTop: '1px solid var(--line)', marginTop: 40 }}>
      <div className="section-eyebrow">{lang === 'fr' ? 'Avis clients' : 'Customer reviews'}</div>
      <h2 className="serif" style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 400, margin: '8px 0 24px' }}>
        {count > 0 ? `${average.toFixed(1)} ★ · ${count} ${count > 1 ? 'avis' : 'avis'}` : (lang === 'fr' ? 'Aucun avis pour l\'instant' : 'No reviews yet')}
      </h2>

      {reviews.length > 0 && (
        <div className="grid-2 mb-12" style={{ marginBottom: 48 }}>
          {reviews.slice(0, 6).map(r => (
            <div key={r.id} style={{ padding: 20, background: 'var(--ivory-2)' }}>
              <div className="row between mb-2" style={{ alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{r.author_name}</div>
                  <div className="mute" style={{ fontSize: 12 }}>{new Date(r.created_at).toLocaleDateString('fr-FR')}</div>
                </div>
                <div style={{ color: 'var(--gold)' }}>{'★'.repeat(r.rating)}<span style={{ color: 'var(--ink-faint)' }}>{'★'.repeat(5 - r.rating)}</span></div>
              </div>
              {r.title && <div className="serif" style={{ fontSize: 16, marginBottom: 4 }}>{r.title}</div>}
              {r.body && <p className="mute" style={{ fontSize: 14, lineHeight: 1.6 }}>{r.body}</p>}
            </div>
          ))}
        </div>
      )}

      <div style={{ borderTop: '1px solid var(--line)', paddingTop: 32 }}>
        <h3 className="serif" style={{ fontSize: 22, fontWeight: 400, marginBottom: 16 }}>{lang === 'fr' ? 'Laisser un avis' : 'Leave a review'}</h3>
        <form onSubmit={onSubmit} className="grid-form" style={{ maxWidth: 640 }}>
          <div className="field span-all">
            <label>{lang === 'fr' ? 'Note' : 'Rating'}</label>
            <div className="stars">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setRating(n)} className={`star-btn ${rating >= n ? 'active' : ''}`} aria-label={`${n}`}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill={rating >= n ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5"><path d="m12 2 2.9 6.9 7.1.6-5.4 4.7 1.6 7L12 17.8 5.8 21.3l1.6-7L2 9.5l7.1-.6L12 2z" strokeLinejoin="round"/></svg>
                </button>
              ))}
            </div>
          </div>
          <div className="field"><label>{lang === 'fr' ? 'Nom' : 'Name'} *</label><input className="input" required maxLength={60} value={name} onChange={e => setName(e.target.value)}/></div>
          <div className="field"><label>{lang === 'fr' ? 'Titre' : 'Title'}</label><input className="input" maxLength={120} value={title} onChange={e => setTitle(e.target.value)}/></div>
          <div className="field span-all"><label>{lang === 'fr' ? 'Commentaire' : 'Comment'}</label><textarea className="textarea" rows={4} maxLength={2000} value={body} onChange={e => setBody(e.target.value)}/></div>
          {err && <p className="span-all" style={{ color: '#a63d2a', fontSize: 13 }}>{err}{err.includes('Auth') && <> — <Link href="/connexion" style={{ textDecoration: 'underline' }}>se connecter</Link></>}</p>}
          {msg && <p className="span-all mute" style={{ fontSize: 13 }}>{msg}</p>}
          <div className="span-all"><button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? '…' : (lang === 'fr' ? 'Envoyer l\'avis' : 'Submit review')}</button></div>
        </form>
      </div>
    </section>
  );
}
