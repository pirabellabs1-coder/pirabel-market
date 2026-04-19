import { createAdminClient } from '@/lib/supabase/admin';
import { PopupsManager } from './_manager';

export const dynamic = 'force-dynamic';

export default async function AdminPopupsPage() {
  const sb = createAdminClient();
  const { data: popups } = await sb.from('popups').select('*').order('created_at', { ascending: false });
  return (
    <div>
      <div className="admin-page-head">
        <h1>Popups</h1>
        <p className="mute">Bannières promo, annonces, codes — affichés aux visiteurs selon tes règles.</p>
      </div>
      <PopupsManager popups={popups ?? []}/>
    </div>
  );
}
