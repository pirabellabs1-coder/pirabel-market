'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon } from './icons';
import { ProductCard } from './product-card';
import { ProductReviews } from './product-reviews';
import { BackInStock } from './back-in-stock';
import { useStore } from './store-provider';
import type { Product } from '@/lib/types';
import { fmt } from '@/lib/format';

type Props = { product: Product | null; related: Product[] };

export function ProductView({ product, related }: Props) {
  const router = useRouter();
  const { lang, addToCart, toggleWish, wish } = useStore();
  const p = product;

  const [size, setSize] = useState<string | undefined>(p?.size?.[0]);
  const [color, setColor] = useState<{ n: string; c: string } | undefined>(p?.color?.[0]);
  const [qty, setQty] = useState(1);
  const [mainImg, setMainImg] = useState(p?.img);

  if (!p) {
    return (
      <main className="container" style={{ padding: 80, textAlign: 'center' }}>
        <h1 className="serif" style={{ fontSize: 32 }}>{lang === 'fr' ? 'Introuvable' : 'Not found'}</h1>
        <Link className="btn btn-outline mt-8" href="/catalogue">{lang === 'fr' ? 'Retour au catalogue' : 'Back to catalog'}</Link>
      </main>
    );
  }

  const thumbs = [p.img, p.img2, p.img, p.img2].filter((x): x is string => !!x);
  const outOfStock = p.stock === 0;
  const lowStock = typeof p.stock === 'number' && p.stock > 0 && p.stock <= 5;

  useEffect(() => {
    try {
      let sid = sessionStorage.getItem('pb_sid');
      if (!sid) { sid = crypto.randomUUID(); sessionStorage.setItem('pb_sid', sid); }
      fetch('/api/track-view', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ product_id: p.id, session_id: sid }),
        keepalive: true,
      }).catch(() => {});
      const w = window as unknown as { gtag?: (...args: unknown[]) => void };
      if (w.gtag) {
        w.gtag('event', 'view_item', {
          currency: 'XOF', value: p.price,
          items: [{ item_id: p.id, item_name: p.fr.name, item_category: p.category, price: p.price }],
        });
      }
    } catch {}
  }, [p.id, p.price, p.fr.name, p.category]);

  return (
    <main>
      <div className="container" style={{ paddingTop: 24, fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
        <Link href="/">{lang === 'fr' ? 'Accueil' : 'Home'}</Link>{' / '}
        <Link href={`/catalogue/${p.category}`}>{p.collection}</Link>{' / '}
        <span style={{ color: 'var(--ink)' }}>{p[lang].name}</span>
      </div>

      <div
        className="container pdp-grid"
        style={{ display: 'grid', gap: 80, paddingTop: 32, paddingBottom: 80 }}
      >
        <div>
          <div style={{ aspectRatio: '4/5', background: 'var(--ivory-2)', overflow: 'hidden' }}>
            <img src={mainImg} alt={p[lang].name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${thumbs.length}, 1fr)`, gap: 12, marginTop: 12 }}>
            {thumbs.map((im, i) => (
              <button
                key={i}
                onClick={() => setMainImg(im)}
                style={{ aspectRatio: 1, overflow: 'hidden', border: mainImg === im ? '1px solid var(--ink)' : '1px solid var(--line)', padding: 0 }}
              >
                <img src={im} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/>
              </button>
            ))}
          </div>
        </div>

        <div className="pdp-info" style={{ position: 'sticky', top: 120, alignSelf: 'start' }}>
          <div className="section-eyebrow">{p.collection}</div>
          <h1 className="serif" style={{ fontSize: 36, fontWeight: 400, lineHeight: 1.15, margin: '8px 0 20px' }}>{p[lang].name}</h1>
          <div className="pdp-price">
            {fmt(p.price)}
            {p.old && <span className="old">{fmt(p.old)}</span>}
          </div>
          <p className="mute mt-2" style={{ fontSize: 12 }}>
            {lang === 'fr' ? 'TTC, hors frais de livraison' : 'Tax included, delivery not included'}
          </p>

          {p[lang].desc && <p className="mute mt-6" style={{ fontSize: 14, lineHeight: 1.7 }}>{p[lang].desc}</p>}

          {p.color && (
            <div className="mt-8">
              <div className="caps mb-4">
                {lang === 'fr' ? 'Couleur' : 'Color'} — <span style={{ textTransform: 'none', color: 'var(--ink-mute)', letterSpacing: '.02em' }}>{color?.n}</span>
              </div>
              <div className="row gap-3">
                {p.color.map(c => (
                  <button
                    key={c.n}
                    onClick={() => setColor(c)}
                    className={`swatch ${color?.n === c.n ? 'active' : ''}`}
                    style={{ background: c.c }}
                    aria-label={c.n}
                    title={c.n}
                  />
                ))}
              </div>
            </div>
          )}

          {p.size && (
            <div className="mt-8">
              <div className="caps mb-4 row between">
                <span>{lang === 'fr' ? 'Taille' : 'Size'}</span>
                <a href="#" style={{ fontSize: 10, letterSpacing: '.14em', color: 'var(--ink-mute)' }}>{lang === 'fr' ? 'Guide des tailles' : 'Size guide'}</a>
              </div>
              <div className="row gap-2 wrap">
                {p.size.map(s => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`size-chip ${size === s ? 'active' : ''}`}
                  >{s}</button>
                ))}
              </div>
            </div>
          )}

          {lowStock && (
            <p className="mt-6" style={{ fontSize: 13, color: 'var(--gold)', letterSpacing: '.04em' }}>
              {lang === 'fr' ? `Plus que ${p.stock} exemplaire${(p.stock ?? 0) > 1 ? 's' : ''} disponible${(p.stock ?? 0) > 1 ? 's' : ''}.` : `Only ${p.stock} left in stock.`}
            </p>
          )}

          {outOfStock && <BackInStock productId={p.id}/>}

          <div className="mt-8 row gap-3">
            <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--line)', opacity: outOfStock ? 0.5 : 1 }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 44, height: 52 }} aria-label="−" disabled={outOfStock}><Icon.Minus/></button>
              <span style={{ minWidth: 32, textAlign: 'center', fontSize: 14 }}>{qty}</span>
              <button onClick={() => setQty(qty + 1)} style={{ width: 44, height: 52 }} aria-label="+" disabled={outOfStock}><Icon.Plus/></button>
            </div>
            <button
              className="btn btn-outline btn-lg"
              style={{ flex: 1, height: 52 }}
              disabled={outOfStock}
              onClick={() => { for (let i = 0; i < qty; i++) addToCart(p.id, size, color?.n); }}
            >
              {outOfStock
                ? (lang === 'fr' ? 'Rupture de stock' : 'Out of stock')
                : (lang === 'fr' ? 'Ajouter au sac' : 'Add to bag')}
            </button>
            <button className="btn btn-outline" style={{ height: 52, padding: '0 20px' }} onClick={() => toggleWish(p.id)} aria-label="Favori">
              <Icon.Heart/>
            </button>
          </div>

          <button
            className="btn btn-primary btn-lg btn-block mt-4"
            style={{ height: 52 }}
            disabled={outOfStock}
            onClick={() => {
              for (let i = 0; i < qty; i++) addToCart(p.id, size, color?.n);
              router.push('/commande');
            }}
          >
            {outOfStock
              ? (lang === 'fr' ? 'Rupture de stock' : 'Out of stock')
              : (lang === 'fr' ? 'Acheter maintenant' : 'Buy now')}
          </button>

          <div className="mt-8" style={{ borderTop: '1px solid var(--line)', paddingTop: 24 }}>
            {[
              { t: lang === 'fr' ? 'Livraison & retours' : 'Shipping & returns', d: lang === 'fr' ? 'Livraison offerte dès 50 000 FCFA. Retours sous 14 jours.' : 'Free shipping over 50,000 FCFA. 14-day returns.' },
              { t: lang === 'fr' ? 'Service client' : 'Customer care', d: lang === 'fr' ? 'Une conseillère disponible par WhatsApp, 7j/7.' : 'WhatsApp advisor available 7 days a week.' },
              { t: lang === 'fr' ? 'Matériaux & entretien' : 'Materials & care', d: lang === 'fr' ? 'Matériaux premium. Entretien recommandé en pressing.' : 'Premium materials. Professional cleaning recommended.' },
            ].map((s, i) => (
              <details key={i} style={{ padding: '16px 0', borderBottom: '1px solid var(--line)' }}>
                <summary style={{ cursor: 'pointer', fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', listStyle: 'none', display: 'flex', justifyContent: 'space-between' }}>
                  {s.t} <span>+</span>
                </summary>
                <p className="mute mt-4" style={{ fontSize: 13, lineHeight: 1.6 }}>{s.d}</p>
              </details>
            ))}
          </div>
        </div>
      </div>

      <ProductReviews productId={p.id}/>

      {related.length > 0 && (
        <section className="section-sm" style={{ background: 'var(--ivory-2)' }}>
          <div className="container">
            <div className="section-head">
              <h2 className="section-title">{lang === 'fr' ? 'Autres pièces à découvrir' : 'You may also like'}</h2>
            </div>
            <div className="grid-4">
              {related.map(x => <ProductCard key={x.id} p={x}/>)}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
