'use server';

import { randomBytes, createHash } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

async function requireAdmin(): Promise<string> {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data: profile } = await sb.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
  if (!profile?.is_admin) throw new Error('Not admin');
  return user.id;
}

function generateKey(): string {
  // 32 URL-safe bytes → ~43 chars. Format: pbk_<random>
  return 'pbk_' + randomBytes(24).toString('base64url');
}

export async function createApiKey(name: string): Promise<{ key: string }> {
  const userId = await requireAdmin();
  if (!name.trim()) throw new Error('Nom requis');
  const sb = createAdminClient();

  const key = generateKey();
  const key_hash = createHash('sha256').update(key).digest('hex');
  const prefix = key.slice(0, 8);

  const { error } = await sb.from('api_keys').insert({
    name: name.trim().slice(0, 80),
    prefix,
    key_hash,
    created_by: userId,
  });
  if (error) throw new Error(error.message);

  revalidatePath('/admin/api', 'page');
  return { key };
}

export async function revokeApiKey(id: string) {
  await requireAdmin();
  const sb = createAdminClient();
  const { error } = await sb.from('api_keys').update({ revoked_at: new Date().toISOString() }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/api', 'page');
}
