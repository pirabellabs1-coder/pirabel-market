'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from './store-provider';
import type { Product } from '@/lib/types';
import { fmt } from '@/lib/format';

/**
 * Client-side "Vu récemment" strip. Reads the last 8 product_ids from
 * localStorage (populated by product-view tracking side-effect), filters
 * to products currently in the catalog.
 */
const LS_KEY = 'pb_recent_views';

export function recordView(productId: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr: string[] = raw ? JSON.parse(raw) : [];
    const next = [productId, ...arr.filter(x => x !== productId)].slice(0, 8);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch {}
}

export function RecentlyViewed({ allProducts, excludeId }: { allProducts: Product[]; excludeId?: string }) {
  const { lang } = useStore();
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const arr: string[] = raw ? JSON.parse(raw) : [];
      setIds(arr.filter(id => id !== excludeId));
    } catch {}
  }, [excludeId]);

  const items = ids
    .map(id => allProducts.find(p => p.id === id))
    .filter((p): p is Product => !!p)
    .slice(0, 6);

  if (items.length < 2) return null;

  return (
    <section className="section-sm container" style={{ padding: '48px 40px 64px' }}>
      <div className="section-head">
        <div>
          <div className="section-eyebrow">{lang === 'fr' ? 'Tu as vu récemment' : 'Recently viewed'}</div>
          <h2 className="section-title" style={{ fontSize: 'clamp(24px, 3vw, 36px)' }}>
            {lang === 'fr' ? 'Retrouve-les' : 'Pick up where you left off'}
          </h2>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 24 }}>
        {items.map(p => (
          <Link key={p.id} href={`/produit/${p.id}`} className="pcard" style={{ textDecoration: 'none' }}>
            <div className="pcard-img">
              <img src={p.img} alt="" loading="lazy"/>
            </div>
            <div className="pcard-cat">{p.collection}</div>
            <div className="pcard-name" style={{ fontSize: 15 }}>{p[lang].name}</div>
            <div className="pcard-price">
              <span>{fmt(p.price)}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
