import { createAdminClient } from '@/lib/supabase/admin';
import { fmt } from '@/lib/format';

export const dynamic = 'force-dynamic';

const TIER_LABEL: Record<string, string> = { bronze: 'Bronze', silver: 'Argent', gold: 'Or', platinum: 'Platine' };
const TIER_COLOR: Record<string, string> = { bronze: '#a07a4a', silver: '#8c8c8c', gold: '#c9a24a', platinum: '#5e5e5e' };

export default async function AdminLoyaltyPage() {
  const sb = createAdminClient();
  const { data: top } = await sb
    .from('profiles')
    .select('id, first_name, last_name, loyalty_points, total_spent, vip_tier')
    .gt('total_spent', 0)
    .order('total_spent', { ascending: false })
    .limit(50);

  const { data: referrals } = await sb
    .from('referrals')
    .select('user_id, code, referrals_count, total_earned')
    .order('referrals_count', { ascending: false })
    .limit(20);

  const { data: users } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const emailById = new Map(users?.users?.map(u => [u.id, u.email ?? '—']) ?? []);

  const tierCounts = (top ?? []).reduce<Record<string, number>>((acc, p) => {
    const t = p.vip_tier || 'bronze';
    acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="admin-page-head">
        <h1>Fidélité & VIP</h1>
        <p className="mute">Clients classés par dépenses cumulées. Points : 1 point gagné par 100 FCFA dépensés (crédité à la livraison).</p>
      </div>

      <div className="admin-stats">
        {(['platinum', 'gold', 'silver', 'bronze'] as const).map(t => (
          <div key={t} className="admin-card">
            <div className="caps mute" style={{ fontSize: 10, color: TIER_COLOR[t] }}>{TIER_LABEL[t]}</div>
            <div className="serif" style={{ fontSize: 28, marginTop: 4 }}>{tierCounts[t] ?? 0}</div>
            <div className="mute" style={{ fontSize: 11 }}>
              {t === 'platinum' ? '≥ 2 000 000 F' : t === 'gold' ? '≥ 800 000 F' : t === 'silver' ? '≥ 300 000 F' : '< 300 000 F'}
            </div>
          </div>
        ))}
      </div>

      <div className="admin-card mt-8" style={{ padding: 0 }}>
        <div className="row between" style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
          <h2 className="serif" style={{ fontSize: 20, fontWeight: 400, margin: 0 }}>Top clients</h2>
        </div>
        <table className="admin-table">
          <thead><tr><th>Client</th><th>Email</th><th>Tier</th><th>Total dépensé</th><th>Points</th></tr></thead>
          <tbody>
            {(top ?? []).map(p => (
              <tr key={p.id}>
                <td>{[p.first_name, p.last_name].filter(Boolean).join(' ') || '—'}</td>
                <td className="mute" style={{ fontSize: 13 }}>{emailById.get(p.id) ?? '—'}</td>
                <td>
                  <span className="admin-badge" style={{ background: TIER_COLOR[p.vip_tier || 'bronze'] + '22', color: TIER_COLOR[p.vip_tier || 'bronze'] }}>
                    {TIER_LABEL[p.vip_tier || 'bronze']}
                  </span>
                </td>
                <td style={{ fontWeight: 500 }}>{fmt(p.total_spent ?? 0)}</td>
                <td className="mono">{p.loyalty_points ?? 0}</td>
              </tr>
            ))}
            {(!top || top.length === 0) && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}><p className="mute">Pas encore de commandes livrées.</p></td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-card mt-6" style={{ padding: 0 }}>
        <div className="row between" style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
          <h2 className="serif" style={{ fontSize: 20, fontWeight: 400, margin: 0 }}>Top parrains</h2>
        </div>
        <table className="admin-table">
          <thead><tr><th>Email</th><th>Code</th><th>Parrainages</th><th>Crédit gagné</th></tr></thead>
          <tbody>
            {(referrals ?? []).map(r => (
              <tr key={r.user_id}>
                <td className="mute" style={{ fontSize: 13 }}>{emailById.get(r.user_id) ?? '—'}</td>
                <td className="mono">{r.code}</td>
                <td>{r.referrals_count}</td>
                <td>{fmt(r.total_earned ?? 0)}</td>
              </tr>
            ))}
            {(!referrals || referrals.length === 0) && (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40 }}><p className="mute">Aucun parrainage encore.</p></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
