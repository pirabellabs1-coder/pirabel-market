import Link from 'next/link';
import { LegalPage } from '@/components/legal-page';
import { BRAND } from '@/lib/brand';

export const metadata = {
  title: 'Conditions Générales de Vente',
  description: 'Conditions Générales de Vente de Pirabel — commandes, paiement, livraison, retours.',
};

export default function ConditionsPage() {
  return (
    <LegalPage title="Conditions Générales" eyebrow="CGV & CGU" updatedOn="19 avril 2026">
      <h2>1. Éditeur</h2>
      <p>Le présent site <strong>pirabel-one.store</strong> est édité par Pirabel, maison basée à {BRAND.address}, {BRAND.country}. Contact : <a href={`mailto:${BRAND.contactEmail}`}>{BRAND.contactEmail}</a> — WhatsApp : <a href={BRAND.whatsappUrl}>{BRAND.phoneDisplay}</a>.</p>

      <h2>2. Objet</h2>
      <p>Les présentes Conditions Générales de Vente régissent l&apos;ensemble des ventes conclues sur le site pirabel-one.store entre Pirabel (« le Vendeur ») et toute personne physique ou morale effectuant un achat (« le Client »). Toute commande vaut acceptation pleine et entière des présentes CGV.</p>

      <h2>3. Produits</h2>
      <p>Les produits proposés sont ceux figurant dans le catalogue publié sur le site, dans la limite des stocks disponibles. Les photographies sont fournies à titre illustratif ; les spécificités techniques restent contractuelles. Toute commande sur un produit en rupture est annulée et remboursée intégralement.</p>

      <h2>4. Prix</h2>
      <p>Les prix sont affichés en <strong>francs CFA (FCFA)</strong>, toutes taxes comprises. Les frais de livraison sont ajoutés au moment de la finalisation de la commande et affichés avant validation. Pirabel se réserve le droit de modifier les prix à tout moment ; les produits sont facturés au prix en vigueur au moment de la validation de la commande.</p>

      <h2>5. Commande</h2>
      <p>La commande est réputée validée après : sélection des articles, identification du Client, choix du mode de livraison et du mode de paiement, et confirmation finale. Un email de confirmation est envoyé au Client avec un numéro de commande au format <code>PB-XXXXXX</code>.</p>

      <h2>6. Paiement</h2>
      <p>Les moyens de paiement acceptés sont :</p>
      <ul>
        <li><strong>Mobile Money</strong> : MTN Mobile Money, Moov Money, Celtiis Cash</li>
        <li><strong>Carte bancaire</strong> (Visa, Mastercard) via notre prestataire de paiement sécurisé</li>
        <li><strong>Paiement à la livraison</strong> en espèces (Cotonou et communes limitrophes uniquement)</li>
      </ul>
      <p>Pirabel ne conserve aucune donnée bancaire. Les transactions sont chiffrées de bout en bout.</p>

      <h2>7. Livraison</h2>
      <p>Zones et délais :</p>
      <ul>
        <li><strong>Cotonou et communes limitrophes</strong> : 24 heures ouvrées après confirmation du paiement</li>
        <li><strong>Reste du Bénin</strong> : 48 à 72 heures ouvrées</li>
      </ul>
      <p>La livraison est <strong>offerte</strong> dès 50 000 FCFA d&apos;achat. En dessous, un forfait de 2 500 FCFA s&apos;applique. Le Client peut suivre sa commande via la page <Link href="/suivi">/suivi</Link> avec le numéro de commande.</p>

      <h2>8. Droit de rétractation</h2>
      <p>Conformément à la législation applicable au Bénin, le Client dispose d&apos;un délai de <strong>14 jours</strong> à compter de la réception du produit pour exercer son droit de rétractation, sans avoir à motiver sa décision. Le produit doit être retourné dans son emballage d&apos;origine, non porté et avec toutes ses étiquettes.</p>

      <h2>9. Garantie & service après-vente</h2>
      <p>Tous nos produits bénéficient de la garantie légale contre les vices cachés. Pour toute réclamation, contactez-nous à <a href={`mailto:${BRAND.contactEmail}`}>{BRAND.contactEmail}</a> ou via WhatsApp. Nous répondons sous 2 heures en jours ouvrés.</p>

      <h2>10. Propriété intellectuelle</h2>
      <p>L&apos;ensemble des contenus du site (photos, textes, logos, identité visuelle, code source) est protégé par le droit d&apos;auteur. Toute reproduction, représentation ou exploitation non autorisée est interdite.</p>

      <h2>11. Données personnelles</h2>
      <p>Les traitements de données personnelles font l&apos;objet d&apos;une politique dédiée consultable sur <Link href="/confidentialite">/confidentialite</Link>.</p>

      <h2>12. Droit applicable & juridiction</h2>
      <p>Les présentes CGV sont soumises au droit béninois. Tout litige sera porté devant les tribunaux compétents de Cotonou, après tentative de règlement amiable.</p>

      <h2>13. Contact</h2>
      <p>Pour toute question : <a href={`mailto:${BRAND.contactEmail}`}>{BRAND.contactEmail}</a> · <a href={BRAND.whatsappUrl}>WhatsApp {BRAND.phoneDisplay}</a> · {BRAND.address}.</p>
    </LegalPage>
  );
}
