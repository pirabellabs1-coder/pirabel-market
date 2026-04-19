// Create Supabase Storage bucket for product images.
// Usage: node scripts/setup-storage.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
for (const l of raw.split('\n')) { const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/); if (m) process.env[m[1]] = m[2]; }

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const BUCKET = 'product-images';

const { data: existing } = await sb.storage.listBuckets();
const found = existing?.find(b => b.id === BUCKET);

if (found) {
  console.log(`✓ Bucket '${BUCKET}' already exists (public=${found.public})`);
  if (!found.public) {
    await sb.storage.updateBucket(BUCKET, { public: true });
    console.log(`  → set to public`);
  }
} else {
  const { error } = await sb.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5 MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  });
  if (error) { console.error(error); process.exit(1); }
  console.log(`✓ Bucket '${BUCKET}' created (public)`);
}
