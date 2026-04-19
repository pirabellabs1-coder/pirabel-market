'use client';

import { useEffect, useState } from 'react';
import { useStore } from './store-provider';
import { Icon } from './icons';
import type { Product } from '@/lib/types';
import { fmt } from '@/lib/format';

type Props = { productsInCart: string[]; allProducts: Product[] };

export function CrossSell({ productsInCart, allProducts }: Props) {
  const { addToCart, lang } = useStore();
  const [suggestions, setSuggestions] = useState<Product[]>([]);

  useEffect(() => {
    if (productsInCart.length === 0 || allProducts.length === 0) { setSuggestions([]); return; }
    const cartCats = new Set(allProducts.filter(p => productsInCart.includes(p.id)).map(p => p.category));
    // Complementary: same category but not in cart, OR accessories if cart has apparel
    const pool = allProducts.filter(p => !productsInCart.includes(p.id));
    const primary = pool.filter(p => cartCats.has(p.category));
    const cross = pool.filter(p => p.category === 'accessories' && !cartCats.has('accessories'));
    const merged = [...primary, ...cross].slice(0, 3);
    setSuggestions(merged);
  }, [productsInCart, allProducts]);

  if (suggestions.length === 0) return null;

  return (
    <div style={{ padding: '16px 20px', background: 'var(--ivory-2)', borderBottom: '1px solid var(--line)' }}>
      <div className="caps mute mb-4" style={{ fontSize: 10 }}>
        {lang === 'fr' ? 'Complétez votre sélection' : 'Complete your selection'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {suggestions.map(p => (
          <div key={p.id} className="row gap-3" style={{ alignItems: 'center' }}>
            <div style={{ width: 52, aspectRatio: '4/5', overflow: 'hidden', flexShrink: 0 }}>
              <img src={p.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="serif" style={{ fontSize: 13, lineHeight: 1.3 }}>{p[lang].name}</div>
              <div className="mute" style={{ fontSize: 11, marginTop: 2 }}>{fmt(p.price)}</div>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => addToCart(p.id)}
              style={{ flexShrink: 0, padding: '8px 12px' }}
              aria-label={`${lang === 'fr' ? 'Ajouter' : 'Add'} ${p[lang].name}`}
            >
              <Icon.Plus s={14}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
