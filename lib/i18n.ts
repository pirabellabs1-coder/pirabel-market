import type { Lang } from './types';

export type Dict = {
  nav: { women: string; men: string; kids: string; eyewear: string; accessories: string; journal: string };
  announce: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_sub: string;
  discover: string;
  collections: string;
  new_arrivals: string;
  new_sub: string;
  featured: string;
  see_all: string;
  add_cart: string;
  add_bag: string;
  buy_now: string;
  wishlist: string;
  account: string;
  bag: string;
  search: string;
  quick_view: string;
  story_title: string;
  story_body: string;
  read_story: string;
  svc_delivery: string;
  svc_delivery_sub: string;
  svc_pay: string;
  svc_pay_sub: string;
  svc_care: string;
  svc_care_sub: string;
  newsletter_title: string;
  newsletter_sub: string;
  subscribe: string;
  email_ph: string;
  footer_about: string;
};

export const i18n: Record<Lang, Dict> = {
  fr: {
    nav: { women: 'Femme', men: 'Homme', kids: 'Enfant', eyewear: 'Lunetterie', accessories: 'Accessoires', journal: 'Le Journal' },
    announce: 'Livraison offerte au Bénin dès 50 000 FCFA — Service client WhatsApp',
    hero_eyebrow: 'Collection Printemps · 2026',
    hero_title: "L'art du <em>quotidien</em>,<br/>réinventé.",
    hero_sub: "Une sélection d'objets, vêtements et accessoires pensés pour durer. Livrés avec soin, partout au Bénin.",
    discover: 'Découvrir',
    collections: 'Collections',
    new_arrivals: 'Nouveautés',
    new_sub: 'La sélection du mois, choisie pour son intemporalité.',
    featured: "Pièces d'exception",
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
    story_body: "Depuis Cotonou, nous sélectionnons avec exigence auprès d'artisans et de maisons qui partagent notre obsession du détail. Chaque pièce est choisie pour la qualité de ses matériaux, la rigueur de sa finition, et sa capacité à traverser le temps.",
    read_story: 'Notre histoire',
    svc_delivery: 'Livraison soignée',
    svc_delivery_sub: 'Emballage élégant. Cotonou en 24h, le Bénin en 48–72h.',
    svc_pay: 'Paiement simple',
    svc_pay_sub: 'Mobile Money (MTN, Moov, Celtiis) ou à la livraison.',
    svc_care: 'Service attentif',
    svc_care_sub: 'Une conseillère disponible par WhatsApp, 7 jours sur 7.',
    newsletter_title: 'Rester informé',
    newsletter_sub: 'Accès privilégié aux nouvelles collections et événements privés.',
    subscribe: "S'inscrire",
    email_ph: 'Votre adresse e-mail',
    footer_about: "Maison béninoise fondée à Cotonou. Une sélection exigeante d'objets choisis pour durer.",
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
    new_sub: "This month's selection, chosen for its timelessness.",
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
  },
};
