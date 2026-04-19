import type { ReactNode } from 'react';

export function SimplePage({ title, eyebrow, children }: { title: string; eyebrow?: string; children: ReactNode }) {
  return (
    <main>
      <section style={{ padding: '80px 0 40px', textAlign: 'center', borderBottom: '1px solid var(--line)' }}>
        <div className="container">
          {eyebrow && <div className="section-eyebrow">{eyebrow}</div>}
          <h1 className="serif" style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 400, margin: '8px 0 0' }}>{title}</h1>
        </div>
      </section>
      <div className="container-tight" style={{ padding: '64px 40px 80px' }}>{children}</div>
    </main>
  );
}
