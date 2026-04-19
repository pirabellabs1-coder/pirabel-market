-- Pirabel migration 003 — API keys management
-- Appliqué automatiquement via scripts/apply-migration.mjs

create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  prefix text not null,              -- public display: first 8 chars (e.g., "pbk_ABCD")
  key_hash text not null unique,     -- SHA-256 of the full key
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

create index if not exists api_keys_hash_idx on api_keys(key_hash) where revoked_at is null;
create index if not exists api_keys_created_idx on api_keys(created_at desc);

alter table api_keys enable row level security;

-- No public policies. Only service_role (admin API) touches this table.
create policy "admin read api keys" on api_keys for select using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);
