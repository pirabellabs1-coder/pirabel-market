'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@/components/icons';
import { ProductCard } from '@/components/product-card';
import { SimplePage } from '@/components/simple-page';
import { useStore } from '@/components/store-provider';
import { products } from '@/lib/products';
import { fmt } from '@/lib/format';

type Tab = 'orders' | 'wish' | 'addr' | 'set';

function AccountContent() {
  const search = useSearchParams();
  const initialTab = (search.get('tab') as Tab) || 'orders';
  const [tab, setTab] = useState<Tab>(initialTab);
  const { lang, wish } = useStore();
  const wishItems = products.filter(p => wish.includes(p.id));

  return (
    <SimplePage title={lang === 'fr' ? 'Mon compte' : 'My account'} eyebrow="Aïcha Koudougou">
      <div className="row gap-6 mb-8 wrap" style={{ borderBottom: '1px solid var(--line)' }}>
        {([
          { id: 'orders', l: lang === 'fr' ? 'Commandes' : 'Orders' },
          { id: 'wish', l: lang === 'fr' ? 'Souhaits' : 'Wishlist' },
          { id: 'addr', l: lang === 'fr' ? 'Adresses' : 'Addresses' },
          { id: 'set', l: lang === 'fr' ? 'Paramètres' : 'Settings' },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '12px 0', fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase',
              color: tab === t.id ? 'var(--ink)' : 'var(--ink-mute)',
              borderBottom: tab === t.id ? '1px solid var(--ink)' : 'none',
              marginBottom: -1,
            }}
          >{t.l}</button>
        ))}
      </div>

      {tab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { id: 'PB-284719', d: '18 avril 2026', s: lang === 'fr' ? 'En route' : 'In transit', t: 147500, n: 3 },
            { id: 'PB-281203', d: '02 avril 2026', s: lang === 'fr' ? 'Livrée' : 'Delivered', t: 285000, n: 2 },
          ].map(o => (
            <div key={o.id} className="row between wrap gap-4" style={{ padding: 24, border: '1px solid var(--line)' }}>
              <div>
                <div className="mono mute" style={{ fontSize: 12 }}>{o.id}</div>
                <div className="serif mt-2" style={{ fontSize: 17 }}>{o.d} · {o.n} {lang === 'fr' ? 'articles' : 'items'}</div>
              </div>
              <span className="caps">{o.s}</span>
              <div className="serif" style={{ fontSize: 20 }}>{fmt(o.t)}</div>
              <Link className="btn btn-outline btn-sm" href="/suivi">{lang === 'fr' ? 'Suivre' : 'Track'}</Link>
            </div>
          ))}
        </div>
      )}

      {tab === 'wish' && (
        wishItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Icon.Heart s={28}/>
            <p className="mute mt-4">{lang === 'fr' ? "Vous n'avez pas encore de souhaits." : 'No wishlist items yet.'}</p>
          </div>
        ) : (
          <div className="grid-4">
            {wishItems.map(p => <ProductCard key={p.id} p={p}/>)}
          </div>
        )
      )}

      {tab === 'addr' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 24, border: '1px solid var(--line)' }}>
            <div className="caps mute mb-2">{lang === 'fr' ? 'Principale' : 'Primary'}</div>
            <div>Cadjehoun, en face de la pharmacie · Cotonou</div>
          </div>
          <button className="btn btn-outline" style={{ alignSelf: 'flex-start' }}>+ {lang === 'fr' ? 'Ajouter' : 'Add'}</button>
        </div>
      )}

      {tab === 'set' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 560 }}>
          <div className="field"><label>{lang === 'fr' ? 'Prénom' : 'First name'}</label><input className="input" defaultValue="Aïcha"/></div>
          <div className="field"><label>{lang === 'fr' ? 'Nom' : 'Last name'}</label><input className="input" defaultValue="Koudougou"/></div>
          <div className="field" style={{ gridColumn: '1/-1' }}><label>Email</label><input className="input" defaultValue="aicha@exemple.com"/></div>
          <div style={{ gridColumn: '1/-1' }}>
            <button className="btn btn-primary">{lang === 'fr' ? 'Enregistrer' : 'Save'}</button>
          </div>
        </div>
      )}
    </SimplePage>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<main className="container" style={{ padding: 80 }}/>}>
      <AccountContent/>
    </Suspense>
  );
}
