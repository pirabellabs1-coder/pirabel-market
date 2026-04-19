import Link from 'next/link';
import { LegalPage } from '@/components/legal-page';
import { BRAND } from '@/lib/brand';

export const metadata = {
  title: 'Politique de Confidentialité',
  description: 'Comment Pirabel collecte, utilise et protège tes données personnelles.',
};

export default function ConfidentialitePage() {
  return (
    <LegalPage title="Confidentialité" eyebrow="Protection des données" updatedOn="19 avril 2026">
      <p>Ta vie privée compte. Voici, dans un langage clair, ce que nous collectons, pourquoi, et comment tu gardes la main sur tes données.</p>

      <h2>1. Responsable du traitement</h2>
      <p>Pirabel — {BRAND.address}, {BRAND.country}. Contact pour toute question liée à tes données : <a href={`mailto:${BRAND.contactEmail}`}>{BRAND.contactEmail}</a>.</p>

      <h2>2. Données que nous collectons</h2>
      <table>
        <thead><tr><th>Catégorie</th><th>Exemples</th><th>Quand</th></tr></thead>
        <tbody>
          <tr><td>Compte</td><td>Email, prénom, nom, mot de passe (chiffré)</td><td>Inscription</td></tr>
          <tr><td>Commande</td><td>Adresse de livraison, téléphone, produits achetés, montant, moyen de paiement (référence uniquement)</td><td>Achat</td></tr>
          <tr><td>Navigation</td><td>Pages visitées, panier, préférences de langue</td><td>Utilisation du site</td></tr>
          <tr><td>Communication</td><td>Messages contact, inscription newsletter</td><td>Tu nous contactes</td></tr>
        </tbody>
      </table>

      <h2>3. À quoi servent tes données</h2>
      <ul>
        <li>Traiter ta commande et la livrer</li>
        <li>Te tenir informé(e) du statut de ta commande (emails transactionnels)</li>
        <li>Gérer ton compte client et tes favoris</li>
        <li>Répondre à tes messages</li>
        <li>T&apos;envoyer la newsletter (uniquement si tu t&apos;y es inscrit(e))</li>
        <li>Améliorer le site (statistiques agrégées et anonymes)</li>
        <li>Respecter nos obligations légales (comptabilité, lutte anti-fraude)</li>
      </ul>

      <h2>4. Durée de conservation</h2>
      <ul>
        <li>Compte client : tant que le compte est actif, + 3 ans d&apos;inactivité</li>
        <li>Commandes et factures : 10 ans (obligation comptable)</li>
        <li>Newsletter : jusqu&apos;à désinscription</li>
        <li>Logs techniques : 12 mois maximum</li>
      </ul>

      <h2>5. Qui accède à tes données</h2>
      <p>Nous utilisons les prestataires suivants, strictement pour les besoins du site :</p>
      <ul>
        <li><strong>Supabase</strong> (Francfort, UE) — hébergement base de données, authentification</li>
        <li><strong>Vercel</strong> (Paris, UE) — hébergement du site web</li>
        <li><strong>Resend</strong> (UE) — envoi des emails transactionnels</li>
        <li><strong>Google</strong> (si tu utilises « Continuer avec Google ») — authentification OAuth uniquement</li>
      </ul>
      <p>Aucune de ces entreprises n&apos;utilise tes données pour ses propres finalités marketing. Nous ne vendons jamais tes données à des tiers.</p>

      <h2>6. Transferts hors Bénin</h2>
      <p>Tes données peuvent être stockées dans l&apos;Union européenne (Francfort, Paris). Les transferts sont encadrés par les clauses contractuelles types de la Commission européenne, qui offrent un niveau de protection équivalent au RGPD.</p>

      <h2>7. Tes droits</h2>
      <p>Tu peux à tout moment :</p>
      <ul>
        <li><strong>Accéder</strong> à tes données (page <Link href="/compte">/compte</Link>)</li>
        <li><strong>Rectifier</strong> les informations inexactes (paramètres du compte)</li>
        <li><strong>Supprimer</strong> ton compte (demande par email)</li>
        <li><strong>T&apos;opposer</strong> à un traitement ou le limiter</li>
        <li><strong>Exporter</strong> tes données dans un format portable</li>
      </ul>
      <p>Pour exercer ces droits : <a href={`mailto:${BRAND.contactEmail}`}>{BRAND.contactEmail}</a>. Nous répondons sous 30 jours.</p>

      <h2>8. Sécurité</h2>
      <p>Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger tes données : HTTPS obligatoire, mots de passe chiffrés (bcrypt), sauvegardes quotidiennes, accès restreint côté administration, isolement des environnements (RLS Postgres), journalisation des accès sensibles.</p>

      <h2>9. Cookies</h2>
      <p>Voir notre <Link href="/cookies">politique cookies</Link> pour le détail.</p>

      <h2>10. Modifications</h2>
      <p>Nous pouvons mettre à jour cette politique pour refléter l&apos;évolution de nos pratiques ou de la loi. La date de dernière mise à jour est indiquée en tête de page. Toute modification substantielle sera notifiée par email aux clients concernés.</p>

      <h2>11. Nous contacter</h2>
      <p>Email : <a href={`mailto:${BRAND.contactEmail}`}>{BRAND.contactEmail}</a> — WhatsApp : <a href={BRAND.whatsappUrl}>{BRAND.phoneDisplay}</a> — Adresse : {BRAND.address}, {BRAND.country}.</p>
    </LegalPage>
  );
}
