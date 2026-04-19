'use client';

import { SimplePage } from '@/components/simple-page';
import { useStore } from '@/components/store-provider';
import { img } from '@/lib/format';

export default function JournalPage() {
  const { lang } = useStore();
  const posts = [
    { t: lang === 'fr' ? 'La patine du cuir, un art du temps' : 'The patina of leather, the art of time', c: lang === 'fr' ? 'Savoir-faire' : 'Craft', img: img('photo-1547731030-cd126f943bd6', 1200) },
    { t: lang === 'fr' ? 'Les ateliers qui nous inspirent' : 'Ateliers that inspire us', c: lang === 'fr' ? 'Rencontres' : 'Meetings', img: img('photo-1441986300917-64674bd600d8', 1200) },
    { t: lang === 'fr' ? 'Un voyage à Abomey' : 'A journey to Abomey', c: lang === 'fr' ? 'Culture' : 'Culture', img: img('photo-1523206489230-c012c64b2b48', 1200) },
  ];

  return (
    <SimplePage title={lang === 'fr' ? 'Le Journal' : 'Journal'} eyebrow={lang === 'fr' ? 'Lectures' : 'Readings'}>
      <div className="grid-3">
        {posts.map((p, i) => (
          <article key={i} style={{ cursor: 'pointer' }}>
            <div style={{ aspectRatio: '4/5', overflow: 'hidden', marginBottom: 16 }}>
              <img src={p.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/>
            </div>
            <div className="caps mute mb-2">{p.c}</div>
            <h3 className="serif" style={{ fontSize: 22, fontWeight: 400, lineHeight: 1.3 }}>{p.t}</h3>
          </article>
        ))}
      </div>
    </SimplePage>
  );
}
