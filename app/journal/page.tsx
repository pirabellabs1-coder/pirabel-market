import Link from 'next/link';
import { SimplePage } from '@/components/simple-page';
import { createAdminClient } from '@/lib/supabase/admin';
import { img } from '@/lib/format';

export const revalidate = 60;

export default async function JournalListPage() {
  const sb = createAdminClient();
  const { data: posts } = await sb
    .from('journal_posts')
    .select('id, slug, title_fr, title_en, excerpt_fr, excerpt_en, cover_img, category, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false });

  const fallbackPosts = [
    { slug: '#', title_fr: 'La patine du cuir, un art du temps', title_en: 'The patina of leather, the art of time', category: 'Savoir-faire', cover_img: img('photo-1547731030-cd126f943bd6', 1200), excerpt_fr: null, excerpt_en: null, published_at: null, id: 'p1' },
    { slug: '#', title_fr: 'Les ateliers qui nous inspirent', title_en: 'Ateliers that inspire us', category: 'Rencontres', cover_img: img('photo-1441986300917-64674bd600d8', 1200), excerpt_fr: null, excerpt_en: null, published_at: null, id: 'p2' },
    { slug: '#', title_fr: 'Un voyage à Abomey', title_en: 'A journey to Abomey', category: 'Culture', cover_img: img('photo-1523206489230-c012c64b2b48', 1200), excerpt_fr: null, excerpt_en: null, published_at: null, id: 'p3' },
  ];

  const list = (posts && posts.length > 0) ? posts : fallbackPosts;

  return (
    <SimplePage title="Le Journal" eyebrow="Lectures">
      <div className="grid-3">
        {list.map(p => (
          <Link key={p.id} href={p.slug === '#' ? '#' : `/journal/${p.slug}`} style={{ display: 'block' }}>
            <article style={{ cursor: 'pointer' }}>
              <div style={{ aspectRatio: '4/5', overflow: 'hidden', marginBottom: 16, background: 'var(--ivory-2)' }}>
                {p.cover_img && <img src={p.cover_img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/>}
              </div>
              {p.category && <div className="caps mute mb-2">{p.category}</div>}
              <h3 className="serif" style={{ fontSize: 22, fontWeight: 400, lineHeight: 1.3 }}>{p.title_fr}</h3>
              {p.excerpt_fr && <p className="mute mt-2" style={{ fontSize: 13, lineHeight: 1.6 }}>{p.excerpt_fr}</p>}
            </article>
          </Link>
        ))}
      </div>
    </SimplePage>
  );
}
