import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { SimplePage } from '@/components/simple-page';
import { ReferralShare } from './_share';

export const dynamic = 'force-dynamic';

function generateCode(seed: string): string {
  // Simple deterministic-ish code derived from user id (always 6 uppercase chars)
  const b = Buffer.from(seed).toString('base64').replace(/[^A-Z0-9]/gi, '').toUpperCase();
  return 'PB-' + (b.slice(0, 6) || Math.random().toString(36).slice(2, 8).toUpperCase());
}

export default async function ReferralPage() {
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) redirect('/connexion?next=/compte/parrainage');

  const sb = createAdminClient();
  let { data: row } = await sb.from('referrals').select('*').eq('user_id', user.id).maybeSingle();
  if (!row) {
    // Create referral row on first visit
    const code = generateCode(user.id);
    const { data: inserted } = await sb.from('referrals').insert({ user_id: user.id, code }).select().single();
    row = inserted!;
  }

  return (
    <SimplePage title="Parrainage" eyebrow="Recommande Pirabel">
      <div className="mute mb-8" style={{ fontSize: 15, lineHeight: 1.7, maxWidth: 640 }}>
        Partage ton code avec tes amis et ta famille. Chaque personne qui utilise ton code à sa première commande obtient <strong>10% de réduction</strong>. Toi, tu reçois <strong>5 000 FCFA</strong> de crédit Pirabel sur ta prochaine commande.
      </div>

      <ReferralShare code={row.code}/>

      <div className="grid-form mt-8">
        <div className="admin-card">
          <div className="caps mute" style={{ fontSize: 10, marginBottom: 6 }}>Amis parrainés</div>
          <div className="serif" style={{ fontSize: 34, fontWeight: 400 }}>{row.referrals_count}</div>
        </div>
        <div className="admin-card">
          <div className="caps mute" style={{ fontSize: 10, marginBottom: 6 }}>Crédit gagné</div>
          <div className="serif" style={{ fontSize: 34, fontWeight: 400 }}>{new Intl.NumberFormat('fr-FR').format(row.total_earned)} FCFA</div>
        </div>
      </div>

      <div className="mt-8" style={{ padding: 24, background: 'var(--ivory-2)', border: '1px solid var(--line)' }}>
        <div className="caps mute mb-2" style={{ fontSize: 10 }}>Comment ça marche</div>
        <ol style={{ fontSize: 14, lineHeight: 1.9, paddingLeft: 20 }}>
          <li>Tu partages ton code ou ton lien avec un ami</li>
          <li>L&apos;ami l&apos;utilise au checkout → il bénéficie de 10% sur sa 1ère commande</li>
          <li>Dès que sa commande est livrée, tu reçois 5 000 FCFA de crédit</li>
          <li>Ton crédit est utilisable comme un code promo sur toutes tes prochaines commandes</li>
        </ol>
      </div>
    </SimplePage>
  );
}
