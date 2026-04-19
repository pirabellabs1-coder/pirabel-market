'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Icon } from '@/components/icons';
import { useStore } from '@/components/store-provider';
import { products } from '@/lib/products';
import { fmt } from '@/lib/format';

type PaymentMethod = 'mtn' | 'moov' | 'celtiis' | 'card' | 'cod';

export default function CheckoutPage() {
  const router = useRouter();
  const { lang, cart, clearCart } = useStore();
  const [step, setStep] = useState(1);
  const [info, setInfo] = useState({ name: '', phone: '', email: '', city: 'Cotonou', zone: '', address: '' });
  const [pay, setPay] = useState<PaymentMethod>('mtn');

  const items = useMemo(() => cart
    .map(c => ({ ...c, p: products.find(x => x.id === c.id) }))
    .filter((x): x is typeof x & { p: NonNullable<typeof x.p> } => !!x.p), [cart]);
  const subtotal = items.reduce((s, i) => s + i.p.price * i.qty, 0);
  const delivery = subtotal > 50000 ? 0 : 2500;

  if (items.length === 0 && step < 4) {
    return (
      <main className="container" style={{ padding: '120px 40px', textAlign: 'center' }}>
        <h1 className="serif" style={{ fontSize: 32 }}>{lang === 'fr' ? 'Votre sac est vide' : 'Your bag is empty'}</h1>
        <Link className="btn btn-outline mt-8" href="/catalogue">{lang === 'fr' ? 'Découvrir' : 'Discover'}</Link>
      </main>
    );
  }

  const payLabel = (m: PaymentMethod) =>
    m === 'mtn' ? 'MTN MoMo' :
    m === 'moov' ? 'Moov' :
    m === 'celtiis' ? 'Celtiis' :
    m === 'card' ? (lang === 'fr' ? 'Carte' : 'Card') :
    (lang === 'fr' ? 'À la livraison' : 'On delivery');

  return (
    <main className="container-tight" style={{ padding: '48px 40px 80px' }}>
      <div className="section-eyebrow">{lang === 'fr' ? 'Commande' : 'Checkout'}</div>
      <h1 className="serif" style={{ fontSize: 40, fontWeight: 400, marginBottom: 32 }}>
        {step === 4
          ? (lang === 'fr' ? 'Merci.' : 'Thank you.')
          : (lang === 'fr' ? 'Finalisez votre commande' : 'Complete your order')}
      </h1>

      {step < 4 && (
        <div className="stepper">
          <span className={`step ${step >= 1 ? (step > 1 ? 'done' : 'active') : ''}`}>01 · {lang === 'fr' ? 'Livraison' : 'Shipping'}</span>
          <span className="sep"/>
          <span className={`step ${step >= 2 ? (step > 2 ? 'done' : 'active') : ''}`}>02 · {lang === 'fr' ? 'Paiement' : 'Payment'}</span>
          <span className="sep"/>
          <span className={`step ${step >= 3 ? 'active' : ''}`}>03 · {lang === 'fr' ? 'Confirmation' : 'Review'}</span>
        </div>
      )}

      <div
        className="checkout-grid"
        style={{ display: 'grid', gridTemplateColumns: step < 4 ? '1.4fr 1fr' : '1fr', gap: 64 }}
      >
        <div>
          {step === 1 && (
            <div>
              <div className="grid-form">
                <div className="field"><label>{lang === 'fr' ? 'Nom complet' : 'Full name'}</label>
                  <input className="input" value={info.name} onChange={e => setInfo({ ...info, name: e.target.value })}/>
                </div>
                <div className="field"><label>{lang === 'fr' ? 'Téléphone' : 'Phone'}</label>
                  <input className="input" value={info.phone} onChange={e => setInfo({ ...info, phone: e.target.value })} placeholder="+229 01 97 12 34 56"/>
                </div>
                <div className="field span-all"><label>Email</label>
                  <input className="input" type="email" value={info.email} onChange={e => setInfo({ ...info, email: e.target.value })}/>
                </div>
                <div className="field"><label>{lang === 'fr' ? 'Ville' : 'City'}</label>
                  <select className="select" value={info.city} onChange={e => setInfo({ ...info, city: e.target.value })}>
                    <option>Cotonou</option><option>Porto-Novo</option><option>Parakou</option><option>Abomey-Calavi</option><option>Ouidah</option>
                  </select>
                </div>
                <div className="field"><label>{lang === 'fr' ? 'Quartier' : 'District'}</label>
                  <input className="input" value={info.zone} onChange={e => setInfo({ ...info, zone: e.target.value })}/>
                </div>
                <div className="field span-all"><label>{lang === 'fr' ? 'Adresse / repère' : 'Address / landmark'}</label>
                  <input className="input" value={info.address} onChange={e => setInfo({ ...info, address: e.target.value })}/>
                </div>
              </div>
              <div className="mt-8">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => setStep(2)}
                  disabled={!info.name || !info.phone}
                >
                  {lang === 'fr' ? 'Continuer' : 'Continue'}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {([
                  { id: 'mtn', n: 'MTN Mobile Money' },
                  { id: 'moov', n: 'Moov Money' },
                  { id: 'celtiis', n: 'Celtiis Cash' },
                  { id: 'card', n: lang === 'fr' ? 'Carte bancaire' : 'Credit card' },
                  { id: 'cod', n: lang === 'fr' ? 'Paiement à la livraison' : 'Cash on delivery' },
                ] as const).map(m => (
                  <label key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 20, border: pay === m.id ? '1px solid var(--ink)' : '1px solid var(--line)', cursor: 'pointer' }}>
                    <div className="row gap-3">
                      <input type="radio" name="pay" checked={pay === m.id} onChange={() => setPay(m.id)}/>
                      <span style={{ fontSize: 14 }}>{m.n}</span>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-8 row gap-3">
                <button className="btn btn-ghost" onClick={() => setStep(1)}>← {lang === 'fr' ? 'Retour' : 'Back'}</button>
                <button className="btn btn-primary btn-lg" onClick={() => setStep(3)}>{lang === 'fr' ? 'Continuer' : 'Continue'}</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="mb-6" style={{ padding: 20, border: '1px solid var(--line)' }}>
                <div className="caps mute mb-2">{lang === 'fr' ? 'Livraison' : 'Shipping'}</div>
                <div>{info.name} · {info.phone}</div>
                <div className="mute" style={{ fontSize: 13 }}>{info.zone}, {info.city}</div>
              </div>
              <div style={{ padding: 20, border: '1px solid var(--line)' }}>
                <div className="caps mute mb-2">{lang === 'fr' ? 'Paiement' : 'Payment'}</div>
                <div>{payLabel(pay)}</div>
              </div>
              <div className="mt-8 row gap-3">
                <button className="btn btn-ghost" onClick={() => setStep(2)}>← {lang === 'fr' ? 'Retour' : 'Back'}</button>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => { clearCart(); setStep(4); }}
                >
                  {lang === 'fr' ? 'Payer' : 'Pay'} {fmt(subtotal + delivery)}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ width: 64, height: 64, border: '1px solid var(--line)', borderRadius: 999, display: 'grid', placeItems: 'center', margin: '0 auto 24px' }}>
                <Icon.Check s={24}/>
              </div>
              <p className="serif" style={{ fontSize: 22, fontWeight: 400, lineHeight: 1.5, maxWidth: 520, margin: '0 auto 16px' }}>
                {lang === 'fr'
                  ? 'Votre commande est confirmée. Un message de confirmation vous a été envoyé.'
                  : 'Your order is confirmed. A confirmation message has been sent.'}
              </p>
              <div className="mono mute mt-4">№ PB-{Date.now().toString().slice(-6)}</div>
              <div className="mt-8 row gap-3" style={{ justifyContent: 'center' }}>
                <Link className="btn btn-primary" href="/suivi">{lang === 'fr' ? 'Suivre la commande' : 'Track order'}</Link>
                <Link className="btn btn-outline" href="/">{lang === 'fr' ? "Retour à l'accueil" : 'Back to home'}</Link>
              </div>
            </div>
          )}
        </div>

        {step < 4 && (
          <aside>
            <div style={{ padding: 28, background: 'var(--ivory-2)', position: 'sticky', top: 120 }}>
              <div className="caps mb-6">{lang === 'fr' ? 'Récapitulatif' : 'Summary'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                {items.map(it => (
                  <div key={it.id + (it.size ?? '')} className="row gap-3">
                    <div style={{ width: 56, aspectRatio: '4/5', overflow: 'hidden' }}>
                      <img src={it.p.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="serif" style={{ fontSize: 14 }}>{it.p[lang].name}</div>
                      <div className="mute" style={{ fontSize: 11 }}>× {it.qty}</div>
                    </div>
                    <div style={{ fontSize: 13 }}>{fmt(it.p.price * it.qty)}</div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}>
                <div className="row between mb-2">
                  <span className="mute" style={{ fontSize: 13 }}>{lang === 'fr' ? 'Sous-total' : 'Subtotal'}</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <div className="row between mb-4">
                  <span className="mute" style={{ fontSize: 13 }}>{lang === 'fr' ? 'Livraison' : 'Shipping'}</span>
                  <span>{delivery === 0 ? (lang === 'fr' ? 'Offerte' : 'Free') : fmt(delivery)}</span>
                </div>
                <div className="row between" style={{ paddingTop: 16, borderTop: '1px solid var(--line)' }}>
                  <span className="caps">{lang === 'fr' ? 'Total' : 'Total'}</span>
                  <span className="serif" style={{ fontSize: 22 }}>{fmt(subtotal + delivery)}</span>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </main>
  );
}
