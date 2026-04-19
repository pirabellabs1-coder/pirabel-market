// Apply a SQL file via the Supabase Management API.
// Usage: node scripts/apply-migration.mjs <path-to-sql>
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
for (const line of raw.split('\n')) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/);
  if (m) process.env[m[1]] = m[2];
}

const PAT = process.env.SUPABASE_ACCESS_TOKEN;
const REF = process.env.SUPABASE_PROJECT_REF;
if (!PAT || !REF) {
  console.error('Missing SUPABASE_ACCESS_TOKEN or SUPABASE_PROJECT_REF in .env.local');
  process.exit(2);
}

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/apply-migration.mjs <path-to-sql>');
  process.exit(2);
}

const sql = readFileSync(resolve(file), 'utf8');
console.log(`Applying ${file} (${sql.length} chars) to project ${REF}…`);

const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${PAT}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
});

const body = await res.text();
if (!res.ok) {
  console.error(`✗ HTTP ${res.status}`);
  console.error(body);
  process.exit(1);
}
console.log(`✓ Applied successfully.`);
if (body && body !== '[]') console.log(body.slice(0, 400));
