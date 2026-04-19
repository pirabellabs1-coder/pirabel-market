import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
for (const l of raw.split('\n')) { const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/); if (m) process.env[m[1]] = m[2]; }

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const email = `test-${Date.now()}@example.com`;
const { data, error } = await sb.auth.admin.createUser({ email, password: 'Testpass123!', email_confirm: true });
if (error) {
  console.error('❌ Signup failed:', error.message);
  process.exit(1);
}
console.log(`✓ Test user created: ${data.user.id}`);

// Check profile was auto-created
const { data: profile } = await sb.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
console.log(`${profile ? '✓' : '⚠'}  Profile auto-created: ${profile ? 'yes (trigger works!)' : 'no (trigger broken)'}`);

// Clean up
await sb.auth.admin.deleteUser(data.user.id);
console.log('✓ Test user cleaned up');
