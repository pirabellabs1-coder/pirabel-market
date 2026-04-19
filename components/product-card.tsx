'use client';

import { useRouter } from 'next/navigation';
import { useState, type MouseEvent } from 'react';
import { Icon } from './icons';
import { useStore } from './store-provider';
import type { Product } from '@/lib/types';
import { fmt } from '@/lib/format';

export function ProductCard({ p }: { p: Product }) {
  const router = useRouter();
  const { lang, wish, toggleWish, addToCart } = useStore();
  const [hovered, setHovered] = useState(false);
  const wished = wish.includes(p.id);
  const discount = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;

  const onCardClick = () => router.push(`/produit/${p.id}`);
  const onWishClick = (e: MouseEvent) => { e.stopPropagation(); toggleWish(p.id); };
  const onAddClick = (e: MouseEvent) => { e.stopPropagation(); addToCart(p.id); };

  return (
    <div
      className="pcard"
      onClick={onCardClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onCardClick(); }}
    >
      <div className="pcard-img">
        {p.tag && <span className="pcard-label">{p.tag}</span>}
        {discount > 0 && <span className="pcard-label" style={{ top: p.tag ? 36 : 12 }}>−{discount}%</span>}
        <button className={`pcard-wish ${wished ? 'active' : ''}`} onClick={onWishClick} aria-label="Favori">
          <Icon.Heart/>
        </button>
        <img
          src={hovered && p.img2 ? p.img2 : p.img}
          alt={p[lang].name}
          loading="lazy"
        />
        <div className="pcard-quick" onClick={onAddClick} role="button">
          + {lang === 'fr' ? 'Ajouter au sac' : 'Add to bag'}
        </div>
      </div>
      <div className="pcard-cat">{p.collection}</div>
      <div className="pcard-name">{p[lang].name}</div>
      <div className="pcard-price">
        <span>{fmt(p.price)}</span>
        {p.old && <span className="old">{fmt(p.old)}</span>}
      </div>
    </div>
  );
}
