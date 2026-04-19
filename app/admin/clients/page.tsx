import { createAdminClient } from '@/lib/supabase/admin';
import { ClientsManager } from './_manager';

export const dynamic = 'force-dynamic';

export default async function AdminClientsPage() {
  const sb = createAdminClient();
  const { data: profiles } = await sb
    .from('profiles')
    .select('id, first_name, last_name, phone, is_admin, created_at')
    .order('created_at', { ascending: false })
    .limit(500);

  const { data: authUsers } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const emailById = new Map(authUsers?.users?.map(u => [u.id, u.email ?? '—']) ?? []);

  const rows = (profiles ?? []).map(p => ({
    id: p.id,
    email: emailById.get(p.id) ?? '—',
    first_name: p.first_name,
    last_name: p.last_name,
    phone: p.phone,
    is_admin: p.is_admin,
    created_at: p.created_at,
  }));

  return (
    <div>
      <div className="admin-page-head">
        <h1>Clients & collaborateurs</h1>
        <p className="mute">{rows.length} compte{rows.length > 1 ? 's' : ''} · {rows.filter(r => r.is_admin).length} admin</p>
      </div>
      <ClientsManager clients={rows}/>
    </div>
  );
}
