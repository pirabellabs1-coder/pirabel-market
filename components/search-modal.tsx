'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './icons';
import { useStore } from './store-provider';
import type { Product } from '@/lib/types';
import { fmt } from '@/lib/format';

type Props = { products: Product[] };

export function SearchModal({ products }: Props) {
  const { searchOpen, closeSearch, lang } = useStore();
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      setQ('');
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch();
    };
    if (searchOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen, closeSearch]);

  const results = useMemo<Product[]>(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return products.slice(0, 6);
    return products
      .filter(p => {
        const hay = [
          p.fr.name, p.en.name,
          p.fr.desc ?? '', p.en.desc ?? '',
          p.collection, p.category, p.tag ?? '',
        ].join(' ').toLowerCase();
        return needle.split(/\s+/).every(part => hay.includes(part));
      })
      .slice(0, 12);
  }, [q, products]);

  if (!searchOpen) return null;

  return (
    <>
      <div
        onClick={closeSearch}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 400, animation: 'fadeIn .15s' }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={lang === 'fr' ? 'Recherche' : 'Search'}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          background: 'var(--ivory)',
          zIndex: 401,
          maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
          animation: 'slideDown .2s cubic-bezier(.2,.6,.2,1)',
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 0', borderBottom: '1px solid var(--line)' }}>
          <Icon.Search s={20}/>
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={lang === 'fr' ? 'Chercher une pièce, une catégorie…' : 'Search for a piece, a category…'}
            style={{ flex: 1, background: 'transparent', border: 0, outline: 0, fontSize: 18, fontFamily: 'var(--font-serif)', color: 'var(--ink)', padding: '8px 0' }}
          />
          <button onClick={closeSearch} aria-label="Fermer" style={{ color: 'var(--ink-mute)', padding: 8 }}><Icon.X s={18}/></button>
        </div>

        <div className="container" style={{ overflowY: 'auto', padding: '24px 0 40px', flex: 1 }}>
          {!q.trim() && (
            <div className="caps mute mb-4">{lang === 'fr' ? 'Suggestions' : 'Suggestions'}</div>
          )}
          {q.trim() && (
            <div className="mb-4" style={{ fontSize: 12, color: 'var(--ink-mute)', letterSpacing: '.08em' }}>
              {results.length} {lang === 'fr' ? `résultat${results.length > 1 ? 's' : ''} pour « ${q} »` : `result${results.length > 1 ? 's' : ''} for "${q}"`}
            </div>
          )}

          {results.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <p className="mute">{lang === 'fr' ? 'Aucun résultat.' : 'No results.'}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
              {results.map(p => (
                <Link
                  key={p.id}
                  href={`/produit/${p.id}`}
                  onClick={closeSearch}
                  style={{ display: 'flex', gap: 14, padding: 8, borderRadius: 2, transition: 'background .15s' }}
                >
                  <div style={{ width: 68, aspectRatio: '4/5', overflow: 'hidden', background: 'var(--ivory-2)', flexShrink: 0 }}>
                    <img src={p.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="caps mute" style={{ fontSize: 10, marginBottom: 2 }}>{p.collection}</div>
                    <div className="serif" style={{ fontSize: 16, lineHeight: 1.25, marginBottom: 4 }}>{p[lang].name}</div>
                    <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{fmt(p.price)}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </>
  );
}
