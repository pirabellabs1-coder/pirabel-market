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

console.log('Probing...\n');
for (const tbl of ['categories', 'products', 'profiles', 'orders']) {
  const { data, error, status, count } = await sb.from(tbl).select('*', { count: 'exact' }).limit(1);
  console.log(`${tbl}: status=${status} count=${count} error=${error ? error.message : 'none'}`);
}

// Try raw SQL via information_schema
console.log('\nTables in public schema (via SQL RPC):');
const { data: tbls, error: sqlErr } = await sb.rpc('exec_sql', { sql: "select tablename from pg_tables where schemaname='public'" }).catch(e => ({ error: e }));
if (sqlErr) console.log('  (no exec_sql rpc)');
else console.log(tbls);
