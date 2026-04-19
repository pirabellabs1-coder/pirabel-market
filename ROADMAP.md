# Pirabel — Roadmap

État au : 19/04/2026

## ✅ Déjà en place (phase 1 + 2 + finitions)

- Site public 10 pages (accueil, catalogue, fiche produit, panier, commande, suivi, compte, contact, propos, journal, 404)
- Design luxe éditorial responsive mobile + desktop
- Base Supabase (8 tables, 24 produits seedés)
- Panier + favoris + checkout + email confirmation Resend
- Auth email/password + Google OAuth + mot de passe oublié
- Admin : dashboard, produits CRUD (upload image URL ou galerie), commandes + statuts, catégories, clients
- Recherche fonctionnelle (modal header)
- Emails transactionnels (confirmation commande + changement de statut)
- Déployé sur Vercel avec domaine custom `pirabel-one.store` et HTTPS

---

## 🔴 Priorité 1 — Critique avant lancement commercial

### Paiement Kkiapay (phase 3)
Intégrer MTN MoMo / Moov Money / Celtiis / carte via Kkiapay.
- Crée un compte Kkiapay (kkiapay.me)
- Je branche le SDK : checkout → redirection Kkiapay → webhook → `orders.status = 'paid'` + email
- Option : paiement à la livraison reste dispo

### 2FA / sécurité renforcée admin
- TOTP (Google Authenticator) via Supabase MFA
- Restriction IP optionnelle
- Session courte pour les accès admin (auto-logout après 30 min inactivité)

### Sauvegardes automatiques
- Backup Supabase quotidien automatique (activé par défaut dans Supabase, à vérifier)
- Export CSV des commandes depuis /admin

---

## 🟡 Priorité 2 — Améliorations business (cette semaine/mois)

### Promotions & codes promo
- Table `promo_codes` : code, type (pourcentage/fixe), dates validité, stock, condition (min panier)
- Champ sur /commande pour saisir le code
- Gestion depuis /admin/promos

### Popups admin
- Table `popups` : titre, texte, image, date début/fin, target (tous, nouveaux visiteurs, panier abandonné)
- Affichage au 1er scroll ou au 3ème clic ou exit-intent
- Gestion depuis /admin/popups : CRUD + preview

### Stock réel & alertes
- Gestion fine du stock (variantes taille × couleur)
- Alerte admin quand stock < seuil (email + badge dans l'admin)
- "Rupture de stock" automatique côté client

### Avis clients (reviews)
- Après livraison, email auto "Notez votre commande" (1–5 étoiles + commentaire)
- Affichage sur fiche produit
- Modération depuis /admin/avis

### Newsletter
- Page admin /admin/newsletter : liste des inscrits + envoi d'une campagne via Resend
- Éditeur WYSIWYG simple pour composer l'email
- Segments : tous, acheteurs, inactifs 90j+

### Multi-variants
- Actuellement tailles/couleurs sont mutuellement séparés dans le formulaire
- Gérer les combinaisons (S+Noir = 3 en stock, S+Rouge = rupture)
- Vue matricielle dans l'admin

### Articles du Journal
- Gestion depuis /admin/journal : CRUD + upload image + éditeur texte riche
- Page article `/journal/[slug]` avec contenu long

---

## 🟢 Priorité 3 — Optimisations & finitions (nice-to-have)

### Performance & SEO
- Sitemap.xml + robots.txt
- Métadonnées Open Graph + Twitter Card par produit
- JSON-LD Product/Offer pour rich snippets Google
- Compression d'images automatique (Supabase Storage transform ou Next/Image)
- Analytics (Plausible ou Vercel Analytics, RGPD-friendly)

### Internationalisation
- Passer le site en vrai multilingue (next-intl) avec URLs `/fr/...` et `/en/...`
- Détection langue navigateur
- Future : ajouter wolof, fon, mina pour marché local

### Expérience client
- Suivi de livraison avec carte (position livreur temps réel via Supabase Realtime)
- Chat live avec admin (Supabase Realtime + table `messages`)
- Notifications push web (abonnement PWA) — "Votre commande est en route"
- PWA installable (Add to Home Screen sur mobile)

### Expérience admin
- Mode bulk : éditer le prix de 20 produits en un clic
- Export commandes CSV / Excel par période
- Filtres avancés commandes (par statut, période, ville, paiement)
- Vue calendrier des commandes (Kanban par statut)
- Duplication d'un produit en 1 clic

### Design
- Mode sombre (variables CSS déjà en place, juste à activer le toggle)
- Animations au scroll (Framer Motion ou CSS)
- Effet hover plus raffiné sur les cartes produit
- Galerie produit full-screen avec zoom

---

## 🔧 Architecture / Dette technique

- Vrai système de log d'erreurs (Sentry)
- Tests automatisés (Playwright pour e2e, Vitest pour unit)
- CI GitHub Actions (typecheck + build + lint sur chaque PR)
- Rate limiting sur /api/orders et /api/upload (anti-spam)
- CSP headers + security headers (Next.js config)

---

## Comment on priorise

Chaque fois qu'on revient, je te demande : "on prend quoi sur la liste ?". Dis-moi juste la catégorie (ex : "promotions" ou "2FA" ou "popups") et je construis.

Les 🔴 sont vraiment bloquants avant de commencer à vendre en prod. Les 🟡 font gagner du CA. Les 🟢 améliorent le feel mais le site marche sans.
