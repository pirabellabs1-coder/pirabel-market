'use client';

import { useRef, useState, type ChangeEvent } from 'react';

type Props = {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
};

export function ImageInput({ name, label, defaultValue = '', required = false }: Props) {
  const [value, setValue] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null); setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: 'Upload échoué' }));
        throw new Error(j.error);
      }
      const { url } = await res.json();
      setValue(url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="field span-all">
      <label>{label}{required ? ' *' : ''}</label>
      <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', flexWrap: 'wrap' }}>
        <input
          className="input"
          type="url"
          name={name}
          required={required}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Coller une URL ou téléverser…"
          style={{ flex: '1 1 260px', minWidth: 0 }}
        />
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{ flexShrink: 0 }}
        >
          {uploading ? 'Envoi…' : '📁 Téléverser'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={onFile}
          style={{ display: 'none' }}
        />
      </div>
      {error && <p style={{ color: '#a63d2a', fontSize: 12, marginTop: 6 }}>{error}</p>}
      {value && (
        <div style={{ marginTop: 8, width: 120, aspectRatio: '4/5', overflow: 'hidden', background: 'var(--ivory-2)' }}>
          <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
        </div>
      )}
    </div>
  );
}
