import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

type Body = { code?: string; subtotal?: number };

export async function POST(request: Request) {
  let body: Body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const code = body.code?.trim().toUpperCase();
  const subtotal = Number(body.subtotal || 0);
  if (!code) return NextResponse.json({ error: 'Code requis' }, { status: 400 });

  const sb = createAdminClient();
  const { data: promo } = await sb.from('promo_codes').select('*').eq('code', code).eq('active', true).maybeSingle();

  if (!promo) return NextResponse.json({ error: 'Code inconnu ou expiré' }, { status: 404 });
  if (promo.valid_until && new Date(promo.valid_until).getTime() < Date.now()) {
    return NextResponse.json({ error: 'Code expiré' }, { status: 410 });
  }
  if (promo.max_uses != null && promo.uses_count >= promo.max_uses) {
    return NextResponse.json({ error: 'Code épuisé' }, { status: 409 });
  }
  if (subtotal < (promo.min_order || 0)) {
    return NextResponse.json({ error: `Panier minimum ${promo.min_order} FCFA requis` }, { status: 400 });
  }

  let discount = 0;
  let free_shipping = false;
  if (promo.type === 'percent') discount = Math.floor(subtotal * (promo.value / 100));
  if (promo.type === 'fixed') discount = Math.min(promo.value, subtotal);
  if (promo.type === 'free_shipping') free_shipping = true;

  return NextResponse.json({
    code: promo.code,
    type: promo.type,
    value: promo.value,
    discount,
    free_shipping,
    description: promo.description,
  });
}
