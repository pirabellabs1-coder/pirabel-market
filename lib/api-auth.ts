import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { createAdminClient } from './supabase/admin';

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * Gate for /api/v1/*. Accepts EITHER:
 *   - A DB-backed api_keys entry (created via /admin/api), revocable
 *   - The legacy env var ADMIN_API_KEY (kept for bootstrap / fallback)
 *
 * Updates last_used_at on the DB key on every successful call.
 */
export async function requireApiKey(request: Request): Promise<NextResponse | null> {
  const header = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing Authorization: Bearer <key>' }, { status: 401 });
  }
  const provided = header.slice(7).trim();
  if (!provided) {
    return NextResponse.json({ error: 'Empty key' }, { status: 401 });
  }

  // 1. Legacy env fallback
  const envKey = process.env.ADMIN_API_KEY;
  if (envKey && provided === envKey) return null;

  // 2. DB lookup by hash (bypasses RLS via service_role)
  try {
    const sb = createAdminClient();
    const hash = hashKey(provided);
    const { data, error } = await sb
      .from('api_keys')
      .select('id, revoked_at')
      .eq('key_hash', hash)
      .maybeSingle();
    if (error) {
      return NextResponse.json({ error: 'Auth lookup failed' }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }
    if (data.revoked_at) {
      return NextResponse.json({ error: 'API key revoked' }, { status: 401 });
    }
    // Fire-and-forget last-used update
    sb.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', data.id).then(() => undefined, () => undefined);
    return null;
  } catch {
    return NextResponse.json({ error: 'Auth service unavailable' }, { status: 503 });
  }
}

/** Hash a key before storing. Exposed for the admin create flow. */
export function hashApiKey(key: string): string {
  return hashKey(key);
}
