import type { ReactNode } from 'react';
import { SimplePage } from './simple-page';

export function LegalPage({ title, eyebrow, updatedOn, children }: {
  title: string;
  eyebrow: string;
  updatedOn: string;
  children: ReactNode;
}) {
  return (
    <SimplePage title={title} eyebrow={eyebrow}>
      <div className="mute mb-8" style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase' }}>
        Dernière mise à jour : {updatedOn}
      </div>
      <div className="legal-body" style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--ink-soft)', maxWidth: 780 }}>
        {children}
      </div>
    </SimplePage>
  );
}
