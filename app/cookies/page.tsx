import Link from 'next/link';
import { LegalPage } from '@/components/legal-page';
import { BRAND } from '@/lib/brand';

export const metadata = {
  title: 'Cookies',
  description: 'Les cookies utilisés sur pirabel-one.store et comment les gérer.',
};

export default function CookiesPage() {
  return (
    <LegalPage title="Cookies" eyebrow="Gestion des cookies" updatedOn="19 avril 2026">
      <p>Ce site utilise des cookies strictement nécessaires au fonctionnement. Aucun cookie de suivi publicitaire ni de profilage n&apos;est déposé.</p>

      <h2>Qu&apos;est-ce qu&apos;un cookie ?</h2>
      <p>Un cookie est un petit fichier texte stocké par ton navigateur sur ton appareil. Il permet au site de te reconnaître d&apos;une page à l&apos;autre (session), de mémoriser tes préférences et de conserver ton panier.</p>

      <h2>Cookies utilisés sur pirabel-one.store</h2>
      <table>
        <thead><tr><th>Nom</th><th>Finalité</th><th>Durée</th></tr></thead>
        <tbody>
          <tr><td><code>sb-msjnisffhfmneaesumxw-auth-token</code></td><td>Session connexion Supabase</td><td>7 jours (renouvelable)</td></tr>
          <tr><td><code>pb_admin_gate</code></td><td>Déverrouillage de l&apos;espace admin</td><td>30 jours</td></tr>
          <tr><td>Données stockées dans localStorage</td><td>Panier, favoris, préférence langue FR/EN, popups vues</td><td>Jusqu&apos;à suppression manuelle</td></tr>
        </tbody>
      </table>

      <h2>Cookies tiers</h2>
      <p>Aucun cookie publicitaire ni outil de tracking (pas de Google Analytics, Meta Pixel, etc.) n&apos;est en place.</p>
      <p>Lorsque tu te connectes avec Google, tu peux recevoir un cookie depuis le domaine de Google uniquement pour la durée de la connexion OAuth. Il n&apos;est pas partagé avec Pirabel.</p>

      <h2>Comment les gérer</h2>
      <p>Tous les navigateurs modernes permettent de bloquer ou supprimer les cookies. La plupart des fonctionnalités du site nécessitent cependant les cookies de session (panier, compte, commande) pour fonctionner correctement.</p>
      <ul>
        <li><strong>Chrome</strong> : Paramètres → Confidentialité et sécurité → Cookies</li>
        <li><strong>Safari</strong> : Préférences → Confidentialité</li>
        <li><strong>Firefox</strong> : Paramètres → Vie privée et sécurité</li>
        <li><strong>Edge</strong> : Paramètres → Cookies et autorisations de site</li>
      </ul>

      <h2>Questions ?</h2>
      <p>Écris-nous à <a href={`mailto:${BRAND.contactEmail}`}>{BRAND.contactEmail}</a>.</p>

      <h2>Voir aussi</h2>
      <p>
        <Link href="/confidentialite">Politique de confidentialité</Link> ·{' '}
        <Link href="/conditions">Conditions générales</Link>
      </p>
    </LegalPage>
  );
}
