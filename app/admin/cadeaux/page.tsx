import { createAdminClient } from '@/lib/supabase/admin';
import { fmt } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function AdminGiftCardsPage() {
  const sb = createAdminClient();
  const { data: cards } = await sb.from('gift_cards').select('*').order('created_at', { ascending: false }).limit(100);

  const totalIssued = (cards ?? []).reduce((s, c) => s + c.amount, 0);
  const totalBalance = (cards ?? []).reduce((s, c) => s + c.balance, 0);

  return (
    <div>
      <div className="admin-page-head">
        <h1>Chèques cadeaux</h1>
        <p className="mute">{cards?.length ?? 0} carte{(cards?.length ?? 0) > 1 ? 's' : ''} émise{(cards?.length ?? 0) > 1 ? 's' : ''}</p>
      </div>

      <div className="admin-stats">
        <div className="admin-card">
          <div className="caps mute" style={{ fontSize: 10 }}>Total émis</div>
          <div className="serif" style={{ fontSize: 30, marginTop: 4 }}>{fmt(totalIssued)}</div>
        </div>
        <div className="admin-card">
          <div className="caps mute" style={{ fontSize: 10 }}>Solde restant</div>
          <div className="serif" style={{ fontSize: 30, marginTop: 4 }}>{fmt(totalBalance)}</div>
        </div>
        <div className="admin-card">
          <div className="caps mute" style={{ fontSize: 10 }}>Consommé</div>
          <div className="serif" style={{ fontSize: 30, marginTop: 4 }}>{fmt(totalIssued - totalBalance)}</div>
        </div>
      </div>

      <div className="admin-card mt-8" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead><tr><th>Code</th><th>Montant</th><th>Solde</th><th>Destinataire</th><th>Acheteur</th><th>Émis</th><th>Expire</th></tr></thead>
          <tbody>
            {(cards ?? []).map(c => (
              <tr key={c.code}>
                <td className="mono" style={{ fontSize: 12 }}>{c.code}</td>
                <td>{fmt(c.amount)}</td>
                <td style={{ fontWeight: 500, color: c.balance === 0 ? 'var(--ink-mute)' : 'var(--ink)' }}>{fmt(c.balance)}</td>
                <td className="mute" style={{ fontSize: 13 }}>{c.recipient_name || c.recipient_email}</td>
                <td className="mute" style={{ fontSize: 12 }}>{c.buyer_email}</td>
                <td className="mute" style={{ fontSize: 12 }}>{new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
                <td className="mute" style={{ fontSize: 12 }}>{c.expires_at ? new Date(c.expires_at).toLocaleDateString('fr-FR') : '—'}</td>
              </tr>
            ))}
            {(!cards || cards.length === 0) && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}><p className="mute">Aucune carte émise.</p></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
