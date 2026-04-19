'use client';

import { useState, type FormEvent } from 'react';

export function NewsletterComposer({ subscriberCount }: { subscriberCount: number }) {
  const [subject, setSubject] = useState('');
  const [preview, setPreview] = useState('');
  const [html, setHtml] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!confirm(`Envoyer à ${subscriberCount} abonné${subscriberCount > 1 ? 's' : ''} ?`)) return;
    setSending(true); setError(null); setResult(null);
    try {
      const res = await fetch('/api/newsletter/send', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ subject, html, preview }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Erreur');
      setResult(`✓ Envoyé à ${j.sent}/${j.total}${j.failed ? ` (${j.failed} échecs)` : ''}`);
    } catch (err) { setError((err as Error).message); }
    finally { setSending(false); }
  };

  return (
    <form onSubmit={onSend} className="admin-card">
      <div className="grid-form">
        <div className="field span-all"><label>Sujet *</label><input className="input" required value={subject} onChange={e => setSubject(e.target.value)} placeholder="Nouvelle collection Printemps"/></div>
        <div className="field span-all"><label>Texte d&apos;aperçu (preview)</label><input className="input" value={preview} onChange={e => setPreview(e.target.value)} maxLength={140} placeholder="Découvrez les nouveautés…"/></div>
        <div className="field span-all">
          <label>Contenu HTML *</label>
          <textarea className="textarea" rows={12} required value={html} onChange={e => setHtml(e.target.value)} style={{ fontFamily: 'monospace', fontSize: 13 }} placeholder={`<h2 style="font-family:Georgia,serif;">Nouvelle collection</h2>\n<p>Ton texte ici...</p>\n<a href="https://pirabel-one.store/catalogue" style="display:inline-block;background:#14110d;color:#f7f3ec;padding:14px 28px;text-decoration:none;">Découvrir</a>`}/>
          <p className="mute mt-2" style={{ fontSize: 11 }}>Tu peux coller du HTML riche. Le wrapper Pirabel (logo + footer) est ajouté automatiquement.</p>
        </div>
      </div>
      {error && <p style={{ color: '#a63d2a', fontSize: 13, marginTop: 16 }}>{error}</p>}
      {result && <p className="mute" style={{ fontSize: 13, marginTop: 16 }}>{result}</p>}
      <div className="row gap-3 mt-6">
        <button type="submit" className="btn btn-primary" disabled={sending || !subject || !html || subscriberCount === 0}>
          {sending ? 'Envoi en cours…' : `Envoyer à ${subscriberCount} abonné${subscriberCount > 1 ? 's' : ''}`}
        </button>
      </div>
    </form>
  );
}
