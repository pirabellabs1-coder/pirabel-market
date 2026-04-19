import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
for (const l of raw.split('\n')) { const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/); if (m) process.env[m[1]] = m[2]; }
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false }});
const { error, count } = await sb.from('products').update({ stock: -1 }).eq('stock', 0).select('id', { count: 'exact' });
if (error) { console.error(error); process.exit(1); }
console.log(`✓ ${count ?? 0} products set to unlimited stock`);
