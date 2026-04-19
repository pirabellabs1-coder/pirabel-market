import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
for (const l of raw.split('\n')) { const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/); if (m) process.env[m[1]] = m[2]; }
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false }});

for (const tbl of ['products']) {
  const withHead = await sb.from(tbl).select('*', { count: 'exact', head: true });
  console.log(`${tbl} HEAD: status=${withHead.status} count=${withHead.count} error=${withHead.error?.message ?? 'none'}`);
  const noHead = await sb.from(tbl).select('*').limit(1);
  console.log(`${tbl} GET:  status=${noHead.status} count=${noHead.count} data=${JSON.stringify(noHead.data)?.slice(0,60)} error=${noHead.error?.message ?? 'none'}`);
}

const r = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/products?limit=1`, {
  headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` }
});
console.log(`Raw fetch: ${r.status} ${r.statusText}`);
console.log((await r.text()).slice(0, 200));
