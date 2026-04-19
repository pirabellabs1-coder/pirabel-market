'use client';

import Link from 'next/link';
import { Fragment } from 'react';
import { useStore } from '@/components/store-provider';
import { ProductCard } from '@/components/product-card';
import { Icon } from '@/components/icons';
import { RecentlyViewed } from '@/components/recently-viewed';
import { i18n } from '@/lib/i18n';
import type { Product, Category } from '@/lib/types';
import { img } from '@/lib/format';

type Props = { products: Product[]; categories: Category[] };

export function HomeContent({ products, categories }: Props) {
  const { lang } = useStore();
  const t = i18n[lang];
  const featured = products.slice(0, 4);
  const more = products.slice(4, 12);

  return (
    <main>
      <section className="hero">
        <div className="hero-img" style={{ backgroundImage: `url(${img('photo-1490481651871-ab68de25d43d', 2000)})` }}/>
        <div className="hero-marker">
          {t.hero_eyebrow}
          <span className="line-v"/>
        </div>
        <div className="hero-content">
          <h1 dangerouslySetInnerHTML={{ __html: t.hero_title }}/>
          <p className="hero-sub">{t.hero_sub}</p>
          <div className="hero-actions">
            <Link className="btn btn-light" href="/catalogue">{t.discover}</Link>
            <Link className="btn btn-ghost" style={{ color: 'var(--ivory)' }} href="/catalogue">
              {t.collections} <Icon.Arrow/>
            </Link>
          </div>
        </div>
      </section>

      <div className="marquee">
        <div className="marquee-track">
          {Array.from({ length: 6 }).map((_, i) => (
            <Fragment key={i}>
              <span>Souliers</span><span>·</span><span>Lunetterie</span><span>·</span>
              <span>Prêt-à-porter</span><span>·</span><span>Accessoires</span><span>·</span>
              <span>Enfant</span><span>·</span>
            </Fragment>
          ))}
        </div>
      </div>

      {featured.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="section-eyebrow">{lang === 'fr' ? 'La sélection' : 'The selection'}</div>
                <h2 className="section-title">{t.new_arrivals}</h2>
                <p className="mute mt-2" style={{ maxWidth: 480 }}>{t.new_sub}</p>
              </div>
              <Link className="btn btn-ghost" href="/catalogue">{t.see_all} <Icon.Arrow/></Link>
            </div>
            <div className="grid-4">
              {featured.map(p => <ProductCard key={p.id} p={p}/>)}
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="split">
          <div className="split-img">
            <img src={img('photo-1558769132-cb1aea458c5e', 1400)} alt=""/>
          </div>
          <div className="split-text" style={{ background: 'var(--ivory-2)' }}>
            <div className="section-eyebrow">{lang === 'fr' ? 'La Maison' : 'The House'}</div>
            <h2 className="section-title" dangerouslySetInnerHTML={{ __html: t.story_title }}/>
            <p className="mute mt-6" style={{ maxWidth: 460, fontSize: 15, lineHeight: 1.7 }}>{t.story_body}</p>
            <div className="mt-8">
              <Link className="btn btn-outline" href="/propos">{t.read_story}</Link>
            </div>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="section-eyebrow">{lang === 'fr' ? 'Explorer' : 'Explore'}</div>
                <h2 className="section-title">{t.collections}</h2>
              </div>
            </div>
            <div className="grid-3">
              {categories.slice(0, 3).map((c, i) => (
                <Link key={c.id} className="cat-tile" href={`/catalogue/${c.id}`}>
                  <img src={c.img} alt=""/>
                  <div className="cat-tile-content">
                    <div className="cat-num">0{i + 1}</div>
                    <div className="cat-title">{c[lang]}</div>
                    <div className="cat-arrow">{lang === 'fr' ? 'Découvrir' : 'Discover'} <Icon.Arrow s={12}/></div>
                  </div>
                </Link>
              ))}
            </div>
            {categories.length > 3 && (
              <div className="grid-3 mt-6">
                {categories.slice(3, 6).map((c, i) => (
                  <Link key={c.id} className="cat-tile" href={`/catalogue/${c.id}`}>
                    <img src={c.img} alt=""/>
                    <div className="cat-tile-content">
                      <div className="cat-num">0{i + 4}</div>
                      <div className="cat-title">{c[lang]}</div>
                      <div className="cat-arrow">{lang === 'fr' ? 'Découvrir' : 'Discover'} <Icon.Arrow s={12}/></div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {more.length > 0 && (
        <section className="section" style={{ background: 'var(--ivory-2)' }}>
          <div className="container">
            <div className="section-head">
              <div>
                <div className="section-eyebrow">{lang === 'fr' ? 'Ce mois-ci' : 'This month'}</div>
                <h2 className="section-title">{t.featured}</h2>
              </div>
              <Link className="btn btn-ghost" href="/catalogue">{t.see_all} <Icon.Arrow/></Link>
            </div>
            <div className="grid-4">
              {more.map(p => <ProductCard key={p.id} p={p}/>)}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="grid-3">
            {[
              { t: t.svc_delivery, d: t.svc_delivery_sub },
              { t: t.svc_pay, d: t.svc_pay_sub },
              { t: t.svc_care, d: t.svc_care_sub },
            ].map((s, i) => (
              <div key={i} style={{ padding: '0 20px' }}>
                <div className="serif" style={{ fontSize: 22, marginBottom: 12 }}>0{i + 1}.</div>
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>{s.t}</div>
                <p className="mute" style={{ fontSize: 14, lineHeight: 1.6 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recently viewed — visible only to returning visitors */}
      <RecentlyViewed allProducts={products}/>

      <section style={{ background: 'var(--ink)', color: 'var(--ivory)', padding: '100px 0' }}>
        <div className="container-tight" style={{ textAlign: 'center' }}>
          <div className="section-eyebrow" style={{ color: 'rgba(247,243,236,.5)' }}>{lang === 'fr' ? 'Correspondance' : 'Correspondence'}</div>
          <h2 className="serif" style={{ fontSize: 'clamp(32px, 4vw, 52px)', margin: '12px 0 16px', fontWeight: 400 }}>{t.newsletter_title}</h2>
          <p style={{ maxWidth: 520, margin: '0 auto 32px', color: 'rgba(247,243,236,.7)' }}>{t.newsletter_sub}</p>
          <form style={{ display: 'flex', gap: 12, maxWidth: 480, margin: '0 auto', borderBottom: '1px solid rgba(247,243,236,.3)' }} onSubmit={e => e.preventDefault()}>
            <input placeholder={t.email_ph} style={{ flex: 1, background: 'transparent', border: 0, padding: '14px 0', color: 'var(--ivory)', outline: 0, fontSize: 15 }}/>
            <button type="submit" style={{ color: 'var(--ivory)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', padding: '14px 0', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {t.subscribe} <Icon.Arrow/>
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
