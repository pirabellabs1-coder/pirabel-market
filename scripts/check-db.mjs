// Probe Supabase — are schema + products seeded?
// Usage: node scripts/check-db.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
for (const line of raw.split('\n')) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/);
  if (m) process.env[m[1]] = m[2];
}

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

console.log(`Supabase: ${process.env.NEXT_PUBLIC_SUPABASE_URL}\n`);
// Tables without an `id` column use a different PK — specify per table.
const tables = [
  ['categories',  'id'],
  ['products',    'id'],
  ['profiles',    'id'],
  ['orders',      'id'],
  ['addresses',   'id'],
  ['order_items', 'id'],
  ['wishlists',   'user_id'],
  ['newsletter',  'email'],
];
let allOk = true;
for (const [tbl, pk] of tables) {
  const { count, error } = await sb.from(tbl).select(pk, { count: 'exact' }).limit(0);
  if (error) {
    allOk = false;
    console.log(`  ✗ ${tbl.padEnd(14)} MISSING — ${error.message}`);
  } else {
    console.log(`  ✓ ${tbl.padEnd(14)} ${count ?? 0} row(s)`);
  }
}
if (!allOk) {
  console.log('\n  → Apply supabase/schema.sql in the Supabase SQL Editor:');
  console.log(`    https://supabase.com/dashboard/project/${process.env.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/([^.]+)\./)?.[1]}/sql/new`);
}
process.exit(allOk ? 0 : 1);
