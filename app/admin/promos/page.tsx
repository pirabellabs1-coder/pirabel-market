import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { fmt } from '@/lib/format';
import { DeletePromoButton } from './_delete-button';

export const dynamic = 'force-dynamic';

const TYPE_LABEL: Record<string, string> = {
  percent: '% remise', fixed: 'Remise fixe', free_shipping: 'Livraison offerte',
};

export default async function AdminPromosPage() {
  const sb = createAdminClient();
  const { data: promos } = await sb.from('promo_codes').select('*').order('created_at', { ascending: false });

  return (
    <div>
      <div className="admin-page-head row between wrap gap-4">
        <div><h1>Codes promo</h1><p className="mute">{promos?.length ?? 0} code{(promos?.length ?? 0) > 1 ? 's' : ''}</p></div>
        <Link className="btn btn-primary" href="/admin/promos/nouveau">+ Nouveau code</Link>
      </div>
      <div className="admin-card" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead><tr><th>Code</th><th>Type</th><th>Valeur</th><th>Min. panier</th><th>Utilisations</th><th>État</th><th></th></tr></thead>
          <tbody>
            {promos?.map(p => (
              <tr key={p.code}>
                <td className="mono" style={{ fontWeight: 500 }}>{p.code}</td>
                <td className="mute">{TYPE_LABEL[p.type]}</td>
                <td>{p.type === 'percent' ? `${p.value}%` : p.type === 'fixed' ? fmt(p.value) : '—'}</td>
                <td className="mute">{p.min_order ? fmt(p.min_order) : '—'}</td>
                <td className="mute">{p.uses_count}{p.max_uses ? ` / ${p.max_uses}` : ''}</td>
                <td><span className="admin-badge" style={{ background: p.active ? 'var(--ivory-2)' : '#fce8e8', color: p.active ? 'var(--ink)' : '#8b1f1f' }}>{p.active ? 'Actif' : 'Désactivé'}</span></td>
                <td className="row gap-2">
                  <Link className="btn btn-outline btn-sm" href={`/admin/promos/${encodeURIComponent(p.code)}`}>Modifier</Link>
                  <DeletePromoButton code={p.code}/>
                </td>
              </tr>
            ))}
            {(!promos || promos.length === 0) && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 60 }}><p className="mute">Aucun code promo.</p></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
