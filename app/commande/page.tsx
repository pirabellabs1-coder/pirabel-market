'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { Icon } from '@/components/icons';
import { useStore } from '@/components/store-provider';
import { products } from '@/lib/products';
import { fmt } from '@/lib/format';

type PaymentMethod = 'mtn' | 'moov' | 'celtiis' | 'card' | 'cod';

function CheckoutInner() {
  const router = useRouter();
  const search = useSearchParams();
  const { lang, cart, clearCart } = useStore();
  const [step, setStep] = useState(1);

  // Gift mode: query param ?gift=1 pre-enables, or user toggles in step 1
  const [isGift, setIsGift] = useState(search.get('gift') === '1');
  const [giftMessage, setGiftMessage] = useState('');
  const [giftDeliveryDate, setGiftDeliveryDate] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerName, setBuyerName] = useState('');

  const [info, setInfo] = useState({ name: '', phone: '', email: '', city: 'Cotonou', zone: '', address: '' });
  const [pay, setPay] = useState<PaymentMethod>('mtn');
  const [placing, setPlacing] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const items = useMemo(() => cart
    .map(c => ({ ...c, p: products.find(x => x.id === c.id) }))
    .filter((x): x is typeof x & { p: NonNullable<typeof x.p> } => !!x.p), [cart]);
  const subtotal = items.reduce((s, i) => s + i.p.price * i.qty, 0);

  // Promo state
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState<{ code: string; discount: number; free_shipping: boolean; description?: string } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const applyPromo = async () => {
    setPromoError(null); setPromoLoading(true);
    try {
      const res = await fetch('/api/promo', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code: promoCode, subtotal }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Code invalide');
      setPromoApplied({ code: j.code, discount: j.discount, free_shipping: j.free_shipping, description: j.description });
    } catch (e) { setPromoError((e as Error).message); setPromoApplied(null); }
    finally { setPromoLoading(false); }
  };

  const discount = promoApplied?.discount ?? 0;
  const delivery = promoApplied?.free_shipping ? 0 : (subtotal > 50000 ? 0 : 2500);

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
              {/* Gift toggle */}
              <div
                onClick={() => setIsGift(g => !g)}
                style={{
                  padding: '16px 20px', marginBottom: 24, cursor: 'pointer',
                  background: isGift ? 'var(--ink)' : 'var(--ivory-2)',
                  color: isGift ? 'var(--ivory)' : 'var(--ink)',
                  display: 'flex', gap: 14, alignItems: 'center',
                  border: '1px solid ' + (isGift ? 'var(--ink)' : 'var(--line)'),
                }}
              >
                <div style={{ fontSize: 24 }}>🎁</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 15 }}>
                    {isGift ? (lang === 'fr' ? 'Ceci est un cadeau' : 'This is a gift') : (lang === 'fr' ? 'Offrir ce(s) article(s) ?' : 'Send as a gift?')}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>
                    {isGift
                      ? (lang === 'fr' ? 'Livré directement au destinataire avec un message personnalisé' : 'Shipped directly to the recipient with a personal note')
                      : (lang === 'fr' ? 'Livraison au destinataire + message personnalisé + prix masqués sur le colis' : 'Ship to recipient, with a personal note')}
                  </div>
                </div>
                <div style={{ width: 44, height: 24, borderRadius: 24, background: isGift ? 'var(--gold)' : 'var(--line)', position: 'relative', transition: 'background .2s' }}>
                  <div style={{ position: 'absolute', top: 2, left: isGift ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left .2s' }}/>
                </div>
              </div>

              <h3 className="serif" style={{ fontSize: 20, fontWeight: 400, marginBottom: 16 }}>
                {isGift ? (lang === 'fr' ? 'Destinataire du cadeau' : 'Gift recipient') : (lang === 'fr' ? 'Informations de livraison' : 'Shipping info')}
              </h3>
              <div className="grid-form">
                <div className="field"><label>{isGift ? (lang === 'fr' ? 'Nom du destinataire *' : 'Recipient name *') : (lang === 'fr' ? 'Nom complet *' : 'Full name *')}</label>
                  <input className="input" value={info.name} onChange={e => setInfo({ ...info, name: e.target.value })}/>
                </div>
                <div className="field"><label>{isGift ? (lang === 'fr' ? 'Téléphone du destinataire *' : 'Recipient phone *') : (lang === 'fr' ? 'Téléphone *' : 'Phone *')}</label>
                  <input className="input" value={info.phone} onChange={e => setInfo({ ...info, phone: e.target.value })} placeholder="+229 01 49 44 67 20"/>
                </div>
                <div className="field span-all"><label>{isGift ? (lang === 'fr' ? 'Email du destinataire (optionnel, pour la notification cadeau)' : 'Recipient email (optional, for gift notification)') : 'Email'}</label>
                  <input className="input" type="email" value={info.email} onChange={e => setInfo({ ...info, email: e.target.value })}/>
                </div>
                <div className="field"><label>{lang === 'fr' ? 'Ville *' : 'City *'}</label>
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

              {/* Gift-only fields */}
              {isGift && (
                <>
                  <h3 className="serif mt-8" style={{ fontSize: 20, fontWeight: 400, marginBottom: 16 }}>
                    {lang === 'fr' ? 'Votre message' : 'Your message'}
                  </h3>
                  <div className="grid-form">
                    <div className="field span-all">
                      <label>{lang === 'fr' ? 'Mot pour accompagner le cadeau (optionnel)' : 'Note to include with the gift (optional)'}</label>
                      <textarea
                        className="textarea" rows={4} maxLength={500}
                        value={giftMessage} onChange={e => setGiftMessage(e.target.value)}
                        placeholder={lang === 'fr' ? 'Bon anniversaire ! J\'ai pensé à toi en voyant cette pièce…' : 'Happy birthday! I thought of you when I saw this…'}
                        style={{ resize: 'vertical' }}
                      />
                      <p className="mute mt-2" style={{ fontSize: 11 }}>
                        {giftMessage.length}/500 — {lang === 'fr' ? 'Imprimé sur une carte glissée dans l\'emballage + envoyé par email au destinataire' : 'Printed on a card with the package + emailed to recipient'}
                      </p>
                    </div>
                    <div className="field">
                      <label>{lang === 'fr' ? 'Date de livraison souhaitée' : 'Desired delivery date'}</label>
                      <input className="input" type="date" value={giftDeliveryDate} onChange={e => setGiftDeliveryDate(e.target.value)} min={new Date().toISOString().slice(0, 10)}/>
                    </div>
                  </div>

                  <h3 className="serif mt-8" style={{ fontSize: 20, fontWeight: 400, marginBottom: 16 }}>
                    {lang === 'fr' ? 'Vos informations (acheteur)' : 'Your information (buyer)'}
                  </h3>
                  <div className="grid-form">
                    <div className="field"><label>{lang === 'fr' ? 'Votre nom' : 'Your name'}</label>
                      <input className="input" value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder={lang === 'fr' ? 'Apparaît sur le message « De la part de … »' : 'Shown as "From ..." on the gift note'}/>
                    </div>
                    <div className="field"><label>{lang === 'fr' ? 'Votre email (pour le reçu) *' : 'Your email (for the receipt) *'}</label>
                      <input className="input" type="email" required value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)}/>
                    </div>
                  </div>
                </>
              )}
              <div className="mt-8">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => {
                    const billingEmail = isGift ? buyerEmail : info.email;
                    if (billingEmail && cart.length > 0) {
                      const payload = {
                        email: billingEmail,
                        cart_items: cart.map(c => {
                          const p = products.find(x => x.id === c.id);
                          return p ? { id: c.id, name: p[lang].name, qty: c.qty, img: p.img, price: p.price } : null;
                        }).filter(Boolean),
                        subtotal,
                      };
                      fetch('/api/abandoned-cart', {
                        method: 'POST', headers: { 'content-type': 'application/json' },
                        body: JSON.stringify(payload), keepalive: true,
                      }).catch(() => {});
                    }
                    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
                    if (w.gtag) {
                      w.gtag('event', 'begin_checkout', {
                        currency: 'XOF', value: subtotal,
                        items: cart.map(c => ({ item_id: c.id, quantity: c.qty })),
                      });
                    }
                    setStep(2);
                  }}
                  disabled={!info.name || !info.phone || (isGift && !buyerEmail)}
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
              {isGift && (
                <div className="mb-6" style={{ padding: 20, background: 'var(--ink)', color: 'var(--ivory)' }}>
                  <div style={{ fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 8 }}>🎁 Commande cadeau</div>
                  <div>Livré à <strong>{info.name}</strong> · de la part de <strong>{buyerName || 'vous'}</strong></div>
                  {giftMessage && <div style={{ marginTop: 10, fontStyle: 'italic', opacity: 0.85, fontSize: 13 }}>« {giftMessage} »</div>}
                  {giftDeliveryDate && <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>Date souhaitée : {new Date(giftDeliveryDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>}
                </div>
              )}
              <div className="mb-6" style={{ padding: 20, border: '1px solid var(--line)' }}>
                <div className="caps mute mb-2">{isGift ? (lang === 'fr' ? 'Destinataire' : 'Recipient') : (lang === 'fr' ? 'Livraison' : 'Shipping')}</div>
                <div>{info.name} · {info.phone}</div>
                <div className="mute" style={{ fontSize: 13 }}>{info.zone}, {info.city}</div>
              </div>
              <div style={{ padding: 20, border: '1px solid var(--line)' }}>
                <div className="caps mute mb-2">{lang === 'fr' ? 'Paiement' : 'Payment'}</div>
                <div>{payLabel(pay)}</div>
              </div>
              {error && <p style={{ color: '#a63d2a', fontSize: 13, marginTop: 16 }}>{error}</p>}
              <div className="mt-8 row gap-3">
                <button className="btn btn-ghost" onClick={() => setStep(2)} disabled={placing}>← {lang === 'fr' ? 'Retour' : 'Back'}</button>
                <button
                  className="btn btn-primary btn-lg"
                  disabled={placing}
                  onClick={async () => {
                    setPlacing(true); setError(null);
                    try {
                      const res = await fetch('/api/orders', {
                        method: 'POST',
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify({
                          items: cart.map(c => ({ id: c.id, qty: c.qty, size: c.size, color: c.color })),
                          payment_method: pay,
                          promo_code: promoApplied?.code,
                          shipping: { name: info.name, phone: info.phone, email: info.email || undefined, city: info.city, zone: info.zone, address: info.address },
                          is_gift: isGift,
                          gift_message: isGift ? (giftMessage || undefined) : undefined,
                          gift_delivery_date: isGift && giftDeliveryDate ? giftDeliveryDate : undefined,
                          buyer_email: isGift ? buyerEmail : undefined,
                          buyer_name: isGift ? (buyerName || undefined) : undefined,
                        }),
                      });
                      if (!res.ok) {
                        const e = await res.json().catch(() => ({ error: 'Erreur serveur' }));
                        throw new Error(e.error || 'Erreur serveur');
                      }
                      const data = await res.json();
                      // Mark abandoned-cart recovered so cron doesn't re-email
                      if (info.email) {
                        fetch('/api/abandoned-cart/recover', {
                          method: 'POST', headers: { 'content-type': 'application/json' },
                          body: JSON.stringify({ email: info.email }), keepalive: true,
                        }).catch(() => {});
                      }
                      // GA4 purchase
                      const w = window as unknown as { gtag?: (...args: unknown[]) => void };
                      if (w.gtag) {
                        w.gtag('event', 'purchase', {
                          transaction_id: data.id,
                          currency: 'XOF', value: data.total,
                          items: cart.map(c => ({ item_id: c.id, quantity: c.qty })),
                        });
                      }
                      clearCart();
                      setPlacedOrderId(data.id);
                      setStep(4);
                    } catch (e) {
                      setError((e as Error).message);
                    } finally {
                      setPlacing(false);
                    }
                  }}
                >
                  {placing
                    ? (lang === 'fr' ? 'Enregistrement…' : 'Placing…')
                    : `${lang === 'fr' ? 'Payer' : 'Pay'} ${fmt(Math.max(0, subtotal + delivery - discount))}`}
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
              {placedOrderId && <div className="mono mute mt-4">№ {placedOrderId}</div>}
              <div className="mt-8 row gap-3" style={{ justifyContent: 'center' }}>
                <Link className="btn btn-primary" href={placedOrderId ? `/suivi?id=${placedOrderId}` : '/suivi'}>
                  {lang === 'fr' ? 'Suivre la commande' : 'Track order'}
                </Link>
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
                {/* Promo code input */}
                {!promoApplied ? (
                  <div className="row gap-2 mb-4">
                    <input
                      className="input"
                      style={{ flex: 1, fontFamily: 'monospace' }}
                      placeholder={lang === 'fr' ? 'Code promo' : 'Promo code'}
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value.toUpperCase())}
                    />
                    <button type="button" className="btn btn-outline btn-sm" onClick={applyPromo} disabled={!promoCode.trim() || promoLoading}>
                      {promoLoading ? '…' : (lang === 'fr' ? 'Appliquer' : 'Apply')}
                    </button>
                  </div>
                ) : (
                  <div className="row between mb-4" style={{ padding: 10, background: 'var(--ivory)', border: '1px solid var(--line)' }}>
                    <div>
                      <div className="mono" style={{ fontSize: 12 }}>{promoApplied.code}</div>
                      <div className="mute" style={{ fontSize: 11 }}>{promoApplied.description || (promoApplied.free_shipping ? 'Livraison offerte' : `−${fmt(promoApplied.discount)}`)}</div>
                    </div>
                    <button type="button" onClick={() => { setPromoApplied(null); setPromoCode(''); }} className="mute" style={{ fontSize: 12 }}>✕</button>
                  </div>
                )}
                {promoError && <p style={{ color: '#a63d2a', fontSize: 12, marginBottom: 12 }}>{promoError}</p>}

                <div className="row between mb-2">
                  <span className="mute" style={{ fontSize: 13 }}>{lang === 'fr' ? 'Sous-total' : 'Subtotal'}</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="row between mb-2">
                    <span className="mute" style={{ fontSize: 13, color: 'var(--gold)' }}>{lang === 'fr' ? 'Remise' : 'Discount'}</span>
                    <span style={{ color: 'var(--gold)' }}>−{fmt(discount)}</span>
                  </div>
                )}
                <div className="row between mb-4">
                  <span className="mute" style={{ fontSize: 13 }}>{lang === 'fr' ? 'Livraison' : 'Shipping'}</span>
                  <span>{delivery === 0 ? (lang === 'fr' ? 'Offerte' : 'Free') : fmt(delivery)}</span>
                </div>
                <div className="row between" style={{ paddingTop: 16, borderTop: '1px solid var(--line)' }}>
                  <span className="caps">{lang === 'fr' ? 'Total' : 'Total'}</span>
                  <span className="serif" style={{ fontSize: 22 }}>{fmt(Math.max(0, subtotal + delivery - discount))}</span>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<main className="container" style={{ padding: 80 }}/>}>
      <CheckoutInner/>
    </Suspense>
  );
}
