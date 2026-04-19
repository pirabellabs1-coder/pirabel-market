'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createJournalPost, updateJournalPost } from '../actions';
import { RichEditor } from '@/components/rich-editor';

type PostInput = {
  id?: string;
  slug?: string;
  title_fr?: string;
  title_en?: string | null;
  excerpt_fr?: string | null;
  excerpt_en?: string | null;
  body_fr?: string;
  body_en?: string | null;
  cover_img?: string | null;
  category?: string | null;
  author?: string | null;
  published?: boolean;
};

export function JournalForm({ post }: { post?: PostInput }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [cover, setCover] = useState(post?.cover_img ?? '');
  const [bodyFr, setBodyFr] = useState(post?.body_fr ?? '');
  const [bodyEn, setBodyEn] = useState(post?.body_en ?? '');
  const editing = !!post?.id;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    // Inject rich editor HTML (form inputs can't read from non-input controls)
    fd.set('body_fr', bodyFr);
    fd.set('body_en', bodyEn);
    start(async () => {
      try {
        if (editing) await updateJournalPost(post!.id!, fd);
        else await createJournalPost(fd);
      } catch (err) { setError((err as Error).message); }
    });
  };

  return (
    <form onSubmit={onSubmit} className="admin-card">
      <div className="grid-form">
        <div className="field span-all"><label>Titre (Français) *</label>
          <input className="input" name="title_fr" required defaultValue={post?.title_fr ?? ''}/>
        </div>
        <div className="field span-all"><label>Titre (Anglais)</label>
          <input className="input" name="title_en" defaultValue={post?.title_en ?? ''}/>
        </div>
        <div className="field"><label>Slug URL *</label>
          <input className="input" name="slug" required defaultValue={post?.slug ?? ''} placeholder="patine-du-cuir"/>
        </div>
        <div className="field"><label>Catégorie</label>
          <input className="input" name="category" defaultValue={post?.category ?? ''} placeholder="Savoir-faire"/>
        </div>
        <div className="field"><label>Auteur</label>
          <input className="input" name="author" defaultValue={post?.author ?? 'Pirabel'}/>
        </div>
        <div className="field">
          <label>Image de couverture (URL)</label>
          <input className="input" type="url" name="cover_img" value={cover} onChange={e => setCover(e.target.value)} placeholder="https://…"/>
          {cover && <div style={{ marginTop: 8, width: 180, aspectRatio: '3/2', overflow: 'hidden', background: 'var(--ivory-2)' }}><img src={cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/></div>}
        </div>

        <div className="field span-all">
          <label>Extrait (FR)</label>
          <textarea className="textarea" name="excerpt_fr" rows={2} defaultValue={post?.excerpt_fr ?? ''}/>
        </div>

        <div className="field span-all">
          <label>Contenu (FR) *</label>
          <RichEditor value={bodyFr} onChange={setBodyFr} minHeight={380} placeholder="Écris ton article…"/>
          <p className="mute mt-2" style={{ fontSize: 11 }}>Utilise la barre d&apos;outils : titres, listes, liens, images (téléverser ou URL), citations.</p>
        </div>

        <div className="field span-all">
          <label>Contenu (EN, optionnel)</label>
          <RichEditor value={bodyEn} onChange={setBodyEn} minHeight={240} placeholder="Optional English translation…"/>
        </div>

        <div className="field span-all row gap-3" style={{ flexDirection: 'row', alignItems: 'center' }}>
          <input type="checkbox" name="published" id="published" defaultChecked={post?.published ?? false} style={{ width: 18, height: 18 }}/>
          <label htmlFor="published" style={{ marginBottom: 0, letterSpacing: 0, textTransform: 'none', fontSize: 14, color: 'var(--ink)' }}>Publié (visible sur /journal)</label>
        </div>
      </div>

      {error && <p style={{ color: '#a63d2a', fontSize: 13, marginTop: 16 }}>{error}</p>}

      <div className="row gap-3 mt-8">
        <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? '…' : editing ? 'Enregistrer' : 'Créer l\'article'}</button>
        <button type="button" className="btn btn-ghost" onClick={() => router.push('/admin/journal')}>Annuler</button>
      </div>
    </form>
  );
}
