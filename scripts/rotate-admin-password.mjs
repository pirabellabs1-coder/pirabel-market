// Rotate the admin password to a new strong value.
// Usage: node scripts/rotate-admin-password.mjs <email> <new-password>
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
for (const l of raw.split('\n')) { const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/); if (m) process.env[m[1]] = m[2]; }
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false }});
const [, , email, password] = process.argv;
if (!email || !password) { console.error('Usage: node scripts/rotate-admin-password.mjs <email> <password>'); process.exit(2); }
const { data: list } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
const user = list.users.find(u => u.email === email);
if (!user) { console.error('User not found'); process.exit(1); }
const { error } = await sb.auth.admin.updateUserById(user.id, { password });
if (error) { console.error(error); process.exit(1); }
console.log(`✓ Password rotated for ${email}`);
