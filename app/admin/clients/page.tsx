import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export default async function AdminClientsPage() {
  const sb = createAdminClient();
  const { data: profiles } = await sb
    .from('profiles')
    .select('id, first_name, last_name, phone, is_admin, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  // auth.users lookup for emails (service role can read auth schema)
  const { data: authUsers } = await sb.auth.admin.listUsers();
  const emailById = new Map(authUsers?.users?.map(u => [u.id, u.email]) ?? []);

  return (
    <div>
      <div className="admin-page-head">
        <h1>Clients</h1>
        <p className="mute">{profiles?.length ?? 0} compte{(profiles?.length ?? 0) > 1 ? 's' : ''}</p>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead><tr><th>Nom</th><th>Email</th><th>Téléphone</th><th>Inscrit le</th><th>Rôle</th></tr></thead>
          <tbody>
            {profiles?.map(p => (
              <tr key={p.id}>
                <td>{[p.first_name, p.last_name].filter(Boolean).join(' ') || '—'}</td>
                <td className="mute" style={{ fontSize: 13 }}>{emailById.get(p.id) ?? '—'}</td>
                <td className="mute">{p.phone ?? '—'}</td>
                <td className="mute" style={{ fontSize: 12 }}>{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
                <td><span className="admin-badge">{p.is_admin ? 'Admin' : 'Client'}</span></td>
              </tr>
            ))}
            {(!profiles || profiles.length === 0) && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 60 }}><p className="mute">Aucun compte pour l&apos;instant.</p></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
