'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { RichEditor } from '@/components/rich-editor';
import { createLookbook, updateLookbook } from '../actions';
import { ImageInput } from '../produits/_image-input';
import type { Product } from '@/lib/types';
import { fmt } from '@/lib/format';

type LookbookInput = {
  id?: string; slug?: string;
  title_fr?: string; title_en?: string | null;
  description_fr?: string | null; description_en?: string | null;
  cover_img?: string | null;
  product_ids?: string[] | null;
  published?: boolean;
};

export function LookbookForm({ lookbook, products }: { lookbook?: LookbookInput; products: Product[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [descFr, setDescFr] = useState(lookbook?.description_fr ?? '');
  const [descEn, setDescEn] = useState(lookbook?.description_en ?? '');
  const [selected, setSelected] = useState<Set<string>>(new Set(lookbook?.product_ids ?? []));
  const [filter, setFilter] = useState('');
  const editing = !!lookbook?.id;

  const toggleProduct = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set('description_fr', descFr);
    fd.set('description_en', descEn);
    fd.set('product_ids', [...selected].join(','));
    start(async () => {
      try {
        if (editing) await updateLookbook(lookbook!.id!, fd);
        else await createLookbook(fd);
      } catch (err) { setError((err as Error).message); }
    });
  };

  const filtered = filter
    ? products.filter(p =>
        p.fr.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.collection.toLowerCase().includes(filter.toLowerCase()))
    : products;

  return (
    <form onSubmit={onSubmit} className="admin-card">
      <div className="grid-form">
        <div className="field span-all"><label>Titre (Français) *</label>
          <input className="input" name="title_fr" required defaultValue={lookbook?.title_fr ?? ''}/>
        </div>
        <div className="field span-all"><label>Titre (Anglais)</label>
          <input className="input" name="title_en" defaultValue={lookbook?.title_en ?? ''}/>
        </div>
        <div className="field"><label>Slug URL *</label>
          <input className="input" name="slug" required defaultValue={lookbook?.slug ?? ''} placeholder="dimanche-a-cotonou"/>
        </div>
        <ImageInput name="cover_img" label="Image de couverture" defaultValue={lookbook?.cover_img ?? ''}/>

        <div className="field span-all">
          <label>Texte d&apos;accompagnement (FR)</label>
          <RichEditor value={descFr} onChange={setDescFr} minHeight={200} placeholder="Raconte l'ambiance, les matières, l'occasion…"/>
        </div>
        <div className="field span-all">
          <label>Texte d&apos;accompagnement (EN, optionnel)</label>
          <RichEditor value={descEn} onChange={setDescEn} minHeight={160}/>
        </div>

        <div className="field span-all">
          <label>Produits tagués ({selected.size})</label>
          <input
            className="input mb-4"
            placeholder="Chercher par nom ou collection…"
            value={filter} onChange={e => setFilter(e.target.value)}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, maxHeight: 400, overflowY: 'auto', padding: 8, border: '1px solid var(--line)', background: 'var(--ivory)' }}>
            {filtered.map(p => {
              const active = selected.has(p.id);
              return (
                <button
                  key={p.id} type="button" onClick={() => toggleProduct(p.id)}
                  style={{
                    padding: 8, textAlign: 'left',
                    border: active ? '2px solid var(--ink)' : '1px solid var(--line)',
                    background: active ? 'var(--ivory-2)' : 'var(--white)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ aspectRatio: '4/5', overflow: 'hidden', background: 'var(--ivory-2)', marginBottom: 6 }}>
                    <img src={p.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 13, lineHeight: 1.2 }}>{p.fr.name}</div>
                  <div className="mute" style={{ fontSize: 11, marginTop: 2 }}>{fmt(p.price)}</div>
                  {active && <div style={{ fontSize: 10, color: 'var(--ink)', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 4 }}>✓ Tagué</div>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="field span-all row gap-3" style={{ flexDirection: 'row', alignItems: 'center' }}>
          <input type="checkbox" name="published" id="published" defaultChecked={lookbook?.published ?? false} style={{ width: 18, height: 18 }}/>
          <label htmlFor="published" style={{ marginBottom: 0, letterSpacing: 0, textTransform: 'none', fontSize: 14 }}>Publié</label>
        </div>
      </div>

      {error && <p style={{ color: '#a63d2a', fontSize: 13, marginTop: 16 }}>{error}</p>}

      <div className="row gap-3 mt-8">
        <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? '…' : editing ? 'Enregistrer' : 'Créer le lookbook'}</button>
        <button type="button" className="btn btn-ghost" onClick={() => router.push('/admin/lookbooks')}>Annuler</button>
      </div>
    </form>
  );
}
