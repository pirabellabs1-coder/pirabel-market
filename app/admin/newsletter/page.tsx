import { createAdminClient } from '@/lib/supabase/admin';
import { NewsletterComposer } from './_composer';

export const dynamic = 'force-dynamic';

export default async function AdminNewsletterPage() {
  const sb = createAdminClient();
  const { data: subs } = await sb.from('newsletter').select('email, lang, subscribed_at').order('subscribed_at', { ascending: false });
  return (
    <div>
      <div className="admin-page-head">
        <h1>Newsletter</h1>
        <p className="mute">{subs?.length ?? 0} abonné{(subs?.length ?? 0) > 1 ? 's' : ''}</p>
      </div>
      <NewsletterComposer subscriberCount={subs?.length ?? 0}/>
      <div className="admin-card mt-8" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead><tr><th>Email</th><th>Langue</th><th>Inscrit le</th></tr></thead>
          <tbody>
            {subs?.slice(0, 100).map(s => (
              <tr key={s.email}>
                <td>{s.email}</td>
                <td className="mute">{s.lang?.toUpperCase()}</td>
                <td className="mute" style={{ fontSize: 12 }}>{new Date(s.subscribed_at).toLocaleDateString('fr-FR')}</td>
              </tr>
            ))}
            {(!subs || subs.length === 0) && (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: 40 }}><p className="mute">Aucun abonné pour l&apos;instant.</p></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
