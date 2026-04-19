-- Pirabel migration 004 — Sales growth bundle
-- referrals, loyalty, abandoned carts, stock alerts, gift cards, lookbooks, product views

-- ==========================================
-- 1. Loyalty + VIP on profiles
-- ==========================================
alter table profiles add column if not exists loyalty_points int default 0;
alter table profiles add column if not exists total_spent int default 0;
alter table profiles add column if not exists vip_tier text default 'bronze';  -- bronze | silver | gold | platinum

-- Welcome drip tracking
alter table profiles add column if not exists welcome_day3_at timestamptz;
alter table profiles add column if not exists welcome_day7_at timestamptz;

-- ==========================================
-- 2. Referrals
-- ==========================================
create table if not exists referrals (
  user_id uuid primary key references profiles(id) on delete cascade,
  code text unique not null,
  referred_by uuid references profiles(id) on delete set null,
  referrals_count int default 0,
  total_earned int default 0,
  created_at timestamptz default now()
);
create index if not exists referrals_code_idx on referrals(code);

alter table referrals enable row level security;
create policy "users read own referral" on referrals for select using (auth.uid() = user_id);
create policy "admin all referrals" on referrals for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);

-- ==========================================
-- 3. Abandoned carts
-- ==========================================
create table if not exists abandoned_carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  email text not null,
  cart_items jsonb not null,
  subtotal int not null,
  reminded_at timestamptz,
  recovered_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists abandoned_carts_email_idx on abandoned_carts(email, created_at desc);
create index if not exists abandoned_carts_reminder_idx on abandoned_carts(reminded_at, recovered_at) where reminded_at is null and recovered_at is null;
alter table abandoned_carts enable row level security;
-- service_role only

-- ==========================================
-- 4. Back-in-stock alerts
-- ==========================================
create table if not exists stock_alerts (
  id uuid primary key default gen_random_uuid(),
  product_id text references products(id) on delete cascade not null,
  email text not null,
  notified_at timestamptz,
  created_at timestamptz default now()
);
create unique index if not exists stock_alerts_unique on stock_alerts(product_id, email) where notified_at is null;
alter table stock_alerts enable row level security;
-- public insert (any visitor can subscribe), service_role reads
create policy "public subscribe stock" on stock_alerts for insert with check (true);
create policy "admin read stock alerts" on stock_alerts for select using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);

-- ==========================================
-- 5. Gift cards
-- ==========================================
create table if not exists gift_cards (
  code text primary key,
  amount int not null,        -- FCFA initial value
  balance int not null,       -- remaining balance
  buyer_email text,
  recipient_email text,
  recipient_name text,
  message text,
  expires_at timestamptz,
  created_at timestamptz default now(),
  last_used_at timestamptz
);
create index if not exists gift_cards_recipient_idx on gift_cards(recipient_email);
alter table gift_cards enable row level security;
create policy "admin all gift cards" on gift_cards for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);

-- ==========================================
-- 6. Product views (for recommendations + social proof)
-- ==========================================
create table if not exists product_views (
  id bigserial primary key,
  product_id text references products(id) on delete cascade not null,
  session_id text,
  user_id uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);
create index if not exists product_views_recent_idx on product_views(created_at desc);
create index if not exists product_views_session_idx on product_views(session_id, created_at desc);
alter table product_views enable row level security;
-- Public insert (anonymous session view tracking); admins can read
create policy "public insert view" on product_views for insert with check (true);
create policy "admin read views" on product_views for select using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);

-- ==========================================
-- 7. Lookbooks
-- ==========================================
create table if not exists lookbooks (
  id text primary key default gen_random_uuid()::text,
  slug text unique not null,
  title_fr text not null,
  title_en text,
  description_fr text,
  description_en text,
  cover_img text,
  product_ids text[] default '{}',
  published boolean default false,
  created_at timestamptz default now()
);
create index if not exists lookbooks_slug_idx on lookbooks(slug);
alter table lookbooks enable row level security;
create policy "public read published lookbooks" on lookbooks for select using (published = true);
create policy "admin all lookbooks" on lookbooks for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);

-- ==========================================
-- 8. Helper: compute VIP tier from total_spent (in FCFA)
-- ==========================================
create or replace function compute_vip_tier(spent int) returns text
language sql immutable as $$
  select case
    when spent >= 2000000 then 'platinum'
    when spent >=  800000 then 'gold'
    when spent >=  300000 then 'silver'
    else 'bronze'
  end;
$$;

-- Trigger: when an order is marked delivered, award loyalty points and update total_spent + tier
create or replace function on_order_delivered() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'delivered' and (old.status is null or old.status <> 'delivered') and new.user_id is not null then
    update public.profiles set
      total_spent = coalesce(total_spent, 0) + new.total,
      loyalty_points = coalesce(loyalty_points, 0) + (new.total / 100)::int,
      vip_tier = public.compute_vip_tier(coalesce(total_spent, 0) + new.total)
    where id = new.user_id;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_delivered_loyalty on orders;
create trigger orders_delivered_loyalty
  after update on orders
  for each row
  when (new.status = 'delivered')
  execute procedure on_order_delivered();
