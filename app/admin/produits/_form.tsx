'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct, updateProduct } from '../actions';
import { ImageInput } from './_image-input';

type Category = { id: string; fr: string };

type ProductInput = {
  id?: string;
  category?: string | null;
  collection?: string | null;
  name_fr?: string;
  name_en?: string;
  desc_fr?: string | null;
  desc_en?: string | null;
  price?: number;
  old_price?: number | null;
  img?: string;
  img2?: string | null;
  tag?: string | null;
  sizes?: string[] | null;
  colors?: { n: string; c: string }[] | null;
  stock?: number;
  published?: boolean;
};

export function ProductForm({ product, categories }: { product?: ProductInput; categories: Category[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const editing = !!product?.id;

  const sizesStr = product?.sizes?.join(', ') ?? '';
  const colorsStr = product?.colors?.map(c => `${c.n}:${c.c}`).join(', ') ?? '';

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      try {
        if (editing) await updateProduct(product!.id!, fd);
        else await createProduct(fd);
      } catch (err) {
        setError((err as Error).message);
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="admin-card">
      <div className="grid-form">
        <div className="field span-all">
          <label>Nom (Français) *</label>
          <input className="input" name="name_fr" required defaultValue={product?.name_fr ?? ''}/>
        </div>
        <div className="field span-all">
          <label>Nom (Anglais)</label>
          <input className="input" name="name_en" defaultValue={product?.name_en ?? ''} placeholder="Laisser vide = même que français"/>
        </div>

        <div className="field span-all">
          <label>Description (Français)</label>
          <textarea className="textarea" name="desc_fr" rows={3} defaultValue={product?.desc_fr ?? ''}/>
        </div>
        <div className="field span-all">
          <label>Description (Anglais)</label>
          <textarea className="textarea" name="desc_en" rows={3} defaultValue={product?.desc_en ?? ''}/>
        </div>

        <div className="field">
          <label>Catégorie *</label>
          <select className="select" name="category" required defaultValue={product?.category ?? ''}>
            <option value="">— Choisir —</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.fr}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Collection (libre)</label>
          <input className="input" name="collection" defaultValue={product?.collection ?? ''} placeholder="Ex: Souliers, Printemps 2026"/>
        </div>

        <div className="field">
          <label>Prix (FCFA) *</label>
          <input className="input" name="price" type="number" min={0} step={500} required defaultValue={product?.price ?? ''}/>
        </div>
        <div className="field">
          <label>Prix barré (promo, FCFA)</label>
          <input className="input" name="old_price" type="number" min={0} step={500} defaultValue={product?.old_price ?? ''}/>
        </div>

        <ImageInput name="img" label="Image principale" required defaultValue={product?.img ?? ''}/>
        <ImageInput name="img2" label="Image secondaire (hover)" defaultValue={product?.img2 ?? ''}/>

        <div className="field">
          <label>Tag (ex: Nouveau)</label>
          <input className="input" name="tag" defaultValue={product?.tag ?? ''} placeholder="Nouveau, Édition limitée, Artisanat…"/>
        </div>
        <div className="field">
          <label>Stock (−1 = illimité)</label>
          <input className="input" name="stock" type="number" defaultValue={product?.stock ?? 0}/>
        </div>

        <div className="field span-all">
          <label>Tailles (séparées par virgule)</label>
          <input className="input" name="sizes" defaultValue={sizesStr} placeholder="39, 40, 41, 42 ou S, M, L"/>
        </div>

        <div className="field span-all">
          <label>Couleurs (format : Nom:#hex, séparées par virgule)</label>
          <input className="input" name="colors" defaultValue={colorsStr} placeholder="Noir:#1a1712, Cognac:#8b5a2b, Ivoire:#f4f1ea"/>
        </div>

        <div className="field span-all row gap-3" style={{ flexDirection: 'row', alignItems: 'center' }}>
          <input type="checkbox" name="published" id="published" defaultChecked={product?.published ?? true} style={{ width: 18, height: 18 }}/>
          <label htmlFor="published" style={{ marginBottom: 0, letterSpacing: 0, textTransform: 'none', fontSize: 14, color: 'var(--ink)' }}>Publié (visible sur la boutique)</label>
        </div>
      </div>

      {error && <p style={{ color: '#a63d2a', fontSize: 13, marginTop: 16 }}>{error}</p>}

      <div className="row gap-3 mt-8">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? 'Enregistrement…' : editing ? 'Enregistrer' : 'Créer le produit'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => router.push('/admin/produits')}>Annuler</button>
      </div>
    </form>
  );
}
