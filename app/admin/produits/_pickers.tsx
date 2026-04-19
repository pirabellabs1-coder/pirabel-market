'use client';

import { useState, type ChangeEvent } from 'react';

/* =========================================================
   COLORS picker — visual swatches, add/remove, preset palette
   ========================================================= */

type Color = { n: string; c: string };

const PRESET_COLORS: Color[] = [
  { n: 'Noir',     c: '#1a1712' },
  { n: 'Blanc',    c: '#f4f1ea' },
  { n: 'Ivoire',   c: '#f4f1ea' },
  { n: 'Crème',    c: '#f1e8d5' },
  { n: 'Beige',    c: '#c9b48a' },
  { n: 'Camel',    c: '#b58a5e' },
  { n: 'Cognac',   c: '#8b5a2b' },
  { n: 'Chocolat', c: '#4a2e1a' },
  { n: 'Marron',   c: '#6b4423' },
  { n: 'Gris',     c: '#8c8c8c' },
  { n: 'Argent',   c: '#c4c4c4' },
  { n: 'Or',       c: '#c9a24a' },
  { n: 'Rouge',    c: '#a63d2a' },
  { n: 'Bordeaux', c: '#6d2a30' },
  { n: 'Rose',     c: '#e8b4c0' },
  { n: 'Fuschia',  c: '#c2185b' },
  { n: 'Orange',   c: '#e67e22' },
  { n: 'Jaune',    c: '#f4c430' },
  { n: 'Vert',     c: '#3a7d4a' },
  { n: 'Émeraude', c: '#0f7a4e' },
  { n: 'Kaki',     c: '#6b7a3a' },
  { n: 'Bleu',     c: '#2c5282' },
  { n: 'Marine',   c: '#1a2540' },
  { n: 'Indigo',   c: '#3b4ecc' },
  { n: 'Écaille',  c: '#6b4423' },
  { n: 'Cristal',  c: '#e8e2d4' },
];

