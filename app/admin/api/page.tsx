import { ApiDocs } from './_docs';

export const dynamic = 'force-dynamic';

export default function AdminApiPage() {
  const keyPresent = !!process.env.ADMIN_API_KEY;
  const key = process.env.ADMIN_API_KEY ?? '';
  const maskedKey = key ? `${key.slice(0, 8)}…${key.slice(-4)}` : '';
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://pirabel-one.store';

  return <ApiDocs keyPresent={keyPresent} maskedKey={maskedKey} site={site}/>;
}
