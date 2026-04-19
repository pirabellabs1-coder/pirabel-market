-- Pirabel migration 002 — Big bang: journal, OTP, promos, popups, reviews
-- À coller dans Supabase SQL Editor APRÈS schema.sql → Run

-- ==========================================
-- 1. Welcome email tracking
-- ==========================================
alter table profiles add column if not exists welcomed_at timestamptz;

-- ==========================================
-- 2. OTP codes (signup verification)
-- ==========================================
create table if not exists otp_codes (
  email text not null,
  code text not null,
  purpose text not null default 'signup',
  expires_at timestamptz not null,
  attempts int default 0,
  user_id uuid,
  created_at timestamptz default now(),
  primary key (email, purpose)
);
create index if not exists otp_codes_expires_idx on otp_codes(expires_at);
alter table otp_codes enable row level security;
-- service_role only; no RLS policies.

-- ==========================================
-- 3. Journal articles
-- ==========================================
create table if not exists journal_posts (
  id text primary key default gen_random_uuid()::text,
  slug text unique not null,
  title_fr text not null,
  title_en text,
  excerpt_fr text,
  excerpt_en text,
  body_fr text not null,
  body_en text,
  cover_img text,
  category text,
  author text default 'Pirabel',
  published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists journal_posts_slug_idx on journal_posts(slug);
create index if not exists journal_posts_pub_idx on journal_posts(published, published_at desc);
alter table journal_posts enable row level security;
create policy "public read published journal" on journal_posts for select using (published = true);
create policy "admin all journal" on journal_posts for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);

-- ==========================================
-- 4. Promo codes
-- ==========================================
create type promo_type as enum ('percent', 'fixed', 'free_shipping');

create table if not exists promo_codes (
  code text primary key,
  type promo_type not null default 'percent',
  value int not null default 0,           -- percent (5, 10, 20) OR FCFA fixed amount
  min_order int default 0,                -- minimum FCFA to apply
  max_uses int,                           -- null = unlimited
  uses_count int default 0,
  valid_from timestamptz default now(),
  valid_until timestamptz,
  description text,
  active boolean default true,
  created_at timestamptz default now()
);
alter table promo_codes enable row level security;
create policy "public read active promos" on promo_codes for select using (active = true);
create policy "admin all promos" on promo_codes for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);

-- Track promo usage on orders
alter table orders add column if not exists promo_code text references promo_codes(code) on delete set null;
alter table orders add column if not exists discount int default 0;

-- ==========================================
-- 5. Popups
-- ==========================================
create table if not exists popups (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  body text,
  cta_label text,
  cta_url text,
  image text,
  position text default 'center',         -- 'center' | 'bottom' | 'top'
  trigger_type text default 'delay',      -- 'delay' | 'scroll' | 'exit'
  trigger_value int default 5,            -- seconds OR scroll %
  show_once boolean default true,
  active boolean default true,
  starts_at timestamptz default now(),
  ends_at timestamptz,
  created_at timestamptz default now()
);
alter table popups enable row level security;
create policy "public read active popups" on popups for select using (
  active = true and (ends_at is null or ends_at > now())
);
create policy "admin all popups" on popups for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);

-- ==========================================
-- 6. Reviews
-- ==========================================
create table if not exists reviews (
  id text primary key default gen_random_uuid()::text,
  product_id text references products(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete set null,
  order_id text references orders(id) on delete set null,
  author_name text not null,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  approved boolean default false,
  created_at timestamptz default now()
);
create index if not exists reviews_product_idx on reviews(product_id, approved);
alter table reviews enable row level security;
create policy "public read approved reviews" on reviews for select using (approved = true);
create policy "auth insert own review" on reviews for insert with check (auth.uid() = user_id);
create policy "users read own reviews" on reviews for select using (auth.uid() = user_id);
create policy "admin all reviews" on reviews for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);

-- ==========================================
-- 7. Newsletter: already exists. Just ensure lang default.
-- ==========================================
-- (newsletter table already created in schema.sql)

-- ==========================================
-- Seed a welcome promo code (20% first order)
-- ==========================================
insert into promo_codes (code, type, value, min_order, description, active)
values ('BIENVENUE20', 'percent', 20, 0, 'Bienvenue chez Pirabel — 20% sur la première commande', true)
on conflict (code) do nothing;
