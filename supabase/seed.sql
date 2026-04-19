-- Pirabel — Seed data (Phase 2)
-- À exécuter APRÈS schema.sql

-- Catégories
insert into categories (id, fr, en, img, sort_order) values
  ('women',       'Femme',       'Women',       'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=85', 1),
  ('men',         'Homme',       'Men',         'https://images.unsplash.com/photo-1507680434567-5739c80be1ac?auto=format&fit=crop&w=900&q=85', 2),
  ('shoes',       'Souliers',    'Shoes',       'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=85', 3),
  ('eyewear',     'Lunetterie',  'Eyewear',     'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=85', 4),
  ('kids',        'Enfant',      'Children',    'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?auto=format&fit=crop&w=900&q=85', 5),
  ('accessories', 'Accessoires', 'Accessories', 'https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&w=900&q=85', 6)
on conflict (id) do nothing;

-- Produits (24) — le seed complet sera ajouté en phase 2
-- Pour l'instant, lib/products.ts contient la source de vérité.
