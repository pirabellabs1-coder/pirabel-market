import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { DeleteLookbookButton } from './_delete-button';

export const dynamic = 'force-dynamic';

export default async function AdminLookbooksPage() {
  const sb = createAdminClient();
  const { data: lookbooks } = await sb
    .from('lookbooks')
    .select('id, slug, title_fr, cover_img, product_ids, published, created_at')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="admin-page-head row between wrap gap-4">
        <div>
          <h1>Lookbooks</h1>
          <p className="mute">Pages éditoriales — une ambiance, une histoire, des produits tagués.</p>
        </div>
        <Link className="btn btn-primary" href="/admin/lookbooks/nouveau">+ Nouveau lookbook</Link>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead><tr><th></th><th>Titre</th><th>Slug</th><th>Produits</th><th>État</th><th></th></tr></thead>
          <tbody>
            {(lookbooks ?? []).map(l => (
              <tr key={l.id}>
                <td>{l.cover_img && <div style={{ width: 64, height: 48, overflow: 'hidden', background: 'var(--ivory-2)' }}><img src={l.cover_img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/></div>}</td>
                <td style={{ fontWeight: 500 }}>{l.title_fr}</td>
                <td className="mono mute" style={{ fontSize: 12 }}>{l.slug}</td>
                <td className="mute">{(l.product_ids ?? []).length}</td>
                <td><span className="admin-badge" style={{ background: l.published ? 'var(--ivory-2)' : '#fce8e8', color: l.published ? 'var(--ink)' : '#8b1f1f' }}>{l.published ? 'Publié' : 'Brouillon'}</span></td>
                <td className="row gap-2">
                  <Link className="btn btn-outline btn-sm" href={`/admin/lookbooks/${l.id}`}>Modifier</Link>
                  <DeleteLookbookButton id={l.id}/>
                </td>
              </tr>
            ))}
            {(!lookbooks || lookbooks.length === 0) && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 60 }}>
                <p className="mute">Aucun lookbook. Crée ton premier pour raconter une ambiance.</p>
                <Link className="btn btn-primary mt-4" href="/admin/lookbooks/nouveau">+ Nouveau lookbook</Link>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
