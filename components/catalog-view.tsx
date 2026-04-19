'use client';

import { useMemo, useState } from 'react';
import { useStore } from './store-provider';
import { ProductCard } from './product-card';
import { products } from '@/lib/products';
import { categories } from '@/lib/categories';

type Sort = 'featured' | 'price-asc' | 'price-desc';

export function CatalogView({ category: initialCategory }: { category?: string }) {
  const { lang } = useStore();
  const [cat, setCat] = useState<string>(initialCategory || 'all');
  const [sort, setSort] = useState<Sort>('featured');

  const items = useMemo(() => {
    let list = products.filter(p => cat === 'all' || p.category === cat);
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [cat, sort]);

  const catMeta = categories.find(c => c.id === cat);

  return (
    <main>
      <section style={{ padding: '56px 0 32px', textAlign: 'center', borderBottom: '1px solid var(--line)' }}>
        <div className="container">
          <div className="section-eyebrow">{lang === 'fr' ? 'Catalogue' : 'Catalog'}</div>
          <h1 className="serif" style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 400, margin: '8px 0 0' }}>
            {cat === 'all' ? (lang === 'fr' ? 'Toutes les pièces' : 'All pieces') : catMeta?.[lang]}
          </h1>
          <p className="mute mt-4">{items.length} {lang === 'fr' ? 'articles' : 'items'}</p>
        </div>
      </section>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 32 }}>
        <div className="row between wrap gap-4" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 20, marginBottom: 40 }}>
          <div className="row gap-4 wrap">
            {[{ id: 'all', l: lang === 'fr' ? 'Tout' : 'All' }, ...categories.map(c => ({ id: c.id, l: c[lang] }))].map(c => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                style={{
                  fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase',
                  color: cat === c.id ? 'var(--ink)' : 'var(--ink-mute)',
                  borderBottom: cat === c.id ? '1px solid var(--ink)' : '1px solid transparent',
                  paddingBottom: 4,
                }}
              >{c.l}</button>
            ))}
          </div>
          <select
            className="select"
            style={{ width: 'auto', paddingRight: 24 }}
            value={sort}
            onChange={e => setSort(e.target.value as Sort)}
          >
            <option value="featured">{lang === 'fr' ? 'En vedette' : 'Featured'}</option>
            <option value="price-asc">{lang === 'fr' ? 'Prix croissant' : 'Price: low to high'}</option>
            <option value="price-desc">{lang === 'fr' ? 'Prix décroissant' : 'Price: high to low'}</option>
          </select>
        </div>

        <div className="grid-4">
          {items.map(p => <ProductCard key={p.id} p={p}/>)}
        </div>

        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <p className="mute">{lang === 'fr' ? 'Aucun article trouvé.' : 'No items found.'}</p>
          </div>
        )}
      </div>
    </main>
  );
}
