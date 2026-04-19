'use client';

import { useRouter } from 'next/navigation';
import { Icon } from './icons';
import { useStore } from './store-provider';
import { products } from '@/lib/products';
import { fmt } from '@/lib/format';

export function CartDrawer() {
  const router = useRouter();
  const { bagOpen, closeBag, cart, removeFromCart, setQty, cartSubtotal, lang } = useStore();

  if (!bagOpen) return null;

  const items = cart
    .map(c => ({ ...c, p: products.find(x => x.id === c.id) }))
    .filter((x): x is typeof x & { p: NonNullable<typeof x.p> } => !!x.p);

  const onCheckout = () => {
    closeBag();
    router.push('/commande');
  };

  return (
    <>
      <div className="drawer-backdrop" onClick={closeBag}/>
      <aside className="drawer" role="dialog" aria-label={lang === 'fr' ? 'Votre sac' : 'Your bag'}>
        <div className="drawer-head">
          <div className="drawer-title">
            {lang === 'fr' ? 'Votre sac' : 'Your bag'}{' '}
            {items.length > 0 && <span className="mute" style={{ fontSize: 14 }}>({items.length})</span>}
          </div>
          <button onClick={closeBag} aria-label="Fermer"><Icon.X/></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <Icon.Bag s={32}/>
              <p className="mute mt-4">{lang === 'fr' ? 'Votre sac est vide' : 'Your bag is empty'}</p>
            </div>
          ) : items.map(it => (
            <div key={it.id + (it.size ?? '') + (it.color ?? '')} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 16, paddingBottom: 20, marginBottom: 20, borderBottom: '1px solid var(--line)' }}>
              <div style={{ aspectRatio: '4/5', overflow: 'hidden' }}>
                <img src={it.p.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/>
              </div>
              <div>
                <div className="serif" style={{ fontSize: 15 }}>{it.p[lang].name}</div>
                <div className="mute" style={{ fontSize: 12, marginTop: 4 }}>{it.p.collection}</div>
                <div className="row gap-2 mt-4" style={{ border: '1px solid var(--line)', display: 'inline-flex' }}>
                  <button onClick={() => setQty(it.id, it.qty - 1)} style={{ width: 28, height: 28 }} aria-label="−"><Icon.Minus s={10}/></button>
                  <span style={{ fontSize: 12, minWidth: 20, textAlign: 'center' }}>{it.qty}</span>
                  <button onClick={() => setQty(it.id, it.qty + 1)} style={{ width: 28, height: 28 }} aria-label="+"><Icon.Plus s={10}/></button>
                </div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <button onClick={() => removeFromCart(it.id)} style={{ color: 'var(--ink-mute)' }} aria-label="Retirer"><Icon.X s={14}/></button>
                <div className="serif" style={{ fontSize: 15 }}>{fmt(it.p.price * it.qty)}</div>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div style={{ padding: 28, borderTop: '1px solid var(--line)' }}>
            <div className="row between mb-4">
              <span className="caps mute">{lang === 'fr' ? 'Sous-total' : 'Subtotal'}</span>
              <span className="serif" style={{ fontSize: 22 }}>{fmt(cartSubtotal)}</span>
            </div>
            <p className="mute" style={{ fontSize: 11, marginBottom: 16 }}>
              {lang === 'fr' ? 'Livraison et taxes calculées à la commande.' : 'Shipping and taxes calculated at checkout.'}
            </p>
            <button className="btn btn-primary btn-block btn-lg" onClick={onCheckout}>
              {lang === 'fr' ? 'Passer la commande' : 'Checkout'}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
