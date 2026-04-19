import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { getProducts } from '@/lib/db';
import { fmt } from '@/lib/format';
import type { Product } from '@/lib/types';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = createAdminClient();
  const { data: lb } = await sb.from('lookbooks').select('title_fr, description_fr, cover_img').eq('slug', slug).eq('published', true).maybeSingle();
  if (!lb) return { title: 'Lookbook' };
  const desc = (lb.description_fr || '').replace(/<[^>]+>/g, '').slice(0, 160);
  return {
    title: lb.title_fr,
    description: desc || undefined,
    alternates: { canonical: `/lookbooks/${slug}` },
    openGraph: { type: 'article', title: lb.title_fr, images: lb.cover_img ? [{ url: lb.cover_img }] : undefined },
  };
}

export default async function LookbookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = createAdminClient();
  const { data: lb } = await sb.from('lookbooks').select('*').eq('slug', slug).eq('published', true).maybeSingle();
  if (!lb) notFound();

  const allProducts = await getProducts();
  const tagged: Product[] = (lb.product_ids ?? [])
    .map((id: string) => allProducts.find((p: Product) => p.id === id))
    .filter((p: Product | undefined): p is Product => !!p);

  return (
    <main>
      {lb.cover_img && (
        <div style={{ width: '100%', height: '75vh', minHeight: 520, overflow: 'hidden', position: 'relative' }}>
          <img src={lb.cover_img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,.55))', display: 'flex', alignItems: 'flex-end', padding: '0 40px 56px' }}>
            <div className="container" style={{ color: 'var(--ivory)' }}>
              <div className="section-eyebrow" style={{ color: 'rgba(247,243,236,.7)' }}>Lookbook</div>
              <h1 className="serif" style={{ fontSize: 'clamp(42px, 6vw, 80px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-.02em' }}>{lb.title_fr}</h1>
            </div>
          </div>
        </div>
      )}

      {lb.description_fr && (
        <article className="container-tight" style={{ padding: '64px 40px 40px', maxWidth: 780 }}>
          <div className="journal-body" style={{ fontSize: 17, lineHeight: 1.8, color: 'var(--ink-soft)' }} dangerouslySetInnerHTML={{ __html: lb.description_fr.trim().startsWith('<') ? lb.description_fr : `<p>${lb.description_fr}</p>` }}/>
        </article>
      )}

      {tagged.length > 0 && (
        <section className="section-sm" style={{ background: 'var(--ivory-2)' }}>
          <div className="container">
            <div className="section-head">
              <div>
                <div className="section-eyebrow">Pièces tagées</div>
                <h2 className="section-title">Le look complet</h2>
              </div>
            </div>
            <div className="grid-4">
              {tagged.map(p => (
                <Link key={p.id} href={`/produit/${p.id}`} className="pcard" style={{ textDecoration: 'none' }}>
                  <div className="pcard-img"><img src={p.img} alt={p.fr.name}/></div>
                  <div className="pcard-cat">{p.collection}</div>
                  <div className="pcard-name">{p.fr.name}</div>
                  <div className="pcard-price"><span>{fmt(p.price)}</span></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="container" style={{ padding: '40px 40px 80px', textAlign: 'center' }}>
        <Link href="/lookbooks" className="btn btn-ghost">← Tous les lookbooks</Link>
      </div>
    </main>
  );
}
