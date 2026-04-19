-- Pirabel — Supabase schema (Phase 2)
-- À exécuter dans l'éditeur SQL de Supabase

-- ==========================================
-- Extensions
-- ==========================================
create extension if not exists "pgcrypto";

-- ==========================================
-- Catégories
-- ==========================================
create table if not exists categories (
  id text primary key,
  fr text not null,
  en text not null,
  img text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ==========================================
-- Produits
-- ==========================================
create table if not exists products (
  id text primary key,
  category text references categories(id) on delete set null,
  collection text,
  name_fr text not null,
  name_en text not null,
  desc_fr text,
  desc_en text,
  price int not null,           -- en FCFA
  old_price int,                -- prix barré (promo)
  img text not null,
  img2 text,
  tag text,                     -- 'Nouveau', 'Édition limitée', etc.
  sizes text[],                 -- ['S','M','L'] ou ['39','40'...]
  colors jsonb,                 -- [{ n: 'Noir', c: '#000' }, ...]
  stock int default 0,          -- -1 = illimité
  published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists products_category_idx on products(category);
create index if not exists products_published_idx on products(published);

-- ==========================================
-- Clients (profils liés à auth.users)
-- ==========================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- ==========================================
-- Adresses
-- ==========================================
create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  label text,
  city text not null,
  zone text,
  address text,
  phone text,
  is_primary boolean default false,
  created_at timestamptz default now()
);

-- ==========================================
-- Commandes
-- ==========================================
create type order_status as enum (
  'pending',       -- commande passée, paiement en attente
  'paid',          -- paiement reçu
  'preparing',     -- en préparation
  'shipped',       -- expédiée / livreur en route
  'delivered',     -- livrée
  'cancelled',     -- annulée
  'refunded'       -- remboursée
);

create type payment_method as enum (
  'mtn', 'moov', 'celtiis', 'card', 'cod'
);

create table if not exists orders (
  id text primary key,                           -- format PB-XXXXXX
  user_id uuid references profiles(id) on delete set null,
  status order_status default 'pending',
  subtotal int not null,
  delivery int not null,
  total int not null,
  payment_method payment_method not null,
  payment_ref text,                              -- référence Kkiapay
  shipping_name text not null,
  shipping_phone text not null,
  shipping_email text,
  shipping_city text not null,
  shipping_zone text,
  shipping_address text,
  notes text,
  created_at timestamptz default now(),
  paid_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz
);

create index if not exists orders_user_idx on orders(user_id);
create index if not exists orders_status_idx on orders(status);
create index if not exists orders_created_idx on orders(created_at desc);

-- ==========================================
-- Articles de commande (snapshot au moment de la commande)
-- ==========================================
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text references orders(id) on delete cascade not null,
  product_id text references products(id) on delete set null,
  name text not null,                            -- snapshot
  img text,
  price int not null,                            -- snapshot prix unitaire
  qty int not null,
  size text,
  color text
);

create index if not exists order_items_order_idx on order_items(order_id);

-- ==========================================
-- Favoris
-- ==========================================
create table if not exists wishlists (
  user_id uuid references profiles(id) on delete cascade not null,
  product_id text references products(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (user_id, product_id)
);

-- ==========================================
-- Newsletter
-- ==========================================
create table if not exists newsletter (
  email text primary key,
  lang text default 'fr',
  subscribed_at timestamptz default now()
);

-- ==========================================
-- Row Level Security
-- ==========================================
alter table categories enable row level security;
alter table products enable row level security;
alter table profiles enable row level security;
alter table addresses enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table wishlists enable row level security;
alter table newsletter enable row level security;

-- Lecture publique : catégories et produits publiés
create policy "public read categories" on categories for select using (true);
create policy "public read published products" on products for select using (published = true);

-- Profils : utilisateur lit/met à jour le sien
create policy "users read own profile" on profiles for select using (auth.uid() = id);
create policy "users update own profile" on profiles for update using (auth.uid() = id);
create policy "users insert own profile" on profiles for insert with check (auth.uid() = id);

-- Adresses : seul le propriétaire
create policy "users own addresses" on addresses for all using (auth.uid() = user_id);

-- Commandes : seul le client lit les siennes
create policy "users read own orders" on orders for select using (auth.uid() = user_id);
create policy "users read own order items" on order_items for select using (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);

-- Favoris : seul le propriétaire
create policy "users own wishlist" on wishlists for all using (auth.uid() = user_id);

-- Newsletter : inscription publique, lecture admin uniquement
create policy "public insert newsletter" on newsletter for insert with check (true);

-- Admin : accès total (via service_role côté serveur, ou via flag is_admin)
create policy "admin all categories" on categories for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);
create policy "admin all products" on products for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);
create policy "admin read all orders" on orders for select using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);
create policy "admin update all orders" on orders for update using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);
create policy "admin read all order items" on order_items for select using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);

-- ==========================================
-- Trigger : créer un profil à l'inscription
-- ==========================================
create or replace function handle_new_user() returns trigger as $$
begin
  insert into profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
