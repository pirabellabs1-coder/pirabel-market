'use client';

import { useState, type ReactNode } from 'react';

type Lang = 'curl' | 'js' | 'python';

const SAMPLES = {
  list_products: {
    method: 'GET',
    path: '/api/v1/products',
    query: '?limit=50&published=true',
    description: 'Liste paginée des produits. Filtres : `category`, `published`, `limit` (max 200), `offset`.',
    curl: (site: string, key: string) => `curl -H "Authorization: Bearer ${key}" \\\n  "${site}/api/v1/products?limit=50&published=true"`,
    js: (site: string, key: string) => `const res = await fetch("${site}/api/v1/products?limit=50&published=true", {
  headers: { "Authorization": "Bearer ${key}" },
});
const { data, count } = await res.json();`,
    python: (site: string, key: string) => `import requests
r = requests.get(
  "${site}/api/v1/products",
  headers={"Authorization": f"Bearer ${key}"},
  params={"limit": 50, "published": "true"},
)
data = r.json()`,
    response: `{
  "data": [
    {
      "id": "v01",
      "name_fr": "Baskets en cuir « Atelier »",
      "price": 185000,
      "img": "https://...",
      "category": "shoes",
      "published": true,
      ...
    }
  ],
  "count": 24,
  "limit": 50,
  "offset": 0
}`,
  },
  create_product: {
    method: 'POST',
    path: '/api/v1/products',
    description: 'Crée un produit. Les champs requis : `id`, `name_fr`, `name_en`, `price`, `img`.',
    curl: (site: string, key: string) => `curl -X POST -H "Authorization: Bearer ${key}" \\\n  -H "Content-Type: application/json" \\\n  "${site}/api/v1/products" \\\n  -d '{
    "id": "sac-cuir-001",
    "name_fr": "Sac en cuir souple",
    "name_en": "Soft leather bag",
    "price": 295000,
    "img": "https://exemple.com/sac.jpg",
    "category": "accessories",
    "collection": "Accessoires",
    "published": true
  }'`,
    js: (site: string, key: string) => `await fetch("${site}/api/v1/products", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${key}",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    id: "sac-cuir-001",
    name_fr: "Sac en cuir souple",
    name_en: "Soft leather bag",
    price: 295000,
    img: "https://exemple.com/sac.jpg",
    category: "accessories",
    collection: "Accessoires",
    published: true,
  }),
});`,
    python: (site: string, key: string) => `import requests
requests.post(
  "${site}/api/v1/products",
  headers={"Authorization": f"Bearer ${key}"},
  json={
    "id": "sac-cuir-001",
    "name_fr": "Sac en cuir souple",
    "name_en": "Soft leather bag",
    "price": 295000,
    "img": "https://exemple.com/sac.jpg",
    "category": "accessories",
    "collection": "Accessoires",
    "published": True,
  },
)`,
    response: `{
  "id": "sac-cuir-001",
  "name_fr": "Sac en cuir souple",
  "price": 295000,
  "created_at": "2026-04-19T08:30:00Z",
  ...
}`,
  },
  update_product: {
    method: 'PATCH',
    path: '/api/v1/products/{id}',
    description: 'Met à jour un produit (tous les champs sont optionnels).',
    curl: (site: string, key: string) => `curl -X PATCH -H "Authorization: Bearer ${key}" \\\n  -H "Content-Type: application/json" \\\n  "${site}/api/v1/products/sac-cuir-001" \\\n  -d '{ "price": 275000, "stock": 12 }'`,
    js: (site: string, key: string) => `await fetch("${site}/api/v1/products/sac-cuir-001", {
  method: "PATCH",
  headers: {
    "Authorization": "Bearer ${key}",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ price: 275000, stock: 12 }),
});`,
    python: (site: string, key: string) => `requests.patch(
  "${site}/api/v1/products/sac-cuir-001",
  headers={"Authorization": f"Bearer ${key}"},
  json={"price": 275000, "stock": 12},
)`,
    response: `{ "id": "sac-cuir-001", "price": 275000, "stock": 12, ... }`,
  },
  list_orders: {
    method: 'GET',
    path: '/api/v1/orders',
    query: '?status=paid&limit=100',
    description: 'Liste des commandes. Filtres : `status`, `since` (ISO date), `limit`, `offset`.',
    curl: (site: string, key: string) => `curl -H "Authorization: Bearer ${key}" \\\n  "${site}/api/v1/orders?status=paid&since=2026-01-01"`,
    js: (site: string, key: string) => `const res = await fetch("${site}/api/v1/orders?status=paid", {
  headers: { "Authorization": "Bearer ${key}" },
});
const { data, count } = await res.json();`,
    python: (site: string, key: string) => `r = requests.get(
  "${site}/api/v1/orders",
  headers={"Authorization": f"Bearer ${key}"},
  params={"status": "paid", "since": "2026-01-01"},
)`,
    response: `{
  "data": [
    {
      "id": "PB-ABC123",
      "status": "paid",
      "total": 187500,
      "shipping_name": "Aïcha K.",
      "created_at": "2026-04-19T08:12:00Z"
    }
  ],
  "count": 42,
  "limit": 100,
  "offset": 0
}`,
  },
  update_order: {
    method: 'PATCH',
    path: '/api/v1/orders/{id}',
    description: 'Met à jour une commande (ex : changer le statut depuis un outil externe).',
    curl: (site: string, key: string) => `curl -X PATCH -H "Authorization: Bearer ${key}" \\\n  -H "Content-Type: application/json" \\\n  "${site}/api/v1/orders/PB-ABC123" \\\n  -d '{ "status": "shipped" }'`,
    js: (site: string, key: string) => `await fetch("${site}/api/v1/orders/PB-ABC123", {
  method: "PATCH",
  headers: {
    "Authorization": "Bearer ${key}",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ status: "shipped" }),
});`,
    python: (site: string, key: string) => `requests.patch(
  "${site}/api/v1/orders/PB-ABC123",
  headers={"Authorization": f"Bearer ${key}"},
  json={"status": "shipped"},
)`,
    response: `{ "id": "PB-ABC123", "status": "shipped", "shipped_at": "2026-04-19T10:30:00Z", ... }`,
  },
  stats: {
    method: 'GET',
    path: '/api/v1/stats',
    description: 'KPI globaux : produits, commandes, CA 24h/30j, abonnés newsletter, avis en attente.',
    curl: (site: string, key: string) => `curl -H "Authorization: Bearer ${key}" "${site}/api/v1/stats"`,
    js: (site: string, key: string) => `const stats = await fetch("${site}/api/v1/stats", {
  headers: { "Authorization": "Bearer ${key}" },
}).then(r => r.json());`,
    python: (site: string, key: string) => `stats = requests.get(
  "${site}/api/v1/stats",
  headers={"Authorization": f"Bearer ${key}"},
).json()`,
    response: `{
  "products": 24,
  "orders": { "total": 157, "pending": 3 },
  "revenue": { "last_24h": 125000, "last_30d": 3420000, "currency": "XOF" },
  "newsletter_subscribers": 892,
  "pending_reviews": 2
}`,
  },
} as const;

