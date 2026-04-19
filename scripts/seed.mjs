// Seed Supabase with categories + 24 products from lib/
// Usage: node scripts/seed.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

function loadEnv() {
  const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/);
    if (m) process.env[m[1]] = m[2];
  }
}
loadEnv();

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const U = 'https://images.unsplash.com/';
const img = (id, w = 900) => `${U}${id}?auto=format&fit=crop&w=${w}&q=85`;

// ============ CATEGORIES ============
const categories = [
  { id: 'women',       fr: 'Femme',       en: 'Women',       img: img('photo-1490481651871-ab68de25d43d'), sort_order: 1 },
  { id: 'men',         fr: 'Homme',       en: 'Men',         img: img('photo-1507680434567-5739c80be1ac'), sort_order: 2 },
  { id: 'shoes',       fr: 'Souliers',    en: 'Shoes',       img: img('photo-1549298916-b41d501d3772'),   sort_order: 3 },
  { id: 'eyewear',     fr: 'Lunetterie',  en: 'Eyewear',     img: img('photo-1572635196237-14b3f281503f'), sort_order: 4 },
  { id: 'kids',        fr: 'Enfant',      en: 'Children',    img: img('photo-1558877385-81a1c7e67d72'),   sort_order: 5 },
  { id: 'accessories', fr: 'Accessoires', en: 'Accessories', img: img('photo-1511556820780-d912e42b4980'), sort_order: 6 },
];

