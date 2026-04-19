// Pirabel Shop v2 — data with real imagery URLs
window.PirabelV2 = (function() {
  const U = 'https://images.unsplash.com/';
  const img = (id, w=900) => `${U}${id}?auto=format&fit=crop&w=${w}&q=85`;

  const i18n = {
    fr: {
      nav: { women: 'Femme', men: 'Homme', kids: 'Enfant', eyewear: 'Lunetterie', accessories: 'Accessoires', journal: 'Le Journal' },
      announce: 'Livraison offerte au Bénin dès 50 000 FCFA — Service client WhatsApp',
      hero_eyebrow: 'Collection Printemps · 2026',
      hero_title: 'L\'art du <em>quotidien</em>,<br/>réinventé.',
      hero_sub: 'Une sélection d\'objets, vêtements et accessoires pensés pour durer. Livrés avec soin, partout au Bénin.',
      discover: 'Découvrir',
      collections: 'Collections',
      new_arrivals: 'Nouveautés',
      new_sub: 'La sélection du mois, choisie pour son intemporalité.',
      featured: 'Pièces d\'exception',
      see_all: 'Tout voir',
      add_cart: 'Ajouter au panier',
      add_bag: 'Ajouter au sac',
      buy_now: 'Acheter maintenant',
      wishlist: 'Souhaits',
      account: 'Compte',
      bag: 'Sac',
      search: 'Recherche',
      quick_view: 'Aperçu rapide',
      story_title: 'Savoir-faire,<br/><em>patience</em>.',
      story_body: 'Depuis Cotonou, nous sélectionnons avec exigence auprès d\'artisans et de maisons qui partagent notre obsession du détail. Chaque pièce est choisie pour la qualité de ses matériaux, la rigueur de sa finition, et sa capacité à traverser le temps.',
      read_story: 'Notre histoire',
      svc_delivery: 'Livraison soignée',
      svc_delivery_sub: 'Emballage élégant. Cotonou en 24h, le Bénin en 48–72h.',
      svc_pay: 'Paiement simple',
      svc_pay_sub: 'Mobile Money (MTN, Moov, Celtiis) ou à la livraison.',
      svc_care: 'Service attentif',
      svc_care_sub: 'Une conseillère disponible par WhatsApp, 7 jours sur 7.',
      newsletter_title: 'Rester informé',
      newsletter_sub: 'Accès privilégié aux nouvelles collections et événements privés.',
      subscribe: 'S\'inscrire',
      email_ph: 'Votre adresse e-mail',
      footer_about: 'Maison béninoise fondée à Cotonou. Une sélection exigeante d\'objets choisis pour durer.',
    },
    en: {
      nav: { women: 'Women', men: 'Men', kids: 'Children', eyewear: 'Eyewear', accessories: 'Accessories', journal: 'Journal' },
      announce: 'Complimentary shipping across Benin over 50,000 FCFA — WhatsApp concierge',
      hero_eyebrow: 'Spring Collection · 2026',
      hero_title: 'The art of <em>everyday</em>,<br/>reimagined.',
      hero_sub: 'A curated selection of objects, clothing, and accessories made to last. Delivered with care, across Benin.',
      discover: 'Discover',
      collections: 'Collections',
      new_arrivals: 'New arrivals',
      new_sub: 'This month\'s selection, chosen for its timelessness.',
      featured: 'Featured pieces',
      see_all: 'See all',
      add_cart: 'Add to bag',
      add_bag: 'Add to bag',
      buy_now: 'Buy now',
      wishlist: 'Wishlist',
      account: 'Account',
      bag: 'Bag',
      search: 'Search',
      quick_view: 'Quick view',
      story_title: 'Craft,<br/><em>patience</em>.',
      story_body: 'From Cotonou, we select with care from artisans and houses who share our obsession with detail. Each piece is chosen for the quality of its materials, the rigor of its finish, and its ability to endure.',
      read_story: 'Our story',
      svc_delivery: 'Considered delivery',
      svc_delivery_sub: 'Elegant packaging. Cotonou in 24h, Benin in 48–72h.',
      svc_pay: 'Simple payment',
      svc_pay_sub: 'Mobile Money (MTN, Moov, Celtiis) or on delivery.',
      svc_care: 'Attentive service',
      svc_care_sub: 'A WhatsApp advisor available 7 days a week.',
      newsletter_title: 'Stay connected',
      newsletter_sub: 'Privileged access to new collections and private events.',
      subscribe: 'Subscribe',
      email_ph: 'Your email address',
      footer_about: 'A Beninese house founded in Cotonou. A careful selection of objects chosen to last.',
    }
  };

  const categories = [
    { id: 'women', fr: 'Femme', en: 'Women', img: img('photo-1490481651871-ab68de25d43d', 900), count: 128 },
    { id: 'men', fr: 'Homme', en: 'Men', img: img('photo-1507680434567-5739c80be1ac', 900), count: 96 },
    { id: 'shoes', fr: 'Souliers', en: 'Shoes', img: img('photo-1549298916-b41d501d3772', 900), count: 64 },
    { id: 'eyewear', fr: 'Lunetterie', en: 'Eyewear', img: img('photo-1572635196237-14b3f281503f', 900), count: 42 },
    { id: 'kids', fr: 'Enfant', en: 'Children', img: img('photo-1558877385-81a1c7e67d72', 900), count: 38 },
    { id: 'accessories', fr: 'Accessoires', en: 'Accessories', img: img('photo-1511556820780-d912e42b4980', 900), count: 74 },
  ];

  const products = [
    // Shoes
    { id: 'v01', category: 'shoes', collection: 'Souliers', fr: { name: 'Baskets en cuir « Atelier »', desc: 'Baskets à la tige en cuir de veau, doublure textile, semelle intérieure amovible. Fabriquées dans un atelier au Portugal, avec un attention particulière portée à chaque couture.' }, en: { name: 'Leather sneakers « Atelier »', desc: 'Calfskin upper sneakers, textile lining, removable insole. Made in a Portuguese atelier with care given to every stitch.' }, price: 185000, img: img('photo-1542291026-7eec264c27ff', 1000), img2: img('photo-1603808033192-082d6919d3e1', 800), tone: 'cream', tag: 'Nouveau', size: ['39','40','41','42','43','44'], color: [{n:'Blanc',c:'#f4f1ea'},{n:'Noir',c:'#1a1712'},{n:'Camel',c:'#b58a5e'}] },
    { id: 'v02', category: 'shoes', collection: 'Souliers', fr: { name: 'Mocassins cuir patiné' }, en: { name: 'Patinated leather loafers' }, price: 215000, img: img('photo-1533867617858-e7b97e060509', 1000), img2: img('photo-1614252234419-8e2b3d8c6f2d', 800), size: ['40','41','42','43','44'], color: [{n:'Cognac',c:'#8b5a2b'},{n:'Noir',c:'#1a1712'}] },
    { id: 'v03', category: 'shoes', collection: 'Souliers', fr: { name: 'Sandales artisanales' }, en: { name: 'Handcrafted sandals' }, price: 65000, old: 78000, img: img('photo-1603487742131-4160ec999306', 1000), img2: img('photo-1562273138-f46be4ebdf33', 800) },
    { id: 'v04', category: 'shoes', collection: 'Souliers', fr: { name: 'Bottines cuir lisse' }, en: { name: 'Smooth leather ankle boots' }, price: 245000, img: img('photo-1608256246200-53e635b5b65f', 1000), img2: img('photo-1520639888713-7851133b1ed0', 800) },

    // Women
    { id: 'v05', category: 'women', collection: 'Femme', fr: { name: 'Chemise en soie' }, en: { name: 'Silk shirt' }, price: 155000, img: img('photo-1551028719-00167b16eac5', 1000), img2: img('photo-1485968579580-b6d095142e6e', 800), tag: 'Nouveau', size: ['XS','S','M','L'], color: [{n:'Ivoire',c:'#f4f1ea'},{n:'Bordeaux',c:'#6d2a30'}] },
    { id: 'v06', category: 'women', collection: 'Femme', fr: { name: 'Robe longue plissée' }, en: { name: 'Long pleated dress' }, price: 225000, img: img('photo-1539008835657-9e8e9680c956', 1000), img2: img('photo-1529139574466-a303027c1d8b', 800), size: ['S','M','L'] },
    { id: 'v07', category: 'women', collection: 'Femme', fr: { name: 'Blazer en laine' }, en: { name: 'Wool blazer' }, price: 345000, img: img('photo-1591047139829-d91aecb6caea', 1000), img2: img('photo-1548624313-0396c75e2ac9', 800) },
    { id: 'v08', category: 'women', collection: 'Femme', fr: { name: 'Sac en cuir souple' }, en: { name: 'Soft leather bag' }, price: 295000, old: 345000, img: img('photo-1548036328-c9fa89d128fa', 1000), img2: img('photo-1591561954555-607968c989ab', 800), tag: 'Édition limitée' },

    // Men
    { id: 'v09', category: 'men', collection: 'Homme', fr: { name: 'Chemise en coton' }, en: { name: 'Cotton shirt' }, price: 95000, img: img('photo-1602810318383-e386cc2a3ccf', 1000), img2: img('photo-1596755094514-f87e34085b2c', 800), size: ['S','M','L','XL'] },
    { id: 'v10', category: 'men', collection: 'Homme', fr: { name: 'Pull en cachemire' }, en: { name: 'Cashmere sweater' }, price: 265000, img: img('photo-1620799140408-edc6dcb6d633', 1000), img2: img('photo-1578932750294-f5075e85f44a', 800) },
    { id: 'v11', category: 'men', collection: 'Homme', fr: { name: 'Pantalon en lin' }, en: { name: 'Linen trousers' }, price: 115000, img: img('photo-1624378439575-d8705ad7ae80', 1000), img2: img('photo-1473966968600-fa801b869a1a', 800) },
    { id: 'v12', category: 'men', collection: 'Homme', fr: { name: 'Veste en cuir' }, en: { name: 'Leather jacket' }, price: 485000, img: img('photo-1521223890158-f9f7c3d5d504', 1000), img2: img('photo-1559551409-dadc959f76b8', 800), tag: 'Nouveau' },

    // Eyewear
    { id: 'v13', category: 'eyewear', collection: 'Lunetterie', fr: { name: 'Solaires « Promenade »', desc: 'Monture en acétate italien, verres minéraux teintés. Étui en cuir pleine fleur inclus.' }, en: { name: 'Sunglasses « Promenade »' }, price: 125000, img: img('photo-1508296695146-257a814070b4', 1000), img2: img('photo-1511499767150-a48a237f0083', 800), color: [{n:'Écaille',c:'#6b4423'},{n:'Noir',c:'#1a1712'},{n:'Cristal',c:'#e8e2d4'}] },
    { id: 'v14', category: 'eyewear', collection: 'Lunetterie', fr: { name: 'Solaires rondes acétate' }, en: { name: 'Round acetate sunglasses' }, price: 98000, img: img('photo-1473496169904-658ba7c44d8a', 1000), img2: img('photo-1577803645773-f96470509666', 800) },
    { id: 'v15', category: 'eyewear', collection: 'Lunetterie', fr: { name: 'Lunettes optiques fines' }, en: { name: 'Slim optical frames' }, price: 145000, img: img('photo-1574258495973-f010dfbb5371', 1000), img2: img('photo-1556306535-0f09a537f0a3', 800) },
    { id: 'v16', category: 'eyewear', collection: 'Lunetterie', fr: { name: 'Aviateur métal doré' }, en: { name: 'Gold metal aviator' }, price: 115000, old: 138000, img: img('photo-1483412033650-1015ddeb83d1', 1000), img2: img('photo-1602699270098-11aa56e5c9cd', 800) },

    // Kids
    { id: 'v17', category: 'kids', collection: 'Enfant', fr: { name: 'Cheval à bascule en bois' }, en: { name: 'Wooden rocking horse' }, price: 75000, img: img('photo-1558877385-81a1c7e67d72', 1000), img2: img('photo-1558877385-81a1c7e67d72', 800), tag: 'Artisanat' },
    { id: 'v18', category: 'kids', collection: 'Enfant', fr: { name: 'Jeu de construction en bois' }, en: { name: 'Wooden building blocks' }, price: 28000, img: img('photo-1587654780291-39c9404d746b', 1000), img2: img('photo-1596461404969-9ae70f2830c1', 800) },
    { id: 'v19', category: 'kids', collection: 'Enfant', fr: { name: 'Ours en peluche « Félix »' }, en: { name: 'Teddy bear « Félix »' }, price: 42000, img: img('photo-1584187838132-ea84c75b3b1f', 1000), img2: img('photo-1558877385-81a1c7e67d72', 800) },
    { id: 'v20', category: 'kids', collection: 'Enfant', fr: { name: 'Puzzle illustré en bois' }, en: { name: 'Illustrated wooden puzzle' }, price: 22500, img: img('photo-1596461404969-9ae70f2830c1', 1000), img2: img('photo-1587654780291-39c9404d746b', 800) },

    // Accessories
    { id: 'v21', category: 'accessories', collection: 'Accessoires', fr: { name: 'Foulard en soie imprimé' }, en: { name: 'Printed silk scarf' }, price: 85000, img: img('photo-1601924994987-69e26d50dc26', 1000), img2: img('photo-1584917865442-de89df76afd3', 800) },
    { id: 'v22', category: 'accessories', collection: 'Accessoires', fr: { name: 'Portefeuille cuir grainé' }, en: { name: 'Grained leather wallet' }, price: 95000, img: img('photo-1627123424574-724758594e93', 1000), img2: img('photo-1553062407-98eeb64c6a62', 800) },
    { id: 'v23', category: 'accessories', collection: 'Accessoires', fr: { name: 'Ceinture cuir plein' }, en: { name: 'Full leather belt' }, price: 65000, img: img('photo-1624222247344-550fb60583dc', 1000), img2: img('photo-1624140716840-06a9d9a9b0b3', 800) },
    { id: 'v24', category: 'accessories', collection: 'Accessoires', fr: { name: 'Chapeau feutre laine' }, en: { name: 'Wool felt hat' }, price: 78000, img: img('photo-1521369909029-2afed882baee', 1000), img2: img('photo-1514327605112-b887c0e61c0a', 800) },
  ];

  function fmt(price) { return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA'; }

  return { i18n, categories, products, fmt, img };
})();
