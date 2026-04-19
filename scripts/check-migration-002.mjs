import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
for (const l of raw.split('\n')) { const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/); if (m) process.env[m[1]] = m[2]; }
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false }});
console.log('\nMigration 002 tables:');
for (const [tbl, pk] of [['journal_posts','id'],['otp_codes','email'],['promo_codes','code'],['popups','id'],['reviews','id']]) {
  const { count, error } = await sb.from(tbl).select(pk, { count: 'exact' }).limit(0);
  console.log(`  ${error ? '✗' : '✓'} ${tbl.padEnd(16)} ${error ? error.message : (count ?? 0) + ' row(s)'}`);
}
const { data: promo } = await sb.from('promo_codes').select('*').eq('code','BIENVENUE20').maybeSingle();
console.log(`  ${promo ? '✓' : '✗'} BIENVENUE20 promo seeded:`, promo ? `${promo.value}% active=${promo.active}` : 'missing');
