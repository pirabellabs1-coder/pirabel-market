'use client';

import Link from 'next/link';

const PRESETS = [
  { id: 'today',       l: "Aujourd'hui" },
  { id: 'yesterday',   l: 'Hier' },
  { id: '7d',          l: '7 jours' },
  { id: '30d',         l: '30 jours' },
  { id: 'mtd',         l: 'Ce mois' },
  { id: 'last_month',  l: 'Mois dernier' },
  { id: 'ytd',         l: 'Cette année' },
];

export function PeriodPicker({ current }: { current: string }) {
  return (
    <div className="admin-card mb-6" style={{ padding: '12px 16px' }}>
      <div className="row gap-2 wrap">
        {PRESETS.map(p => {
          const active = p.id === current;
          return (
            <Link
              key={p.id}
              href={`?p=${p.id}`}
              style={{
                padding: '8px 14px', fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase',
                background: active ? 'var(--ink)' : 'transparent',
                color: active ? 'var(--ivory)' : 'var(--ink-soft)',
                border: '1px solid var(--line)',
                fontWeight: active ? 500 : 400,
              }}
            >{p.l}</Link>
          );
        })}
      </div>
    </div>
  );
}