type SampleKey = keyof typeof SAMPLES;

export function ApiDocs({ keyPresent, maskedKey, site }: { keyPresent: boolean; maskedKey: string; site: string }) {
  const keyDisplay = keyPresent ? maskedKey : 'TA_CLE_API';
  const [active, setActive] = useState<SampleKey>('list_products');
  const [lang, setLang] = useState<Lang>('curl');
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  const current = SAMPLES[active];
  const code = current[lang](site, keyDisplay);

  return (
    <div>
      <div className="admin-page-head">
        <h1>API Pirabel</h1>
        <p className="mute">REST API complète pour tes produits, commandes et stats. Idéale pour compta, mobile, POS, Zapier, n8n.</p>
      </div>

      {/* ── Key card ── */}
      <div className="admin-card" style={{ background: keyPresent ? 'var(--ivory)' : '#fce8e8' }}>
        <div className="row between wrap gap-3">
          <div>
            <div className="caps mute" style={{ fontSize: 10, marginBottom: 6 }}>Clé API</div>
            {keyPresent ? (
              <div className="mono" style={{ fontSize: 16, fontWeight: 500 }}>{maskedKey}</div>
            ) : (
              <div style={{ color: '#a63d2a' }}>Pas encore configurée</div>
            )}
          </div>
          <div className="caps mute" style={{ fontSize: 10, alignSelf: 'center' }}>
            Base URL · <code className="mono" style={{ fontSize: 13, background: 'var(--ivory-2)', padding: '2px 8px' }}>{site}</code>
          </div>
        </div>
        {keyPresent && (
          <p className="mute mt-4" style={{ fontSize: 12 }}>
            La clé complète est stockée dans <code>ADMIN_API_KEY</code> sur Vercel (chiffrée).
            Pour la rotation, demande-moi « rotate api key » et je régénère + redéploie.
          </p>
        )}
      </div>

      {/* ── Auth ── */}
      <Section n="1" title="Authentification">
        <p>Toute requête vers <code>/api/v1/*</code> doit inclure le header :</p>
        <CodeBlock
          code={`Authorization: Bearer ${keyDisplay}`}
          onCopy={() => copy(`Authorization: Bearer ${keyDisplay}`, 'auth')}
          copied={copied === 'auth'}
        />
        <p className="mute mt-4" style={{ fontSize: 12 }}>
          La clé bypasse les politiques RLS Postgres — traite-la comme un mot de passe de production. Ne jamais la committer dans un repo public.
        </p>
      </Section>

      {/* ── Endpoint browser ── */}
      <Section n="2" title="Endpoints & exemples">
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }} className="grid-form">
          {/* Endpoint picker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {(Object.entries(SAMPLES) as [SampleKey, typeof SAMPLES[SampleKey]][]).map(([k, s]) => (
              <button
                key={k}
                onClick={() => setActive(k)}
                style={{
                  padding: '10px 14px', textAlign: 'left', fontFamily: 'monospace', fontSize: 12,
                  border: '1px solid var(--line)',
                  background: active === k ? 'var(--ink)' : 'var(--ivory)',
                  color: active === k ? 'var(--ivory)' : 'var(--ink)',
                }}
              >
                <span style={{
                  display: 'inline-block', minWidth: 48, fontSize: 10, letterSpacing: '.1em',
                  padding: '2px 6px',
                  background: active === k ? 'rgba(255,255,255,.12)' : methodBg(s.method),
                  color: active === k ? 'var(--ivory)' : methodFg(s.method),
                  marginRight: 8, textAlign: 'center', borderRadius: 2,
                }}>{s.method}</span>
                {s.path}
              </button>
            ))}
          </div>

          {/* Endpoint detail */}
          <div>
            <div className="row gap-2 mb-2">
              <span style={{
                padding: '4px 10px', fontFamily: 'monospace', fontSize: 11, fontWeight: 500,
                letterSpacing: '.08em',
                background: methodBg(current.method), color: methodFg(current.method),
              }}>{current.method}</span>
              <code style={{ fontSize: 14 }}>{current.path}{'query' in current ? current.query : ''}</code>
            </div>
            <p className="mute mb-4" style={{ fontSize: 13 }}>{current.description}</p>

            {/* Language tabs */}
            <div className="row gap-2 mb-0" style={{ borderBottom: '1px solid var(--line)' }}>
              {(['curl', 'js', 'python'] as Lang[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    padding: '8px 14px', fontSize: 12, letterSpacing: '.08em',
                    background: 'transparent',
                    color: lang === l ? 'var(--ink)' : 'var(--ink-mute)',
                    borderBottom: lang === l ? '2px solid var(--ink)' : '2px solid transparent',
                    marginBottom: -1, fontWeight: lang === l ? 500 : 400,
                  }}
                >
                  {l === 'curl' ? 'cURL' : l === 'js' ? 'JavaScript' : 'Python'}
                </button>
              ))}
            </div>

            <CodeBlock
              code={code}
              onCopy={() => copy(code, `req-${active}`)}
              copied={copied === `req-${active}`}
            />

            <div className="caps mute mt-6 mb-2" style={{ fontSize: 10 }}>Réponse — exemple</div>
            <CodeBlock code={current.response} lang="json"/>
          </div>
        </div>
      </Section>

      {/* ── Common responses ── */}
      <Section n="3" title="Codes de retour">
        <table className="admin-table">
          <thead><tr><th>Code</th><th>Signification</th></tr></thead>
          <tbody>
            <tr><td className="mono">200</td><td>Succès</td></tr>
            <tr><td className="mono">201</td><td>Ressource créée</td></tr>
            <tr><td className="mono">400</td><td>Corps JSON invalide ou champ requis manquant</td></tr>
            <tr><td className="mono">401</td><td>Header Authorization manquant ou clé invalide</td></tr>
            <tr><td className="mono">404</td><td>Ressource introuvable</td></tr>
            <tr><td className="mono">500</td><td>Erreur serveur / DB (logs disponibles dans Vercel)</td></tr>
            <tr><td className="mono">503</td><td><code>ADMIN_API_KEY</code> pas configurée côté serveur</td></tr>
          </tbody>
        </table>
      </Section>

      {/* ── Rate limit / SLA ── */}
      <Section n="4" title="Bonnes pratiques">
        <ul style={{ marginLeft: 20, lineHeight: 1.8 }}>
          <li>Pagine les listes (<code>limit</code> max 200, utilise <code>offset</code>)</li>
          <li>Utilise <code>since=ISO-date</code> sur <code>/orders</code> pour ne récupérer que le delta</li>
          <li>Ne polls pas plus d&apos;une fois par minute (pas de rate-limit dur encore, mais sois gentil)</li>
          <li>Si une intégration tierce fuite la clé, demande une rotation immédiate</li>
        </ul>
      </Section>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="admin-card mt-6">
      <div className="row gap-3 mb-4">
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--ink-faint)' }}>{n}</div>
        <h2 className="serif" style={{ fontSize: 22, fontWeight: 400, margin: 0 }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function CodeBlock({ code, onCopy, copied, lang }: { code: string; onCopy?: () => void; copied?: boolean; lang?: string }) {
  return (
    <div style={{ position: 'relative', marginTop: 8 }}>
      <pre style={{
        padding: '16px 20px', background: '#0b0c0d', color: '#dfe3e6',
        fontSize: 13, lineHeight: 1.6, overflow: 'auto',
        fontFamily: 'var(--font-mono), monospace',
        border: '1px solid #1a1d1f', borderRadius: 2,
        margin: 0,
      }}>
        {lang && <span style={{ display: 'block', fontSize: 10, color: '#889096', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>{lang}</span>}
        {code}
      </pre>
      {onCopy && (
        <button
          type="button"
          onClick={onCopy}
          style={{
            position: 'absolute', top: 10, right: 10,
            padding: '4px 10px', fontSize: 11, letterSpacing: '.08em',
            background: copied ? '#0d6534' : 'rgba(255,255,255,0.1)',
            color: '#dfe3e6', border: '1px solid rgba(255,255,255,0.15)',
          }}
        >{copied ? '✓ Copié' : 'Copier'}</button>
      )}
    </div>
  );
}

function methodBg(m: string) {
  return m === 'GET' ? '#e6f0ff' : m === 'POST' ? '#e7f3ea' : m === 'PATCH' ? '#fff4e0' : m === 'DELETE' ? '#fde7e7' : 'var(--ivory-2)';
}
function methodFg(m: string) {
  return m === 'GET' ? '#1c4e8a' : m === 'POST' ? '#0d6534' : m === 'PATCH' ? '#7a4d00' : m === 'DELETE' ? '#8b1f1f' : 'var(--ink)';
}
