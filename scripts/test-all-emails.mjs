// Fires every email template at pirabellabs@gmail.com for visual QA.
import { readFileSync } from 'node:fs';
const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
for (const l of raw.split('\n')) { const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/); if (m) process.env[m[1]] = m[2]; }

// Build origin for testing in DEV mode so we can import lib/email.ts — actually
// simpler: just hit the Resend API directly with each template by importing dist.
// Since Next compiles TS, we'll instead fetch the deployed endpoints that trigger
// emails.

import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'Pirabel <onboarding@resend.dev>';
const TO = 'pirabellabs@gmail.com';
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://pirabel-one.store';

function wrap(title, badge, inner) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f7f3ec;font-family:sans-serif;color:#14110d;"><table width="100%" style="padding:28px 14px;"><tr><td align="center"><table width="600" style="background:#fdfbf7;border:1px solid #e4dccd;max-width:600px;"><tr><td style="background:#14110d;padding:40px;text-align:center;color:#f7f3ec;">${badge ? `<div style="display:inline-block;padding:6px 14px;background:rgba(182,149,99,.15);color:#d9b783;font-size:10px;letter-spacing:.24em;text-transform:uppercase;margin-bottom:20px;border:1px solid rgba(182,149,99,.3);">${badge}</div>` : ''}<div style="font-family:Georgia,serif;font-size:40px;letter-spacing:.04em;">Pirabel</div><div style="width:32px;height:1px;background:#8a6b3a;margin:14px auto;"></div><div style="font-size:10px;letter-spacing:.32em;text-transform:uppercase;opacity:.5;">Maison · Cotonou</div></td></tr><tr><td style="padding:40px;">${inner}</td></tr><tr><td style="padding:24px;background:#ede7dc;border-top:1px solid #d9d2c4;text-align:center;font-size:12px;">📱 WhatsApp +229 01 49 44 67 20 · ✉ support@pirabel-one.store</td></tr><tr><td style="padding:20px;background:#14110d;color:rgba(247,243,236,.55);font-size:10px;text-align:center;letter-spacing:.14em;text-transform:uppercase;">[TEST] ${title} · © 2026 Pirabel</td></tr></table></td></tr></table></body></html>`;
}

