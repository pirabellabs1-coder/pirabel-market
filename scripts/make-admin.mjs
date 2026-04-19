// Promote a user to admin by email.
// Usage: node scripts/make-admin.mjs <email>
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
for (const line of raw.split('\n')) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/);
  if (m) process.env[m[1]] = m[2];
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/make-admin.mjs <email>');
  process.exit(2);
}

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// Find the auth user by email
const { data, error } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (error) { console.error(error); process.exit(1); }

const user = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
if (!user) {
  console.error(`✗ No user with email ${email}. Sign up first at /connexion.`);
  process.exit(1);
}

// Upsert profile with is_admin=true
const { error: upErr } = await sb
  .from('profiles')
  .upsert({ id: user.id, is_admin: true }, { onConflict: 'id' });

if (upErr) { console.error(upErr); process.exit(1); }

console.log(`✓ ${email} is now admin.`);
console.log(`  → Login at /connexion, then visit /admin`);
