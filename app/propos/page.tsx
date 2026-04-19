'use client';

import { useStore } from '@/components/store-provider';
import { i18n } from '@/lib/i18n';
import { img } from '@/lib/format';

export default function AboutPage() {
  const { lang } = useStore();
  const t = i18n[lang];

  return (
    <main>
      <section style={{ height: '70vh', minHeight: 520, position: 'relative', overflow: 'hidden' }}>
        <img src={img('photo-1558769132-cb1aea458c5e', 2000)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,.5))', display: 'flex', alignItems: 'flex-end', padding: '0 40px 64px' }}>
          <div className="container" style={{ color: 'var(--ivory)' }}>
            <div className="section-eyebrow" style={{ color: 'rgba(247,243,236,.7)' }}>{lang === 'fr' ? 'La Maison' : 'The House'}</div>
            <h1 className="serif" style={{ fontSize: 'clamp(48px, 7vw, 96px)', fontWeight: 400, lineHeight: 1, letterSpacing: '-.02em' }}>Pirabel.</h1>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-tight" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
          <h2 className="serif" style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 400, lineHeight: 1.3, marginBottom: 24 }} dangerouslySetInnerHTML={{ __html: t.story_title }}/>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--ink-soft)' }}>{t.story_body}</p>
        </div>
      </section>

      <section>
        <div className="split">
          <div className="split-img"><img src={img('photo-1519415510236-718bdfcd89c8', 1400)} alt=""/></div>
          <div className="split-text" style={{ background: 'var(--ivory-2)' }}>
            <div className="section-eyebrow">01</div>
            <h3 className="serif" style={{ fontSize: 32, fontWeight: 400, marginBottom: 16 }}>{lang === 'fr' ? 'Une sélection exigeante' : 'A careful selection'}</h3>
            <p className="mute" style={{ fontSize: 15, lineHeight: 1.7 }}>{lang === 'fr' ? 'Chaque pièce est choisie pour la qualité de ses matériaux et la rigueur de sa finition.' : 'Each piece is chosen for the quality of its materials and the rigor of its finish.'}</p>
          </div>
        </div>
        <div className="split">
          <div className="split-text" style={{ background: 'var(--ink)', color: 'var(--ivory)' }}>
            <div className="section-eyebrow" style={{ color: 'rgba(247,243,236,.5)' }}>02</div>
            <h3 className="serif" style={{ fontSize: 32, fontWeight: 400, marginBottom: 16 }}>{lang === 'fr' ? 'Enracinée au Bénin' : 'Rooted in Benin'}</h3>
            <p style={{ color: 'rgba(247,243,236,.7)', fontSize: 15, lineHeight: 1.7 }}>{lang === 'fr' ? 'Basée à Cotonou, Pirabel livre dans tout le pays avec un service personnalisé.' : 'Based in Cotonou, Pirabel delivers across the country with personal service.'}</p>
          </div>
          <div className="split-img"><img src={img('photo-1523206489230-c012c64b2b48', 1400)} alt=""/></div>
        </div>
      </section>
    </main>
  );
}
