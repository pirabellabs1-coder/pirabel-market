import { BRAND } from '@/lib/brand';

export const dynamic = 'force-dynamic';

export default function AdminApiPage() {
  const hasKey = !!process.env.ADMIN_API_KEY;
  const key = process.env.ADMIN_API_KEY ?? '';
  const maskedKey = key ? `${key.slice(0, 8)}…${key.slice(-4)}` : '';
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://pirabel-one.store';

  return (
    <div>
      <div className="admin-page-head">
        <h1>API Pirabel</h1>
        <p className="mute">Accès programmatique aux produits, commandes et statistiques. Utile pour : compta, mobile, intégration POS, automatisations.</p>
      </div>

      <div className="admin-card">
        <div className="caps mute mb-2" style={{ fontSize: 10 }}>Clé API active</div>
        {hasKey ? (
          <>
            <div className="mono" style={{ fontSize: 15, padding: '12px 16px', background: 'var(--ivory-2)', border: '1px solid var(--line)', wordBreak: 'break-all' }}>{maskedKey}</div>
            <p className="mute mt-2" style={{ fontSize: 12 }}>
              La clé complète est dans la variable d&apos;environnement <code>ADMIN_API_KEY</code> sur Vercel. Pour la rotation, demande-la-moi — je génère une nouvelle clé et push en 5 sec.
            </p>
          </>
        ) : (
          <p style={{ color: '#a63d2a' }}>Aucune clé configurée. Ajoute <code>ADMIN_API_KEY</code> dans Vercel (Settings → Environment Variables).</p>
        )}
      </div>

      <div className="admin-card mt-8">
        <h2 className="serif" style={{ fontSize: 22, fontWeight: 400, marginBottom: 16 }}>Authentification</h2>
        <p style={{ marginBottom: 8 }}>Toutes les requêtes doivent inclure :</p>
        <pre style={{ padding: 14, background: '#0b0c0d', color: '#dfe3e6', fontSize: 13, lineHeight: 1.6, overflow: 'auto', fontFamily: 'monospace' }}>{`Authorization: Bearer ${hasKey ? maskedKey : 'TA_CLE_API'}`}</pre>
      </div>

      <div className="admin-card mt-6">
        <h2 className="serif" style={{ fontSize: 22, fontWeight: 400, marginBottom: 12 }}>Endpoints disponibles</h2>
        <table className="admin-table">
          <thead><tr><th>Méthode</th><th>URL</th><th>Description</th></tr></thead>
          <tbody>
            <tr><td className="mono">GET</td><td className="mono">/api/v1/products</td><td>Liste les produits. Paramètres : <code>?limit=50&offset=0&category=shoes&published=true</code></td></tr>
            <tr><td className="mono">POST</td><td className="mono">/api/v1/products</td><td>Crée un produit (body JSON).</td></tr>
            <tr><td className="mono">GET</td><td className="mono">/api/v1/products/&#123;id&#125;</td><td>Récupère un produit.</td></tr>
            <tr><td className="mono">PATCH</td><td className="mono">/api/v1/products/&#123;id&#125;</td><td>Met à jour un produit.</td></tr>
            <tr><td className="mono">DELETE</td><td className="mono">/api/v1/products/&#123;id&#125;</td><td>Supprime un produit.</td></tr>
            <tr><td className="mono">GET</td><td className="mono">/api/v1/orders</td><td>Liste des commandes. Params : <code>?status=paid&since=2026-01-01</code></td></tr>
            <tr><td className="mono">GET</td><td className="mono">/api/v1/orders/&#123;id&#125;</td><td>Détail commande + articles.</td></tr>
            <tr><td className="mono">PATCH</td><td className="mono">/api/v1/orders/&#123;id&#125;</td><td>Met à jour une commande (ex : statut).</td></tr>
            <tr><td className="mono">GET</td><td className="mono">/api/v1/stats</td><td>Stats globales (produits, commandes, CA 24h/30j, newsletter).</td></tr>
          </tbody>
        </table>
      </div>

      <div className="admin-card mt-6">
        <h2 className="serif" style={{ fontSize: 22, fontWeight: 400, marginBottom: 12 }}>Exemple — récupérer les commandes payées</h2>
        <pre style={{ padding: 14, background: '#0b0c0d', color: '#dfe3e6', fontSize: 13, lineHeight: 1.6, overflow: 'auto', fontFamily: 'monospace' }}>{`curl -H "Authorization: Bearer ${hasKey ? maskedKey : 'TA_CLE'}" \\
  "${site}/api/v1/orders?status=paid&limit=100"`}</pre>
      </div>

      <div className="admin-card mt-6">
        <h2 className="serif" style={{ fontSize: 22, fontWeight: 400, marginBottom: 12 }}>Exemple — créer un produit</h2>
        <pre style={{ padding: 14, background: '#0b0c0d', color: '#dfe3e6', fontSize: 13, lineHeight: 1.6, overflow: 'auto', fontFamily: 'monospace' }}>{`curl -X POST -H "Authorization: Bearer ${hasKey ? maskedKey : 'TA_CLE'}" \\
  -H "Content-Type: application/json" \\
  "${site}/api/v1/products" \\
  -d '{
    "id": "custom-001",
    "name_fr": "Sac en cuir",
    "name_en": "Leather bag",
    "price": 125000,
    "img": "https://...",
    "category": "accessories",
    "collection": "Accessoires",
    "published": true
  }'`}</pre>
      </div>

      <p className="mute mt-6" style={{ fontSize: 12 }}>
        La clé a les mêmes droits qu&apos;un admin en base (bypass RLS). Traite-la comme un mot de passe. Ne la commit jamais dans un repo public. Pour la rotation, demande ici « rotate api ».
      </p>
    </div>
  );
}
