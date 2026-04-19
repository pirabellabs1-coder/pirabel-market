'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { upsertPopup, deletePopup } from '../actions';
import { RichEditor } from '@/components/rich-editor';
import { ImageInput } from '../produits/_image-input';

type Popup = {
  id: string; title: string; body: string | null;
  cta_label: string | null; cta_url: string | null;
  image: string | null; position: string;
  trigger_type: string; trigger_value: number;
  show_once: boolean; active: boolean;
  starts_at: string; ends_at: string | null;
};

export function PopupsManager({ popups }: { popups: Popup[] }) {
  const [editing, setEditing] = useState<Popup | null>(null);
  const [adding, setAdding] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState('');

  const open = (p: Popup | null) => {
    if (p) {
      setEditing(p);
      setBody(p.body ?? '');
    } else {
      setAdding(true);
      setBody('');
    }
  };

  const close = () => {
    setAdding(false);
    setEditing(null);
    setBody('');
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set('body', body); // inject rich editor HTML
    start(async () => {
      try { await upsertPopup(fd); close(); }
      catch (err) { setError((err as Error).message); }
    });
  };

  const onDelete = (id: string) => {
    if (!confirm('Supprimer cette popup ?')) return;
    start(() => deletePopup(id));
  };

  const empty: Popup = { id: '', title: '', body: '', cta_label: '', cta_url: '', image: '', position: 'center', trigger_type: 'delay', trigger_value: 5, show_once: true, active: true, starts_at: new Date().toISOString(), ends_at: null };
  const current = editing ?? (adding ? empty : null);

  return (
    <div>
      {error && <p style={{ color: '#a63d2a', marginBottom: 16 }}>{error}</p>}

      {current && (
        <form onSubmit={onSubmit} className="admin-card mb-6">
          {current.id && <input type="hidden" name="id" value={current.id}/>}
          <div className="grid-form">
            <div className="field span-all">
              <label>Titre *</label>
              <input name="title" required className="input" defaultValue={current.title} placeholder="Soldes Printemps, −20% avec PRIMO"/>
            </div>

            <div className="field span-all">
              <label>Texte du popup</label>
              <RichEditor
                value={body} onChange={setBody}
                minHeight={200}
                placeholder="Corps du popup — gras, italique, liens, images."
              />
              <p className="mute mt-2" style={{ fontSize: 11 }}>Garde court : 2-3 phrases maximum pour ne pas gêner le visiteur.</p>
            </div>

            <div className="field">
              <label>Bouton (texte)</label>
              <input name="cta_label" className="input" defaultValue={current.cta_label ?? ''} placeholder="Découvrir"/>
            </div>
            <div className="field">
              <label>Bouton (URL)</label>
              <input name="cta_url" type="url" className="input" defaultValue={current.cta_url ?? ''} placeholder="/catalogue ou https://…"/>
            </div>

            <ImageInput name="image" label="Image du popup (optionnelle)" defaultValue={current.image ?? ''}/>

            <div className="field">
              <label>Déclencheur</label>
              <select name="trigger_type" className="select" defaultValue={current.trigger_type}>
                <option value="delay">Après X secondes</option>
                <option value="scroll">Au X% de scroll</option>
                <option value="exit">Intention de sortie</option>
              </select>
            </div>
            <div className="field"><label>Valeur (sec ou %)</label>
              <input name="trigger_value" type="number" min={0} className="input" defaultValue={current.trigger_value}/>
            </div>
            <div className="field"><label>Position</label>
              <select name="position" className="select" defaultValue={current.position}>
                <option value="center">Centre</option>
                <option value="bottom">Bas</option>
                <option value="top">Haut</option>
              </select>
            </div>
            <div className="field"><label>Fin (laisser vide = jamais)</label>
              <input name="ends_at" type="datetime-local" className="input" defaultValue={current.ends_at ? new Date(current.ends_at).toISOString().slice(0, 16) : ''}/>
            </div>

            <div className="field span-all row gap-6" style={{ flexDirection: 'row' }}>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14, letterSpacing: 0, textTransform: 'none', color: 'var(--ink)' }}>
                <input type="checkbox" name="active" defaultChecked={current.active}/> Actif
              </label>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14, letterSpacing: 0, textTransform: 'none', color: 'var(--ink)' }}>
                <input type="checkbox" name="show_once" defaultChecked={current.show_once}/> Afficher 1 seule fois par visiteur
              </label>
            </div>
          </div>
          <div className="row gap-3 mt-6">
            <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? '…' : current.id ? 'Enregistrer' : 'Créer'}</button>
            <button type="button" className="btn btn-ghost" onClick={close}>Annuler</button>
          </div>
        </form>
      )}

      <div className="admin-card" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead><tr><th>Titre</th><th>Déclencheur</th><th>Période</th><th>État</th><th></th></tr></thead>
          <tbody>
            {popups.map(p => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td className="mute">{p.trigger_type} · {p.trigger_value}{p.trigger_type === 'scroll' ? '%' : 's'}</td>
                <td className="mute" style={{ fontSize: 12 }}>{new Date(p.starts_at).toLocaleDateString('fr-FR')} → {p.ends_at ? new Date(p.ends_at).toLocaleDateString('fr-FR') : '∞'}</td>
                <td><span className="admin-badge">{p.active ? 'Actif' : 'Off'}</span></td>
                <td className="row gap-2">
                  <button className="btn btn-outline btn-sm" onClick={() => open(p)}>Modifier</button>
                  <button className="btn btn-outline btn-sm" style={{ borderColor: '#c56060', color: '#a63d2a' }} onClick={() => onDelete(p.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
            {popups.length === 0 && !adding && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 60 }}><p className="mute">Aucune popup.</p></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {!current && (
        <div className="mt-6">
          <button className="btn btn-primary" onClick={() => open(null)}>+ Nouvelle popup</button>
        </div>
      )}
    </div>
  );
}
