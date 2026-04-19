import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { DeletePostButton } from './_delete-button';

export const dynamic = 'force-dynamic';

export default async function AdminJournalPage() {
  const sb = createAdminClient();
  const { data: posts, error } = await sb
    .from('journal_posts')
    .select('id, slug, title_fr, category, cover_img, published, published_at, created_at')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="admin-page-head row between wrap gap-4">
        <div>
          <h1>Journal</h1>
          <p className="mute">{posts?.length ?? 0} article{(posts?.length ?? 0) > 1 ? 's' : ''}</p>
        </div>
        <Link className="btn btn-primary" href="/admin/journal/nouveau">+ Nouvel article</Link>
      </div>

      {error && <div className="admin-card" style={{ color: '#a63d2a' }}>{error.message}</div>}

      <div className="admin-card" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead>
            <tr><th></th><th>Titre</th><th>Catégorie</th><th>Slug</th><th>État</th><th></th></tr>
          </thead>
          <tbody>
            {posts?.map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{ width: 64, height: 48, overflow: 'hidden', background: 'var(--ivory-2)' }}>
                    {p.cover_img && <img src={p.cover_img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 500 }}>{p.title_fr}</div>
                  <div className="mute" style={{ fontSize: 11 }}>{new Date(p.created_at).toLocaleDateString('fr-FR')}</div>
                </td>
                <td className="mute">{p.category ?? '—'}</td>
                <td className="mono mute" style={{ fontSize: 12 }}>{p.slug}</td>
                <td>
                  <span className="admin-badge" style={{ background: p.published ? 'var(--ivory-2)' : '#fce8e8', color: p.published ? 'var(--ink)' : '#8b1f1f' }}>
                    {p.published ? 'Publié' : 'Brouillon'}
                  </span>
                </td>
                <td className="row gap-2">
                  <Link className="btn btn-outline btn-sm" href={`/admin/journal/${p.id}`}>Modifier</Link>
                  <DeletePostButton id={p.id}/>
                </td>
              </tr>
            ))}
            {(!posts || posts.length === 0) && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 60 }}>
                <p className="mute">Aucun article pour l&apos;instant.</p>
                <Link className="btn btn-primary mt-4" href="/admin/journal/nouveau">+ Écrire le premier article</Link>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
