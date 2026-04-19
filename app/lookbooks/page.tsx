import Link from 'next/link';
import { SimplePage } from '@/components/simple-page';
import { createAdminClient } from '@/lib/supabase/admin';

export const revalidate = 120;

export const metadata = {
  title: 'Lookbooks',
  description: 'Histoires et ambiances Pirabel — scènes stylées, produits tagués.',
  alternates: { canonical: '/lookbooks' },
};

export default async function LookbooksListPage() {
  const sb = createAdminClient();
  const { data: lookbooks } = await sb
    .from('lookbooks')
    .select('id, slug, title_fr, cover_img, product_ids')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (!lookbooks || lookbooks.length === 0) {
    return (
      <SimplePage title="Lookbooks" eyebrow="Histoires">
        <p className="mute" style={{ fontSize: 16, textAlign: 'center', padding: 40 }}>
          Nos lookbooks arrivent bientôt. Reviens pour voir la façon dont on porte Pirabel.
        </p>
      </SimplePage>
    );
  }

  return (
    <SimplePage title="Lookbooks" eyebrow="Histoires">
      <div className="grid-3">
        {lookbooks.map(l => (
          <Link key={l.id} href={`/lookbooks/${l.slug}`} style={{ display: 'block' }}>
            <article style={{ cursor: 'pointer' }}>
              <div style={{ aspectRatio: '3/4', overflow: 'hidden', marginBottom: 16, background: 'var(--ivory-2)' }}>
                {l.cover_img && <img src={l.cover_img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/>}
              </div>
              <div className="caps mute mb-2">{(l.product_ids ?? []).length} pièces</div>
              <h3 className="serif" style={{ fontSize: 24, fontWeight: 400, lineHeight: 1.2 }}>{l.title_fr}</h3>
            </article>
          </Link>
        ))}
      </div>
    </SimplePage>
  );
}
