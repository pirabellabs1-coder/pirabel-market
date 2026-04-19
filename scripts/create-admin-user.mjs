// One-shot: create an auth user AND promote them to admin.
// Usage: node scripts/create-admin-user.mjs <email> [password]
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
for (const line of raw.split('\n')) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/);
  if (m) process.env[m[1]] = m[2];
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/create-admin-user.mjs <email> [password]');
  process.exit(2);
}

// Generate a strong password if not provided. URL-safe, no ambiguous chars.
const password = process.argv[3] || (() => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = randomBytes(20);
  return Array.from(bytes, b => alphabet[b % alphabet.length]).join('');
})();

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// Idempotent: if user exists, reuse id
const { data: list } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
let user = list?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

if (user) {
  console.log(`• User ${email} already exists (${user.id}) — updating password and admin flag.`);
  const { error: upErr } = await sb.auth.admin.updateUserById(user.id, { password, email_confirm: true });
  if (upErr) { console.error('updateUserById:', upErr); process.exit(1); }
} else {
  const { data, error } = await sb.auth.admin.createUser({
    email, password, email_confirm: true,
  });
  if (error) { console.error('createUser:', error); process.exit(1); }
  user = data.user;
  console.log(`✓ User created: ${email} (${user.id})`);
}

// Ensure profile row with is_admin=true
const { error: upProfErr } = await sb
  .from('profiles')
  .upsert({ id: user.id, is_admin: true }, { onConflict: 'id' });
if (upProfErr) { console.error('profiles upsert:', upProfErr); process.exit(1); }

console.log('\n=== ADMIN READY ===');
console.log(`Email    : ${email}`);
console.log(`Password : ${password}`);
console.log(`Login URL: https://pirabel-market.vercel.app/connexion`);
console.log(`Admin URL: https://pirabel-market.vercel.app/admin`);
console.log('\n⚠️  Save this password somewhere safe (password manager).');
console.log('    You can change it later via /compte → Paramètres, or via /mot-de-passe-oublie.');
