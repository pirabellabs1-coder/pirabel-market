# Pirabel — Maison de Cotonou

Marketplace e-commerce pour le Bénin.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Supabase** (Postgres + Auth + Storage) — phase 2
- **Kkiapay** (paiement mobile Bénin) — phase 3
- **Vercel** (hébergement) — phase 4

## Démarrage

```bash
npm install
npm run dev
```

Ouvre http://localhost:3000

## Structure

```
app/               # Pages (App Router)
components/        # Composants React
lib/               # Données, utilitaires, types
supabase/          # Schéma SQL (phase 2)
_prototype/        # Maquette v2 d'origine (référence)
```

## Phases

- [x] **Phase 1** — Site complet avec données locales
- [ ] **Phase 2** — Supabase (produits en base, comptes, admin)
- [ ] **Phase 3** — Paiement Kkiapay
- [ ] **Phase 4** — Mise en ligne

Voir `.env.example` pour les clés à configurer aux phases 2 et 3.
