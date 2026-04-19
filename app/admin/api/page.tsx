import { createAdminClient } from '@/lib/supabase/admin';
import { ApiDocs } from './_docs';

export const dynamic = 'force-dynamic';

export default async function AdminApiPage() {
  const sb = createAdminClient();
  const { data: keys } = await sb
    .from('api_keys')
    .select('id, name, prefix, created_at, last_used_at, revoked_at')
    .order('created_at', { ascending: false });
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://pirabel-one.store';

  return <ApiDocs keys={keys ?? []} site={site}/>;
}