// ============ PRODUCTS ============
const products = [
  // Shoes
  { id: 'v01', category: 'shoes', collection: 'Souliers',
    name_fr: 'Baskets en cuir « Atelier »',
    desc_fr: 'Baskets à la tige en cuir de veau, doublure textile, semelle intérieure amovible. Fabriquées dans un atelier au Portugal, avec un attention particulière portée à chaque couture.',
    name_en: 'Leather sneakers « Atelier »',
    desc_en: 'Calfskin upper sneakers, textile lining, removable insole. Made in a Portuguese atelier with care given to every stitch.',
    price: 185000, img: img('photo-1542291026-7eec264c27ff', 1000), img2: img('photo-1603808033192-082d6919d3e1', 800),
    tag: 'Nouveau', sizes: ['39','40','41','42','43','44'],
    colors: [{ n: 'Blanc', c: '#f4f1ea' }, { n: 'Noir', c: '#1a1712' }, { n: 'Camel', c: '#b58a5e' }] },
  { id: 'v02', category: 'shoes', collection: 'Souliers',
    name_fr: 'Mocassins cuir patiné', name_en: 'Patinated leather loafers',
    price: 215000, img: img('photo-1533867617858-e7b97e060509', 1000), img2: img('photo-1614252234419-8e2b3d8c6f2d', 800),
    sizes: ['40','41','42','43','44'], colors: [{ n: 'Cognac', c: '#8b5a2b' }, { n: 'Noir', c: '#1a1712' }] },
  { id: 'v03', category: 'shoes', collection: 'Souliers',
    name_fr: 'Sandales artisanales', name_en: 'Handcrafted sandals',
    price: 65000, old_price: 78000,
    img: img('photo-1603487742131-4160ec999306', 1000), img2: img('photo-1562273138-f46be4ebdf33', 800) },
  { id: 'v04', category: 'shoes', collection: 'Souliers',
    name_fr: 'Bottines cuir lisse', name_en: 'Smooth leather ankle boots',
    price: 245000, img: img('photo-1608256246200-53e635b5b65f', 1000), img2: img('photo-1520639888713-7851133b1ed0', 800) },

  // Women
  { id: 'v05', category: 'women', collection: 'Femme',
    name_fr: 'Chemise en soie', name_en: 'Silk shirt',
    price: 155000, img: img('photo-1551028719-00167b16eac5', 1000), img2: img('photo-1485968579580-b6d095142e6e', 800),
    tag: 'Nouveau', sizes: ['XS','S','M','L'],
    colors: [{ n: 'Ivoire', c: '#f4f1ea' }, { n: 'Bordeaux', c: '#6d2a30' }] },
  { id: 'v06', category: 'women', collection: 'Femme',
    name_fr: 'Robe longue plissée', name_en: 'Long pleated dress',
    price: 225000, img: img('photo-1539008835657-9e8e9680c956', 1000), img2: img('photo-1529139574466-a303027c1d8b', 800),
    sizes: ['S','M','L'] },
  { id: 'v07', category: 'women', collection: 'Femme',
    name_fr: 'Blazer en laine', name_en: 'Wool blazer',
    price: 345000, img: img('photo-1591047139829-d91aecb6caea', 1000), img2: img('photo-1548624313-0396c75e2ac9', 800) },
  { id: 'v08', category: 'women', collection: 'Femme',
    name_fr: 'Sac en cuir souple', name_en: 'Soft leather bag',
    price: 295000, old_price: 345000,
    img: img('photo-1548036328-c9fa89d128fa', 1000), img2: img('photo-1591561954555-607968c989ab', 800),
    tag: 'Édition limitée' },

  // Men
  { id: 'v09', category: 'men', collection: 'Homme',
    name_fr: 'Chemise en coton', name_en: 'Cotton shirt',
    price: 95000, img: img('photo-1602810318383-e386cc2a3ccf', 1000), img2: img('photo-1596755094514-f87e34085b2c', 800),
    sizes: ['S','M','L','XL'] },
  { id: 'v10', category: 'men', collection: 'Homme',
    name_fr: 'Pull en cachemire', name_en: 'Cashmere sweater',
    price: 265000, img: img('photo-1620799140408-edc6dcb6d633', 1000), img2: img('photo-1578932750294-f5075e85f44a', 800) },
  { id: 'v11', category: 'men', collection: 'Homme',
    name_fr: 'Pantalon en lin', name_en: 'Linen trousers',
    price: 115000, img: img('photo-1624378439575-d8705ad7ae80', 1000), img2: img('photo-1473966968600-fa801b869a1a', 800) },
  { id: 'v12', category: 'men', collection: 'Homme',
    name_fr: 'Veste en cuir', name_en: 'Leather jacket',
    price: 485000, img: img('photo-1521223890158-f9f7c3d5d504', 1000), img2: img('photo-1559551409-dadc959f76b8', 800),
    tag: 'Nouveau' },

  // Eyewear
  { id: 'v13', category: 'eyewear', collection: 'Lunetterie',
    name_fr: 'Solaires « Promenade »', desc_fr: 'Monture en acétate italien, verres minéraux teintés. Étui en cuir pleine fleur inclus.',
    name_en: 'Sunglasses « Promenade »',
    price: 125000, img: img('photo-1508296695146-257a814070b4', 1000), img2: img('photo-1511499767150-a48a237f0083', 800),
    colors: [{ n: 'Écaille', c: '#6b4423' }, { n: 'Noir', c: '#1a1712' }, { n: 'Cristal', c: '#e8e2d4' }] },
  { id: 'v14', category: 'eyewear', collection: 'Lunetterie',
    name_fr: 'Solaires rondes acétate', name_en: 'Round acetate sunglasses',
    price: 98000, img: img('photo-1473496169904-658ba7c44d8a', 1000), img2: img('photo-1577803645773-f96470509666', 800) },
  { id: 'v15', category: 'eyewear', collection: 'Lunetterie',
    name_fr: 'Lunettes optiques fines', name_en: 'Slim optical frames',
    price: 145000, img: img('photo-1574258495973-f010dfbb5371', 1000), img2: img('photo-1556306535-0f09a537f0a3', 800) },
  { id: 'v16', category: 'eyewear', collection: 'Lunetterie',
    name_fr: 'Aviateur métal doré', name_en: 'Gold metal aviator',
    price: 115000, old_price: 138000,
    img: img('photo-1483412033650-1015ddeb83d1', 1000), img2: img('photo-1602699270098-11aa56e5c9cd', 800) },

  // Kids
  { id: 'v17', category: 'kids', collection: 'Enfant',
    name_fr: 'Cheval à bascule en bois', name_en: 'Wooden rocking horse',
    price: 75000, img: img('photo-1558877385-81a1c7e67d72', 1000), img2: img('photo-1558877385-81a1c7e67d72', 800),
    tag: 'Artisanat' },
  { id: 'v18', category: 'kids', collection: 'Enfant',
    name_fr: 'Jeu de construction en bois', name_en: 'Wooden building blocks',
    price: 28000, img: img('photo-1587654780291-39c9404d746b', 1000), img2: img('photo-1596461404969-9ae70f2830c1', 800) },
  { id: 'v19', category: 'kids', collection: 'Enfant',
    name_fr: 'Ours en peluche « Félix »', name_en: 'Teddy bear « Félix »',
    price: 42000, img: img('photo-1584187838132-ea84c75b3b1f', 1000), img2: img('photo-1558877385-81a1c7e67d72', 800) },
  { id: 'v20', category: 'kids', collection: 'Enfant',
    name_fr: 'Puzzle illustré en bois', name_en: 'Illustrated wooden puzzle',
    price: 22500, img: img('photo-1596461404969-9ae70f2830c1', 1000), img2: img('photo-1587654780291-39c9404d746b', 800) },

  // Accessories
  { id: 'v21', category: 'accessories', collection: 'Accessoires',
    name_fr: 'Foulard en soie imprimé', name_en: 'Printed silk scarf',
    price: 85000, img: img('photo-1601924994987-69e26d50dc26', 1000), img2: img('photo-1584917865442-de89df76afd3', 800) },
  { id: 'v22', category: 'accessories', collection: 'Accessoires',
    name_fr: 'Portefeuille cuir grainé', name_en: 'Grained leather wallet',
    price: 95000, img: img('photo-1627123424574-724758594e93', 1000), img2: img('photo-1553062407-98eeb64c6a62', 800) },
  { id: 'v23', category: 'accessories', collection: 'Accessoires',
    name_fr: 'Ceinture cuir plein', name_en: 'Full leather belt',
    price: 65000, img: img('photo-1624222247344-550fb60583dc', 1000), img2: img('photo-1624140716840-06a9d9a9b0b3', 800) },
  { id: 'v24', category: 'accessories', collection: 'Accessoires',
    name_fr: 'Chapeau feutre laine', name_en: 'Wool felt hat',
    price: 78000, img: img('photo-1521369909029-2afed882baee', 1000), img2: img('photo-1514327605112-b887c0e61c0a', 800) },
];

// ============ RUN ============
console.log(`Seeding ${process.env.NEXT_PUBLIC_SUPABASE_URL}\n`);

const { error: catErr, count: catCount } = await sb
  .from('categories')
  .upsert(categories, { onConflict: 'id' })
  .select('*', { count: 'exact', head: true });
if (catErr) { console.error('categories:', catErr); process.exit(1); }
console.log(`  ✓ ${catCount ?? categories.length} categories upserted`);

const { error: prodErr, count: prodCount } = await sb
  .from('products')
  .upsert(products, { onConflict: 'id' })
  .select('*', { count: 'exact', head: true });
if (prodErr) { console.error('products:', prodErr); process.exit(1); }
console.log(`  ✓ ${prodCount ?? products.length} products upserted`);

console.log('\nDone.');
