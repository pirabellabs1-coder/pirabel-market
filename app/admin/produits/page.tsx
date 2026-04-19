import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { fmt } from '@/lib/format';
import { DeleteProductButton } from './_delete-button';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const sb = createAdminClient();
  const { data: products, error } = await sb
    .from('products')
    .select('id, name_fr, category, price, old_price, img, stock, published, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div>
        <div className="admin-page-head">
          <h1>Produits</h1>
        </div>
        <div className="admin-card" style={{ color: '#a63d2a' }}>{error.message}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-head row between wrap gap-4">
        <div>
          <h1>Produits</h1>
          <p className="mute">{products?.length ?? 0} article{(products?.length ?? 0) > 1 ? 's' : ''}</p>
        </div>
        <Link className="btn btn-primary" href="/admin/produits/nouveau">+ Nouveau produit</Link>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th></th>
              <th>Nom</th>
              <th>Catégorie</th>
              <th>Prix</th>
              <th>Stock</th>
              <th>État</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products?.map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{ width: 48, height: 48, overflow: 'hidden', background: 'var(--ivory-2)' }}>
                    {p.img && <img src={p.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 500 }}>{p.name_fr}</div>
                  <div className="mute mono" style={{ fontSize: 11 }}>{p.id}</div>
                </td>
                <td className="mute">{p.category ?? '—'}</td>
                <td>
                  <div>{fmt(p.price)}</div>
                  {p.old_price && <div className="mute" style={{ fontSize: 12, textDecoration: 'line-through' }}>{fmt(p.old_price)}</div>}
                </td>
                <td className="mute">{p.stock === -1 ? '∞' : p.stock}</td>
                <td>
                  <span className="admin-badge" style={{ background: p.published ? 'var(--ivory-2)' : '#fce8e8', color: p.published ? 'var(--ink)' : '#8b1f1f' }}>
                    {p.published ? 'Publié' : 'Brouillon'}
                  </span>
                </td>
                <td className="row gap-2">
                  <Link className="btn btn-outline btn-sm" href={`/admin/produits/${p.id}`}>Modifier</Link>
                  <DeleteProductButton id={p.id}/>
                </td>
              </tr>
            ))}
            {(!products || products.length === 0) && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 60 }}>
                  <p className="mute">Aucun produit pour l&apos;instant.</p>
                  <Link className="btn btn-primary mt-4" href="/admin/produits/nouveau">+ Créer le premier produit</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
