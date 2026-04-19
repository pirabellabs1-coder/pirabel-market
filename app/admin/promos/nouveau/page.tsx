import { PromoForm } from '../_form';

export const dynamic = 'force-dynamic';

export default function NewPromoPage() {
  return (
    <div>
      <div className="admin-page-head"><h1>Nouveau code promo</h1></div>
      <PromoForm/>
    </div>
  );
}
