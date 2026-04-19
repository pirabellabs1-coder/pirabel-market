# Déploiement Vercel — Pirabel

## 1. Créer le projet Vercel (une seule fois)

1. Va sur https://vercel.com/new
2. "Import Git Repository" → choisis `pirabellabs1-coder/pirabel-market`
3. Framework Preset: **Next.js** (détecté auto)
4. Root directory: `./` (par défaut)
5. Build command / Output: laisse par défaut
6. **Environment Variables** — ajoute ces 3 variables :

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://msjnisffhfmneaesumxw.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (copie depuis `.env.local`) |
| `SUPABASE_SERVICE_ROLE_KEY` | (copie depuis `.env.local`) |

7. Clique **Deploy**

## 2. Après le premier déploiement

- Tu obtiens une URL `https://pirabel-market-xxx.vercel.app`
- Chaque push sur `main` redéploie automatiquement

## 3. Domaine custom (optionnel)

Dans le projet Vercel → **Settings** → **Domains** :
- Ajoute ton domaine (ex: `pirabel.bj`, `pirabel.shop`…)
- Suis les instructions DNS (CNAME vers `cname.vercel-dns.com`)

## 4. Redirect emails Supabase

Pour que les liens de confirmation / reset password pointent vers ton site prod :

Dashboard Supabase → **Authentication** → **URL Configuration** :
- **Site URL** : `https://pirabel-market-xxx.vercel.app` (ou ton domaine)
- **Redirect URLs** : ajoute la même URL