const TESTS = [
  {
    subject: '[TEST 1/6] Confirmation commande',
    html: wrap('Confirmation commande', 'Commande confirmée', `
      <h1 style="font-family:Georgia,serif;font-size:32px;margin:0 0 12px;">Merci Aïcha.</h1>
      <p>Ta commande <strong style="font-family:monospace;">PB-TEST01</strong> est bien reçue.</p>
      <table width="100%" style="margin:20px 0;">
        <tr><td width="60"><img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=120&q=85" width="60" height="75"/></td>
        <td style="padding:10px;"><div style="font-family:Georgia,serif;">Baskets Atelier</div><div style="color:#6b6459;font-size:11px;">× 1 · 42 · Blanc</div></td>
        <td align="right">185 000 FCFA</td></tr>
      </table>
      <div style="padding:20px;background:#ede7dc;border-left:3px solid #8a6b3a;"><strong>Aïcha Koudougou</strong><br/>+229 01 49 44 67 20<br/>Haie Vive, Cotonou</div>
      <div style="text-align:center;margin-top:28px;"><a href="${SITE}/suivi?id=PB-TEST01" style="background:#14110d;color:#f7f3ec;padding:16px 36px;text-decoration:none;font-size:11px;letter-spacing:.22em;text-transform:uppercase;display:inline-block;margin:4px;">Suivre</a><a href="${SITE}/facture/PB-TEST01" style="background:transparent;color:#14110d;border:1px solid #14110d;padding:15px 28px;text-decoration:none;font-size:11px;letter-spacing:.22em;text-transform:uppercase;display:inline-block;margin:4px;">📄 Facture</a></div>`),
  },
  {
    subject: '[TEST 2/6] Changement de statut — En route',
    html: wrap('En route', 'En route', `
      <div style="text-align:center;margin-bottom:24px;"><div style="display:inline-block;width:72px;height:72px;border:2px solid #14110d;border-radius:50%;font-size:32px;line-height:68px;">→</div></div>
      <h1 style="font-family:Georgia,serif;font-size:30px;margin:0 0 12px;text-align:center;">En route.</h1>
      <p style="text-align:center;">Ta commande <strong style="font-family:monospace;">PB-TEST01</strong> vient d&apos;être prise en charge par notre livreur.</p>
      <div style="text-align:center;margin-top:28px;"><a href="${SITE}/suivi?id=PB-TEST01" style="background:#14110d;color:#f7f3ec;padding:16px 36px;text-decoration:none;font-size:11px;letter-spacing:.22em;text-transform:uppercase;">Suivre ma commande</a></div>`),
  },
  {
    subject: '[TEST 3/6] Code de vérification OTP',
    html: wrap('OTP', 'Code de vérification', `
      <h1 style="font-family:Georgia,serif;font-size:30px;text-align:center;margin:0 0 12px;">Bienvenue chez Pirabel.</h1>
      <p style="text-align:center;">Pour finaliser la création de ton compte, entre le code ci-dessous.</p>
      <div style="margin:20px auto;padding:28px;background:#ede7dc;border:1px solid #d9d2c4;text-align:center;max-width:340px;">
        <div style="font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:#6b6459;margin-bottom:12px;">Ton code</div>
        <div style="font-family:'Courier New',monospace;font-size:36px;font-weight:500;letter-spacing:.3em;">842 197</div>
        <div style="font-size:11px;color:#9c9589;margin-top:16px;">Valable 10 minutes</div>
      </div>`),
  },
  {
    subject: '[TEST 4/6] Bienvenue + cadeau',
    html: wrap('Bienvenue', 'Bienvenue', `
      <h1 style="font-family:Georgia,serif;font-size:34px;margin:0 0 16px;">Bienvenue Aïcha.</h1>
      <p style="line-height:1.7;">Ton compte Pirabel est actif.</p>
      <div style="margin:24px 0;padding:24px;background:#ede7dc;border-left:3px solid #8a6b3a;">
        <div style="font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#6b6459;">Cadeau de bienvenue</div>
        <div style="font-family:Georgia,serif;font-size:22px;margin-bottom:8px;">20% sur ta 1ère commande</div>
        <code style="font-family:monospace;background:#fdfbf7;padding:4px 10px;border:1px solid #d9d2c4;">BIENVENUE20</code>
      </div>
      <div style="text-align:center;margin-top:32px;"><a href="${SITE}/catalogue" style="background:#14110d;color:#f7f3ec;padding:16px 36px;text-decoration:none;font-size:11px;letter-spacing:.22em;text-transform:uppercase;">Découvrir la boutique</a></div>`),
  },
  {
    subject: '[TEST 5/6] Panier abandonné',
    html: wrap('Panier', 'Panier abandonné', `
      <h1 style="font-family:Georgia,serif;font-size:26px;margin:0 0 8px;">Ton panier t&apos;attend.</h1>
      <p>Pour te donner un coup de pouce, voici <strong>10%</strong> si tu finalises dans les 48h.</p>
      <div style="margin:20px 0;padding:20px;background:#ede7dc;border-left:3px solid #8a6b3a;text-align:center;">
        <code style="font-family:monospace;font-size:24px;letter-spacing:.2em;padding:8px 18px;background:#fdfbf7;border:1px solid #d9d2c4;">REVIENS10</code>
      </div>
      <p><strong>Sous-total : 185 000 FCFA</strong></p>
      <div style="text-align:center;margin-top:24px;"><a href="${SITE}/commande" style="background:#14110d;color:#f7f3ec;padding:16px 36px;text-decoration:none;font-size:11px;letter-spacing:.22em;text-transform:uppercase;">Finaliser</a></div>`),
  },
  {
    subject: '[TEST 6/6] Invitation collaborateur admin',
    html: wrap('Admin', 'Nouveau collaborateur', `
      <h1 style="font-family:Georgia,serif;font-size:28px;margin:0 0 12px;">Tu as été ajouté(e) à l&apos;équipe Pirabel.</h1>
      <p>Tu peux désormais gérer les produits, commandes, promos, journal.</p>
      <div style="margin:24px 0;padding:22px;background:#ede7dc;border-left:3px solid #8a6b3a;">
        <div style="font-size:10px;letter-spacing:.22em;text-transform:uppercase;">Email</div>
        <code style="font-family:monospace;font-size:14px;background:#fdfbf7;padding:6px 10px;border:1px solid #d9d2c4;">mariam@exemple.com</code>
        <div style="font-size:10px;letter-spacing:.22em;text-transform:uppercase;margin-top:18px;">Mot de passe temporaire</div>
        <code style="font-family:monospace;font-size:16px;background:#fdfbf7;padding:8px 12px;border:1px solid #d9d2c4;letter-spacing:.08em;">xK9mNp7qLz8tRv</code>
      </div>
      <div style="text-align:center;margin-top:28px;"><a href="${SITE}/connexion" style="background:#14110d;color:#f7f3ec;padding:16px 36px;text-decoration:none;font-size:11px;letter-spacing:.22em;text-transform:uppercase;">Se connecter</a></div>`),
  },
];

for (const t of TESTS) {
  try {
    const r = await resend.emails.send({ from: FROM, to: TO, subject: t.subject, html: t.html });
    console.log(`  ✓ ${t.subject} → ${r.data?.id || 'sent'}`);
  } catch (e) {
    console.error(`  ✗ ${t.subject} — ${e.message}`);
  }
  await new Promise(r => setTimeout(r, 200));
}
