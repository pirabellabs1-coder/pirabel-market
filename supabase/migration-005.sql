-- Pirabel migration 005 — Gift orders
-- Add gift-related columns to orders so a purchase can be designated as a gift:
--   shipping_* = recipient (where the package goes)
--   buyer_email = acheteur (who pays, receives the receipt)
--   gift_message = message to include with the package
--   gift_delivery_date = optional target delivery date (birthdays, holidays)

alter table orders add column if not exists is_gift boolean default false;
alter table orders add column if not exists gift_message text;
alter table orders add column if not exists gift_delivery_date date;
alter table orders add column if not exists buyer_email text;
alter table orders add column if not exists buyer_name text;

create index if not exists orders_gift_idx on orders(is_gift) where is_gift = true;
