import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { renderMarkdown } from '@/lib/markdown';
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/seo';

export const revalidate = 60;

// Body may be legacy markdown OR rich editor HTML. Detect by first char.
function renderBody(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('<')) return trimmed;
  return renderMarkdown(raw);
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const sb = createAdminClient();
  const { data: post } = await sb
    .from('journal_posts')
    .select('title_fr, excerpt_fr, cover_img')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();
  if (!post) return { title: 'Article' };
  return {
    title: post.title_fr,
    description: post.excerpt_fr ?? undefined,
    alternates: { canonical: `/journal/${slug}` },
    openGraph: {
      type: 'article',
      title: post.title_fr,
      description: post.excerpt_fr ?? undefined,
      images: post.cover_img ? [{ url: post.cover_img }] : undefined,
    },
    twitter: post.cover_img ? { card: 'summary_large_image', images: [post.cover_img] } : undefined,
  };
}

export default async function JournalPostPage({ params }: PageProps) {
  const { slug } = await params;
  const sb = createAdminClient();
  const { data: post } = await sb
    .from('journal_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (!post) notFound();

  const bodyHtml = renderBody(post.body_fr || '');
  const articleLd = articleJsonLd(post);
  const crumbs = breadcrumbJsonLd([
    { name: 'Accueil', url: '/' },
    { name: 'Le Journal', url: '/journal' },
    { name: post.title_fr, url: `/journal/${post.slug}` },
  ]);

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }}/>

      {post.cover_img && (
        <div style={{ width: '100%', height: 'min(60vh, 520px)', overflow: 'hidden', background: 'var(--ivory-2)' }}>
          <img src={post.cover_img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
        </div>
      )}

      <article className="container-tight" style={{ padding: '64px 40px 80px', maxWidth: 780 }}>
        <div className="row gap-3 mb-6" style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
          {post.category && <span>{post.category}</span>}
          <span>·</span>
          <span>{new Date(post.published_at ?? post.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
          {post.author && <>
            <span>·</span>
            <span>{post.author}</span>
          </>}
        </div>

        <h1 className="serif" style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 400, lineHeight: 1.15, margin: '0 0 24px', letterSpacing: '-.01em' }}>
          {post.title_fr}
        </h1>

        {post.excerpt_fr && <p className="mute" style={{ fontSize: 17, lineHeight: 1.65, marginBottom: 32, fontStyle: 'italic' }}>{post.excerpt_fr}</p>}

        <div
          className="journal-body"
          style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--ink-soft)' }}
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />

        <div className="mt-12" style={{ paddingTop: 40, borderTop: '1px solid var(--line)', textAlign: 'center' }}>
          <Link href="/journal" className="btn btn-ghost">← Tous les articles</Link>
        </div>
      </article>
    </main>
  );
}
