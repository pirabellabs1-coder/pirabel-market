import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { PromoForm } from '../_form';

export const dynamic = 'force-dynamic';

export default async function EditPromoPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const sb = createAdminClient();
  const { data: promo } = await sb.from('promo_codes').select('*').eq('code', decodeURIComponent(code)).maybeSingle();
  if (!promo) notFound();
  return (
    <div>
      <div className="admin-page-head"><h1 className="mono">{promo.code}</h1></div>
      <PromoForm promo={promo}/>
    </div>
  );
}
