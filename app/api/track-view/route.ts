import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const product_id = String(body.product_id || '').trim();
  const session_id = String(body.session_id || '').slice(0, 64);
  if (!product_id) return NextResponse.json({ ok: false });

  const sb = createAdminClient();
  // Fire-and-forget; errors don't matter to the client
  sb.from('product_views').insert({ product_id, session_id: session_id || null }).then(() => undefined, () => undefined);
  return NextResponse.json({ ok: true });
}
