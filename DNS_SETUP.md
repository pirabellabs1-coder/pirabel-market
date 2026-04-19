# Configuration DNS — pirabel-one.store

Le domaine est chez **LWS**. Tu dois ouvrir le panneau DNS LWS (Zone DNS) et faire ces changements.

## 1. Pointer le domaine vers Vercel (obligatoire)

**Supprime** l'enregistrement A existant qui pointe vers `216.150.1.1` (page parking LWS).

**Ajoute ces 2 enregistrements :**

| Type  | Nom         | Valeur                   | TTL  |
|-------|-------------|--------------------------|------|
| A     | `@`         | `216.198.79.1`           | 3600 |
| CNAME | `www`       | `cname.vercel-dns.com.`  | 3600 |

> `@` = le domaine nu (pirabel-one.store). Chez LWS la case "Nom" peut accepter `@` ou être laissée vide.

Attente de propagation : 5 min à 1h en général (max 24h). Vercel détecte automatiquement et active HTTPS.

## 2. Configurer Resend pour envoyer les emails depuis `support@pirabel-one.store` (obligatoire si tu veux l'email marqué Pirabel)

Sans cette étape, les emails partent de `onboarding@resend.dev` (fonctionne, mais pas "officiel").

1. Va sur https://resend.com/domains
2. Clique **Add Domain** → entre `pirabel-one.store` → région `eu-west-1`
3. Resend te donne **3 enregistrements DNS** à ajouter chez LWS. Exemple du format :

   | Type  | Nom                                 | Valeur                                         |
   |-------|-------------------------------------|------------------------------------------------|
   | TXT   | `send.pirabel-one.store`            | `v=spf1 include:amazonses.com ~all`           |
   | TXT   | `resend._domainkey.pirabel-one.store` | `p=MIGfMA0GCSqG...` (long DKIM)              |
   | MX    | `send.pirabel-one.store`            | `feedback-smtp.eu-west-1.amazonses.com` priorité 10 |

4. Ajoute-les chez LWS (onglet DNS du domaine).
5. Reviens sur Resend → clique **Verify**. Quand c'est vert :

6. **Envoie-moi le DKIM confirmé** (juste "vérifié" suffit). Je mettrai à jour la variable `EMAIL_FROM=Pirabel <support@pirabel-one.store>` dans Vercel, puis je redéploie. À partir de là, les emails partent sous ton nom.

## 3. Autoriser les redirections Supabase (obligatoire pour l'auth en prod)

Aucun DNS — juste dashboard Supabase :

https://supabase.com/dashboard/project/msjnisffhfmneaesumxw/auth/url-configuration

- **Site URL** : `https://pirabel-one.store`
- **Redirect URLs** — ajoute :
  ```
  https://pirabel-one.store/**
  https://www.pirabel-one.store/**
  https://pirabel-market.vercel.app/**
  http://localhost:3000/**
  ```

Clique **Save**.

## 4. Vérification

Une fois DNS propagé :

```bash
curl -I https://pirabel-one.store
# → HTTP/2 200 avec cert Let's Encrypt auto-généré par Vercel
```

Puis inscris-toi sur https://pirabel-one.store/connexion avec `support@pirabel-one.store`.

## Récap des services et où ils vivent

| Service       | Compte              | URL dashboard |
|---------------|---------------------|---------------|
| Code source   | GitHub              | github.com/pirabellabs1-coder/pirabel-market |
| Hébergement   | Vercel (gildasli)   | vercel.com/gildaslis-projects/pirabel-market |
| Base de données + Auth + Storage | Supabase | supabase.com/dashboard/project/msjnisffhfmneaesumxw |
| Emails        | Resend              | resend.com/domains |
| Domaine + DNS | LWS                 | panel.lws.fr |
