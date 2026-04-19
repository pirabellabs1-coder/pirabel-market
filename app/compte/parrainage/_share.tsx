'use client';

import { useState } from 'react';

export function ReferralShare({ code }: { code: string }) {
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);
  const site = typeof window !== 'undefined' ? window.location.origin : 'https://pirabel-one.store';
  const link = `${site}/?ref=${encodeURIComponent(code)}`;
  const whatsappMsg = encodeURIComponent(
    `J'ai découvert Pirabel (une super boutique basée à Cotonou). Profite de 10% sur ta première commande avec mon code : ${code}\n\n${link}`
  );

  const copy = (text: string, which: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div className="admin-card" style={{ background: 'var(--ink)', color: 'var(--ivory)', borderColor: 'var(--ink)' }}>
      <div style={{ fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 12 }}>Ton code</div>
      <div className="row gap-3 wrap" style={{ alignItems: 'center' }}>
        <code style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 28, fontWeight: 500, letterSpacing: '0.1em', padding: '14px 22px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>{code}</code>
        <button onClick={() => copy(code, 'code')} className="btn" style={{ background: 'var(--ivory)', color: 'var(--ink)', padding: '10px 16px' }}>
          {copied === 'code' ? '✓ Copié' : 'Copier le code'}
        </button>
      </div>

      <div className="mt-6" style={{ fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 8 }}>Ton lien de parrainage</div>
      <div className="row gap-2 wrap">
        <code style={{ flex: 1, minWidth: 240, fontSize: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{link}</code>
        <button onClick={() => copy(link, 'link')} className="btn btn-outline btn-sm" style={{ borderColor: 'var(--ivory)', color: 'var(--ivory)' }}>
          {copied === 'link' ? '✓' : 'Copier'}
        </button>
      </div>

      <div className="mt-6 row gap-2 wrap">
        <a href={`https://wa.me/?text=${whatsappMsg}`} target="_blank" rel="noopener" className="btn" style={{ background: '#25d366', color: 'white' }}>
          Partager sur WhatsApp
        </a>
        <a href={`mailto:?subject=${encodeURIComponent('Découvre Pirabel — 10% sur ta première commande')}&body=${whatsappMsg}`} className="btn btn-outline btn-sm" style={{ borderColor: 'var(--ivory)', color: 'var(--ivory)' }}>
          Par email
        </a>
      </div>
    </div>
  );
}
