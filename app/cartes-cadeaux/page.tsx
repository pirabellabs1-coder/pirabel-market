import { SimplePage } from '@/components/simple-page';
import { GiftCardBuy } from './_buy';

export const metadata = {
  title: 'Chèques cadeaux',
  description: 'Offrir Pirabel — carte cadeau de 10 000 à 500 000 FCFA, livrée par email.',
  alternates: { canonical: '/cartes-cadeaux' },
};

export default function GiftCardsPage() {
  return (
    <SimplePage title="Chèques cadeaux" eyebrow="Offrir Pirabel">
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 48 }} className="grid-form">
        <div>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--ink-soft)', marginBottom: 24 }}>
            Offrez une pièce Pirabel à la personne de votre choix, sans vous tromper ni de taille ni de goût. Le chèque cadeau est envoyé par email au destinataire avec un code unique à utiliser au checkout.
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14, fontSize: 14 }}>
            <li>· Montant libre entre <strong>10 000</strong> et <strong>500 000 FCFA</strong></li>
            <li>· Valable 12 mois sur l&apos;ensemble du catalogue</li>
            <li>· Utilisable en plusieurs commandes</li>
            <li>· Emballage virtuel personnalisable (message)</li>
            <li>· Livraison instantanée par email</li>
          </ul>
        </div>
        <div>
          <GiftCardBuy/>
        </div>
      </div>
    </SimplePage>
  );
}
