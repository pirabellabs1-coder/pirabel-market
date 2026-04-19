'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { createCategory, updateCategory, deleteCategory } from '../actions';

type Cat = { id: string; fr: string; en: string; img: string | null; sort_order: number };

export function CategoriesManager({ categories }: { categories: Cat[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      try {
        await createCategory(fd);
        setAdding(false);
        (e.target as HTMLFormElement).reset();
      } catch (err) { setError((err as Error).message); }
    });
  };

  const onUpdate = (id: string, e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      try {
        await updateCategory(id, fd);
        setEditing(null);
      } catch (err) { setError((err as Error).message); }
    });
  };

  const onDelete = (id: string) => {
    if (!confirm(`Supprimer la catégorie "${id}" ? Les produits resteront mais sans catégorie.`)) return;
    start(async () => {
      try { await deleteCategory(id); }
      catch (err) { setError((err as Error).message); }
    });
  };

  return (
    <div>
      {error && <p style={{ color: '#a63d2a', marginBottom: 16 }}>{error}</p>}

      <div className="admin-card" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead>
            <tr><th>ID</th><th>Français</th><th>Anglais</th><th>Image</th><th>Ordre</th><th></th></tr>
          </thead>
          <tbody>
            {categories.map(c => editing === c.id ? (
              <tr key={c.id}>
                <td colSpan={6}>
                  <form onSubmit={(e) => onUpdate(c.id, e)} className="grid-form" style={{ padding: 16 }}>
                    <div className="field"><label>Français *</label><input name="fr" required className="input" defaultValue={c.fr}/></div>
                    <div className="field"><label>Anglais</label><input name="en" className="input" defaultValue={c.en}/></div>
                    <div className="field span-all"><label>URL image</label><input name="img" type="url" className="input" defaultValue={c.img ?? ''}/></div>
                    <div className="field"><label>Ordre</label><input name="sort_order" type="number" className="input" defaultValue={c.sort_order}/></div>
                    <div className="span-all row gap-3">
                      <button type="submit" className="btn btn-primary" disabled={pending}>Enregistrer</button>
                      <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Annuler</button>
                    </div>
                  </form>
                </td>
              </tr>
            ) : (
              <tr key={c.id}>
                <td className="mono mute" style={{ fontSize: 12 }}>{c.id}</td>
                <td>{c.fr}</td>
                <td className="mute">{c.en}</td>
                <td>
                  {c.img && <div style={{ width: 48, height: 48, overflow: 'hidden' }}><img src={c.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/></div>}
                </td>
                <td>{c.sort_order}</td>
                <td className="row gap-2">
                  <button className="btn btn-outline btn-sm" onClick={() => setEditing(c.id)}>Modifier</button>
                  <button className="btn btn-outline btn-sm" style={{ borderColor: '#c56060', color: '#a63d2a' }} onClick={() => onDelete(c.id)}>Supprimer</button>
                </td>
              </tr>
            ))}

            {adding && (
              <tr>
                <td colSpan={6}>
                  <form onSubmit={onAdd} className="grid-form" style={{ padding: 16 }}>
                    <div className="field"><label>ID (slug, laisser vide = auto)</label><input name="id" className="input" placeholder="ex: bijoux"/></div>
                    <div className="field"><label>Ordre</label><input name="sort_order" type="number" className="input" defaultValue={categories.length + 1}/></div>
                    <div className="field"><label>Français *</label><input name="fr" required className="input"/></div>
                    <div className="field"><label>Anglais</label><input name="en" className="input"/></div>
                    <div className="field span-all"><label>URL image</label><input name="img" type="url" className="input" placeholder="https://…"/></div>
                    <div className="span-all row gap-3">
                      <button type="submit" className="btn btn-primary" disabled={pending}>Créer</button>
                      <button type="button" className="btn btn-ghost" onClick={() => setAdding(false)}>Annuler</button>
                    </div>
                  </form>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!adding && (
        <div className="mt-6">
          <button className="btn btn-outline" onClick={() => setAdding(true)}>+ Nouvelle catégorie</button>
        </div>
      )}
    </div>
  );
}