export function ColorsInput({ name, initial = [] }: { name: string; initial?: Color[] }) {
  const [colors, setColors] = useState<Color[]>(initial);
  const [showPalette, setShowPalette] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customHex, setCustomHex] = useState('#000000');

  const add = (c: Color) => {
    if (colors.some(x => x.n.toLowerCase() === c.n.toLowerCase())) return;
    setColors([...colors, c]);
  };
  const remove = (i: number) => setColors(colors.filter((_, idx) => idx !== i));
  const addCustom = () => {
    if (!customName.trim()) return;
    add({ n: customName.trim(), c: customHex });
    setCustomName('');
    setCustomHex('#000000');
  };

  // Serialize to hidden input in the same format the server expects: "Nom:#hex, Nom:#hex"
  const serialized = colors.map(c => `${c.n}:${c.c}`).join(', ');

  return (
    <div className="field span-all">
      <label>Couleurs proposées</label>
      <input type="hidden" name={name} value={serialized}/>

      {/* Selected chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10, minHeight: 40, alignItems: 'center', padding: colors.length ? 8 : 0, background: colors.length ? 'var(--ivory-2)' : 'transparent' }}>
        {colors.length === 0 && <span className="mute" style={{ fontSize: 12 }}>Aucune couleur. Ajoute via la palette ou en créer une.</span>}
        {colors.map((c, i) => (
          <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 10px 6px 6px', background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 2 }}>
            <span style={{ width: 20, height: 20, background: c.c, borderRadius: '50%', border: '1px solid rgba(0,0,0,.1)' }}/>
            <span style={{ fontSize: 13 }}>{c.n}</span>
            <button type="button" onClick={() => remove(i)} aria-label="Retirer" style={{ color: 'var(--ink-mute)', padding: 2, fontSize: 14, lineHeight: 1 }}>×</button>
          </div>
        ))}
      </div>

      {/* Toggle preset palette */}
      <div className="row gap-2 wrap mb-2">
        <button type="button" onClick={() => setShowPalette(v => !v)} className="btn btn-outline btn-sm">
          {showPalette ? '▼ Masquer la palette' : '+ Ajouter depuis la palette'}
        </button>
      </div>

      {/* Preset grid */}
      {showPalette && (
        <div style={{ padding: 12, background: 'var(--ivory)', border: '1px solid var(--line)', marginBottom: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 6 }}>
            {PRESET_COLORS.map(c => {
              const already = colors.some(x => x.n.toLowerCase() === c.n.toLowerCase());
              return (
                <button
                  key={c.n}
                  type="button"
                  onClick={() => add(c)}
                  disabled={already}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 8px', background: already ? 'var(--ivory-2)' : 'var(--white)',
                    border: '1px solid var(--line)', cursor: already ? 'default' : 'pointer',
                    opacity: already ? 0.55 : 1, fontSize: 12,
                  }}
                >
                  <span style={{ width: 16, height: 16, background: c.c, borderRadius: '50%', border: '1px solid rgba(0,0,0,.1)', flexShrink: 0 }}/>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.n}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom color picker */}
      <div style={{ padding: 12, background: 'var(--ivory)', border: '1px solid var(--line)' }}>
        <div className="caps mute mb-2" style={{ fontSize: 10 }}>Créer une couleur personnalisée</div>
        <div className="row gap-2 wrap">
          <input
            type="text" placeholder="Nom (ex: Bleu marine)" value={customName}
            onChange={e => setCustomName(e.target.value)}
            className="input"
            style={{ flex: '1 1 180px', background: 'var(--white)' }}
          />
          <input
            type="color" value={customHex}
            onChange={e => setCustomHex(e.target.value)}
            style={{ width: 48, height: 40, border: '1px solid var(--line)', background: 'var(--white)', cursor: 'pointer', padding: 2 }}
            title="Choisir la teinte exacte"
          />
          <input
            type="text" value={customHex} maxLength={7}
            onChange={e => setCustomHex(e.target.value)}
            className="input"
            style={{ width: 96, fontFamily: 'monospace', background: 'var(--white)' }}
          />
          <button type="button" onClick={addCustom} className="btn btn-primary btn-sm" disabled={!customName.trim()}>
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SIZES picker — preset chip banks per type + custom add
   ========================================================= */

const SIZE_BANKS = [
  { label: 'Vêtements', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'] },
  { label: 'Chaussures', sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'] },
  { label: 'Enfant', sizes: ['2A', '4A', '6A', '8A', '10A', '12A'] },
  { label: 'Numérique', sizes: ['34', '36', '38', '40', '42', '44', '46', '48', '50'] },
  { label: 'Unique', sizes: ['Taille unique'] },
];

export function SizesInput({ name, initial = [] }: { name: string; initial?: string[] }) {
  const [sizes, setSizes] = useState<string[]>(initial);
  const [custom, setCustom] = useState('');

  const toggle = (s: string) => {
    setSizes(sizes.includes(s) ? sizes.filter(x => x !== s) : [...sizes, s]);
  };
  const remove = (s: string) => setSizes(sizes.filter(x => x !== s));
  const addCustom = () => {
    const v = custom.trim();
    if (!v || sizes.includes(v)) return;
    setSizes([...sizes, v]);
    setCustom('');
  };
  const setBank = (bankSizes: string[]) => {
    // Replace with just this bank's sizes, preserving selections that match
    const selected = bankSizes.filter(s => sizes.includes(s));
    setSizes(selected.length > 0 ? selected : bankSizes);
  };

  return (
    <div className="field span-all">
      <label>Tailles proposées</label>
      <input type="hidden" name={name} value={sizes.join(', ')}/>

      {/* Selected */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10, minHeight: 40, alignItems: 'center', padding: sizes.length ? 8 : 0, background: sizes.length ? 'var(--ivory-2)' : 'transparent' }}>
        {sizes.length === 0 && <span className="mute" style={{ fontSize: 12 }}>Aucune taille. Choisis une gamme ci-dessous.</span>}
        {sizes.map(s => (
          <div key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: 'var(--ink)', color: 'var(--ivory)', borderRadius: 2, fontSize: 13, fontWeight: 500, letterSpacing: '.04em' }}>
            {s}
            <button type="button" onClick={() => remove(s)} aria-label="Retirer" style={{ color: 'rgba(247,243,236,.7)', padding: 2, fontSize: 14, lineHeight: 1 }}>×</button>
          </div>
        ))}
      </div>

      {/* Size banks */}
      {SIZE_BANKS.map(bank => (
        <div key={bank.label} style={{ padding: '10px 12px', background: 'var(--ivory)', border: '1px solid var(--line)', marginBottom: 8 }}>
          <div className="row between mb-2">
            <div className="caps mute" style={{ fontSize: 10 }}>{bank.label}</div>
            <button type="button" onClick={() => setBank(bank.sizes)} className="mute" style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase' }}>
              Tout sélectionner
            </button>
          </div>
          <div className="row gap-2 wrap">
            {bank.sizes.map(s => {
              const active = sizes.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggle(s)}
                  style={{
                    minWidth: 44, padding: '8px 12px', fontSize: 13,
                    background: active ? 'var(--ink)' : 'var(--white)',
                    color: active ? 'var(--ivory)' : 'var(--ink)',
                    border: '1px solid ' + (active ? 'var(--ink)' : 'var(--line)'),
                    fontWeight: active ? 500 : 400,
                    letterSpacing: '.02em',
                  }}
                >{s}</button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Custom */}
      <div style={{ padding: 12, background: 'var(--ivory)', border: '1px solid var(--line)' }}>
        <div className="caps mute mb-2" style={{ fontSize: 10 }}>Taille personnalisée</div>
        <div className="row gap-2">
          <input
            className="input" placeholder="Ex: 41.5, T0, 90D…"
            value={custom} onChange={e => setCustom(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
            style={{ flex: 1, background: 'var(--white)' }}
          />
          <button type="button" onClick={addCustom} className="btn btn-primary btn-sm" disabled={!custom.trim()}>Ajouter</button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   TAG picker — one-click choice + "Autre"
   ========================================================= */

const PRESET_TAGS = [
  { label: 'Aucun', value: '' },
  { label: 'Nouveau', value: 'Nouveau' },
  { label: 'Coup de cœur', value: 'Coup de cœur' },
  { label: 'Best-seller', value: 'Best-seller' },
  { label: 'Édition limitée', value: 'Édition limitée' },
  { label: 'Artisanat', value: 'Artisanat' },
  { label: 'Exclusif', value: 'Exclusif' },
  { label: 'Promo', value: 'Promo' },
  { label: 'Précommande', value: 'Précommande' },
];

export function TagSelect({ name, initial = '' }: { name: string; initial?: string }) {
  const presetValues = PRESET_TAGS.map(p => p.value);
  const isCustom = initial !== '' && !presetValues.includes(initial);
  const [choice, setChoice] = useState(isCustom ? '__custom__' : initial);
  const [custom, setCustom] = useState(isCustom ? initial : '');

  const value = choice === '__custom__' ? custom : choice;

  return (
    <div className="field">
      <label>Tag produit</label>
      <input type="hidden" name={name} value={value}/>
      <div className="row gap-2 wrap mb-2">
        {PRESET_TAGS.map(p => {
          const active = choice === p.value;
          return (
            <button
              key={p.value || 'none'}
              type="button"
              onClick={() => setChoice(p.value)}
              style={{
                padding: '6px 12px', fontSize: 12,
                background: active ? 'var(--ink)' : 'var(--white)',
                color: active ? 'var(--ivory)' : 'var(--ink)',
                border: '1px solid ' + (active ? 'var(--ink)' : 'var(--line)'),
                letterSpacing: '.02em',
              }}
            >
              {p.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setChoice('__custom__')}
          style={{
            padding: '6px 12px', fontSize: 12,
            background: choice === '__custom__' ? 'var(--ink)' : 'var(--white)',
            color: choice === '__custom__' ? 'var(--ivory)' : 'var(--ink)',
            border: '1px solid ' + (choice === '__custom__' ? 'var(--ink)' : 'var(--line)'),
          }}
        >Autre…</button>
      </div>
      {choice === '__custom__' && (
        <input
          className="input"
          placeholder="Ton tag personnalisé"
          value={custom}
          onChange={e => setCustom(e.target.value)}
        />
      )}
    </div>
  );
}
