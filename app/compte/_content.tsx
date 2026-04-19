'use client';

import Link from 'next/link';
import { useState, useTransition, type FormEvent } from 'react';
import { Icon } from '@/components/icons';
import { ProductCard } from '@/components/product-card';
import { SimplePage } from '@/components/simple-page';
import { useStore } from '@/components/store-provider';
import { fmt } from '@/lib/format';
import { updateProfile } from './actions';

type Tab = 'orders' | 'wish' | 'addr' | 'set';

type Profile = { first_name: string | null; last_name: string | null; phone: string | null; is_admin: boolean };
type OrderRow = { id: string; status: string; total: number; created_at: string };
type ProductRow = any;

const STATUS_LABEL: Record<string, { fr: string; en: string }> = {
  pending:    { fr: 'En attente',    en: 'Pending' },
  paid:       { fr: 'Payée',         en: 'Paid' },
  preparing:  { fr: 'En préparation',en: 'Preparing' },
  shipped:    { fr: 'En route',      en: 'In transit' },
  delivered:  { fr: 'Livrée',        en: 'Delivered' },
  cancelled:  { fr: 'Annulée',       en: 'Cancelled' },
  refunded:   { fr: 'Remboursée',    en: 'Refunded' },
};

export function AccountContent({ initialTab, email, profile, orders, wishProducts }: {
  initialTab: Tab;
  email: string;
  profile: Profile;
  orders: OrderRow[];
  wishProducts: ProductRow[];
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const { lang } = useStore();
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || email;

  const onSaveProfile = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavedMsg(null); setSaveErr(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      try {
        await updateProfile(fd);
        setSavedMsg(lang === 'fr' ? 'Profil enregistré.' : 'Profile saved.');
      } catch (err) { setSaveErr((err as Error).message); }
    });
  };

  return (
    <SimplePage title={lang === 'fr' ? 'Mon compte' : 'My account'} eyebrow={displayName}>
      <div className="row gap-6 mb-8 wrap" style={{ borderBottom: '1px solid var(--line)' }}>
        {([
          { id: 'orders', l: lang === 'fr' ? 'Commandes' : 'Orders' },
          { id: 'wish',   l: lang === 'fr' ? 'Souhaits'  : 'Wishlist' },
          { id: 'addr',   l: lang === 'fr' ? 'Adresses'  : 'Addresses' },
          { id: 'set',    l: lang === 'fr' ? 'Paramètres': 'Settings' },
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

      {profile.is_admin && (
        <div className="row between wrap gap-3 mb-8" style={{ padding: 16, background: 'var(--ivory-2)', border: '1px solid var(--line)' }}>
          <div>
            <div className="caps mute" style={{ fontSize: 10 }}>{lang === 'fr' ? 'Accès admin' : 'Admin access'}</div>
            <div style={{ marginTop: 4 }}>{lang === 'fr' ? 'Gère le catalogue, les commandes et les clients.' : 'Manage catalog, orders and customers.'}</div>
          </div>
          <Link className="btn btn-outline" href="/admin">{lang === 'fr' ? 'Espace admin' : 'Admin panel'} →</Link>
        </div>
      )}

      {tab === 'orders' && (
        orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Icon.Bag s={28}/>
            <p className="mute mt-4">{lang === 'fr' ? 'Aucune commande pour l\'instant.' : 'No orders yet.'}</p>
            <Link className="btn btn-outline mt-6" href="/catalogue">{lang === 'fr' ? 'Découvrir la boutique' : 'Shop the store'}</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map(o => (
              <div key={o.id} className="row between wrap gap-4" style={{ padding: 24, border: '1px solid var(--line)' }}>
                <div>
                  <div className="mono mute" style={{ fontSize: 12 }}>{o.id}</div>
                  <div className="serif mt-2" style={{ fontSize: 17 }}>
                    {new Date(o.created_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <span className="caps">{STATUS_LABEL[o.status]?.[lang] ?? o.status}</span>
                <div className="serif" style={{ fontSize: 20 }}>{fmt(o.total)}</div>
                <Link className="btn btn-outline btn-sm" href={`/suivi?id=${o.id}`}>{lang === 'fr' ? 'Suivre' : 'Track'}</Link>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'wish' && (
        wishProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Icon.Heart s={28}/>
            <p className="mute mt-4">{lang === 'fr' ? "Vous n'avez pas encore de souhaits." : 'No wishlist items yet.'}</p>
          </div>
        ) : (
          <div className="grid-4">
            {wishProducts.map((p: any) => <ProductCard key={p.id} p={{
              id: p.id, category: p.category, collection: p.collection ?? '',
              fr: { name: p.name_fr }, en: { name: p.name_en },
              price: p.price, old: p.old_price ?? undefined,
              img: p.img, img2: p.img2 ?? undefined, tag: p.tag ?? undefined,
              size: p.sizes ?? undefined, color: p.colors ?? undefined,
            }}/>)}
          </div>
        )
      )}

      {tab === 'addr' && (
        <div className="mute" style={{ padding: 40, textAlign: 'center' }}>
          {lang === 'fr' ? 'La gestion multi-adresses arrive bientôt. Pour l\'instant, renseigne ton adresse à la commande.' : 'Multi-address management coming soon. For now, enter your address at checkout.'}
        </div>
      )}

      {tab === 'set' && (
        <form onSubmit={onSaveProfile} className="grid-form" style={{ maxWidth: 560 }}>
          <div className="field"><label>{lang === 'fr' ? 'Prénom' : 'First name'}</label><input name="first_name" className="input" defaultValue={profile.first_name ?? ''}/></div>
          <div className="field"><label>{lang === 'fr' ? 'Nom' : 'Last name'}</label><input name="last_name" className="input" defaultValue={profile.last_name ?? ''}/></div>
          <div className="field span-all"><label>Email</label><input className="input" defaultValue={email} disabled/></div>
          <div className="field span-all"><label>{lang === 'fr' ? 'Téléphone' : 'Phone'}</label><input name="phone" className="input" defaultValue={profile.phone ?? ''} placeholder="+229 01 97 12 34 56"/></div>
          {savedMsg && <p className="span-all mute" style={{ fontSize: 13 }}>{savedMsg}</p>}
          {saveErr && <p className="span-all" style={{ fontSize: 13, color: '#a63d2a' }}>{saveErr}</p>}
          <div className="span-all row gap-3">
            <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? '…' : (lang === 'fr' ? 'Enregistrer' : 'Save')}</button>
            <form action="/api/auth/signout" method="post" style={{ display: 'inline' }}>
              <button type="submit" className="btn btn-ghost">{lang === 'fr' ? 'Se déconnecter' : 'Sign out'}</button>
            </form>
          </div>
        </form>
      )}
    </SimplePage>
  );
}
