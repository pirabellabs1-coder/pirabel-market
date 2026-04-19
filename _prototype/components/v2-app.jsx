// Pirabel v2 — single-file app with editorial luxe aesthetic

const Icon = {
  Search: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3" strokeLinecap="round"/></svg>,
  Bag: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 8h12l-1 12H7zM9 8V6a3 3 0 0 1 6 0v2" strokeLinejoin="round" strokeLinecap="round"/></svg>,
  Heart: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="M19 14c1.5-1.5 2-3.5 2-5.5C21 5 18.5 3 16 3c-1.8 0-3.5 1-4 2.5C11.5 4 9.8 3 8 3 5.5 3 3 5 3 8.5c0 2 .5 4 2 5.5l7 7z"/></svg>,
  User: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6" strokeLinecap="round"/></svg>,
  Arrow: ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M5 12h14m-6-7 7 7-7 7"/></svg>,
  X: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 6 18 18M18 6 6 18"/></svg>,
  Plus: ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  Minus: ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M5 12h14"/></svg>,
  Check: ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>,
  Whats: ({s=20}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.15-1.7-.85-2-.95-.3-.1-.5-.15-.7.15s-.8.95-1 1.15c-.2.2-.35.2-.65.05a8 8 0 0 1-4-3.5c-.3-.5.3-.5.9-1.6.1-.2.05-.35 0-.5l-1-2.4c-.25-.55-.5-.5-.7-.5h-.6a1.1 1.1 0 0 0-.8.4c-.3.3-1.05 1-1.05 2.5s1.1 2.9 1.25 3.1c.15.2 2.15 3.3 5.25 4.6 1.95.8 2.7.9 3.7.75.6-.1 1.7-.7 2-1.4.25-.7.25-1.3.15-1.4-.1-.1-.3-.15-.6-.3zM12 2a10 10 0 0 0-8.6 15l-1.4 5 5.2-1.4A10 10 0 1 0 12 2z"/></svg>,
};

function ProductCard({ p, lang, onOpen, onWish, wished, onAdd }) {
  const [hovered, setHovered] = React.useState(false);
  const discount = p.old ? Math.round((1 - p.price/p.old)*100) : 0;
  return (
    <div className="pcard" onClick={() => onOpen(p.id)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="pcard-img">
        {p.tag && <span className="pcard-label">{p.tag}</span>}
        {discount > 0 && <span className="pcard-label" style={{top: p.tag ? 36 : 12}}>−{discount}%</span>}
        <button className={`pcard-wish ${wished ? 'active' : ''}`} onClick={e => { e.stopPropagation(); onWish(p.id); }}><Icon.Heart/></button>
        <img src={hovered && p.img2 ? p.img2 : p.img} alt={p[lang].name}/>
        <div className="pcard-quick" onClick={e => { e.stopPropagation(); onAdd(p.id); }}>
          + {lang === 'fr' ? 'Ajouter au sac' : 'Add to bag'}
        </div>
      </div>
      <div className="pcard-cat">{p.collection}</div>
      <div className="pcard-name">{p[lang].name}</div>
      <div className="pcard-price">
        <span>{PirabelV2.fmt(p.price)}</span>
        {p.old && <span className="old">{PirabelV2.fmt(p.old)}</span>}
      </div>
    </div>
  );
}

function Header({ lang, onNav, page, cartCount, wishCount, onBag, onLang }) {
  const t = PirabelV2.i18n[lang];
  return (
    <>
      <div className="announce">{t.announce}</div>
      <header className="header">
        <div className="container header-row">
          <nav className="header-nav">
            <a className={`header-link ${page === 'women' ? 'active' : ''}`} onClick={e => { e.preventDefault(); onNav('catalog', {category: 'women'}); }} href="#">{t.nav.women}</a>
            <a className={`header-link ${page === 'men' ? 'active' : ''}`} onClick={e => { e.preventDefault(); onNav('catalog', {category: 'men'}); }} href="#">{t.nav.men}</a>
            <a className="header-link" onClick={e => { e.preventDefault(); onNav('catalog', {category: 'eyewear'}); }} href="#">{t.nav.eyewear}</a>
            <a className="header-link" onClick={e => { e.preventDefault(); onNav('catalog', {category: 'accessories'}); }} href="#">{t.nav.accessories}</a>
            <a className="header-link" onClick={e => { e.preventDefault(); onNav('journal'); }} href="#">{t.nav.journal}</a>
          </nav>
          <a className="brand" onClick={e => { e.preventDefault(); onNav('home'); }} href="#">
            Pirabel
            <span className="brand-sub">Cotonou · Est. 2026</span>
          </a>
          <div className="header-actions">
            <button className="head-btn" onClick={onLang}>{lang.toUpperCase()}</button>
            <button className="head-btn"><Icon.Search/></button>
            <button className="head-btn" onClick={() => onNav('account')}><Icon.User/></button>
            <button className="head-btn" onClick={() => onNav('account')}>
              <Icon.Heart/>{wishCount > 0 && <span className="count">{wishCount}</span>}
            </button>
            <button className="head-btn" onClick={onBag}>
              <Icon.Bag/>{cartCount > 0 && <span className="count">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

function Footer({ lang, onNav }) {
  const t = PirabelV2.i18n[lang];
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">Pirabel</div>
            <p style={{ maxWidth: 340, color: 'rgba(247,243,236,.6)', fontSize: 13, lineHeight: 1.6, marginTop: 16 }}>{t.footer_about}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 28 }}>
              {['MTN MoMo', 'Moov', 'Celtiis', 'Visa', 'Cash'].map(x => (
                <span key={x} style={{ padding: '6px 10px', border: '1px solid rgba(247,243,236,.2)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase' }}>{x}</span>
              ))}
            </div>
          </div>
          <div>
            <h5>{lang === 'fr' ? 'Maison' : 'House'}</h5>
            <ul>
              <li><a href="#" onClick={e => { e.preventDefault(); onNav('about'); }}>{lang === 'fr' ? 'Notre histoire' : 'Our story'}</a></li>
              <li><a href="#">{lang === 'fr' ? 'Savoir-faire' : 'Craft'}</a></li>
              <li><a href="#" onClick={e => { e.preventDefault(); onNav('journal'); }}>{lang === 'fr' ? 'Le Journal' : 'Journal'}</a></li>
              <li><a href="#">{lang === 'fr' ? 'Carrières' : 'Careers'}</a></li>
            </ul>
          </div>
          <div>
            <h5>{lang === 'fr' ? 'Service' : 'Service'}</h5>
            <ul>
              <li><a href="#" onClick={e => { e.preventDefault(); onNav('contact'); }}>{lang === 'fr' ? 'Contact' : 'Contact'}</a></li>
              <li><a href="#" onClick={e => { e.preventDefault(); onNav('track'); }}>{lang === 'fr' ? 'Suivi de commande' : 'Track order'}</a></li>
              <li><a href="#">{lang === 'fr' ? 'Livraison' : 'Shipping'}</a></li>
              <li><a href="#">{lang === 'fr' ? 'Retours' : 'Returns'}</a></li>
            </ul>
          </div>
          <div>
            <h5>{lang === 'fr' ? 'Boutique' : 'Boutique'}</h5>
            <ul>
              <li>Haie Vive, Cotonou</li>
              <li>+229 01 97 12 34 56</li>
              <li>contact@pirabel.bj</li>
              <li style={{ marginTop: 8 }}><a href="#">WhatsApp</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bot">
          <div>© 2026 Pirabel Maison · Cotonou, Bénin</div>
          <div style={{ display: 'flex', gap: 24 }}>
            <a href="#">{lang === 'fr' ? 'Conditions' : 'Terms'}</a>
            <a href="#">{lang === 'fr' ? 'Confidentialité' : 'Privacy'}</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Home({ lang, onNav, onAdd, onWish, wish, onOpen }) {
  const t = PirabelV2.i18n[lang];
  const featured = PirabelV2.products.slice(0, 4);
  const more = PirabelV2.products.slice(4, 12);

  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="hero-img" style={{ backgroundImage: `url(${PirabelV2.img('photo-1490481651871-ab68de25d43d', 2000)})` }}/>
        <div className="hero-marker">
          {t.hero_eyebrow}
          <span className="line-v"/>
        </div>
        <div className="hero-content">
          <h1 dangerouslySetInnerHTML={{__html: t.hero_title}}/>
          <p className="hero-sub">{t.hero_sub}</p>
          <div className="hero-actions">
            <button className="btn btn-light" onClick={() => onNav('catalog')}>{t.discover}</button>
            <button className="btn btn-ghost" style={{ color: 'var(--ivory)' }} onClick={() => onNav('catalog')}>
              {t.collections} <Icon.Arrow/>
            </button>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee">
        <div className="marquee-track">
          {Array.from({length: 6}).map((_, i) => (
            <React.Fragment key={i}>
              <span>Souliers</span><span>·</span><span>Lunetterie</span><span>·</span>
              <span>Prêt-à-porter</span><span>·</span><span>Accessoires</span><span>·</span>
              <span>Enfant</span><span>·</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* NEW ARRIVALS */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-eyebrow">{lang === 'fr' ? 'La sélection' : 'The selection'}</div>
              <h2 className="section-title">{t.new_arrivals}</h2>
              <p className="mute mt-2" style={{ maxWidth: 480 }}>{t.new_sub}</p>
            </div>
            <button className="btn btn-ghost" onClick={() => onNav('catalog')}>{t.see_all} <Icon.Arrow/></button>
          </div>
          <div className="grid-4">
            {featured.map(p => <ProductCard key={p.id} p={p} lang={lang} onOpen={onOpen} onWish={onWish} wished={wish.includes(p.id)} onAdd={onAdd}/>)}
          </div>
        </div>
      </section>

      {/* EDITORIAL SPLIT */}
      <section>
        <div className="split">
          <div className="split-img">
            <img src={PirabelV2.img('photo-1558769132-cb1aea458c5e', 1400)} alt=""/>
          </div>
          <div className="split-text" style={{ background: 'var(--ivory-2)' }}>
            <div className="section-eyebrow">{lang === 'fr' ? 'La Maison' : 'The House'}</div>
            <h2 className="section-title" dangerouslySetInnerHTML={{__html: t.story_title}}/>
            <p className="mute mt-6" style={{ maxWidth: 460, fontSize: 15, lineHeight: 1.7 }}>{t.story_body}</p>
            <div className="mt-8">
              <button className="btn btn-outline" onClick={() => onNav('about')}>{t.read_story}</button>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-eyebrow">{lang === 'fr' ? 'Explorer' : 'Explore'}</div>
              <h2 className="section-title">{t.collections}</h2>
            </div>
          </div>
          <div className="grid-3">
            {PirabelV2.categories.slice(0, 3).map((c, i) => (
              <div key={c.id} className="cat-tile" onClick={() => onNav('catalog', {category: c.id})}>
                <img src={c.img} alt=""/>
                <div className="cat-tile-content">
                  <div className="cat-num">0{i+1}</div>
                  <div className="cat-title">{c[lang]}</div>
                  <div className="cat-arrow">{lang === 'fr' ? 'Découvrir' : 'Discover'} <Icon.Arrow s={12}/></div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid-3 mt-6">
            {PirabelV2.categories.slice(3, 6).map((c, i) => (
              <div key={c.id} className="cat-tile" onClick={() => onNav('catalog', {category: c.id})}>
                <img src={c.img} alt=""/>
                <div className="cat-tile-content">
                  <div className="cat-num">0{i+4}</div>
                  <div className="cat-title">{c[lang]}</div>
                  <div className="cat-arrow">{lang === 'fr' ? 'Découvrir' : 'Discover'} <Icon.Arrow s={12}/></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="section" style={{ background: 'var(--ivory-2)' }}>
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-eyebrow">{lang === 'fr' ? 'Ce mois-ci' : 'This month'}</div>
              <h2 className="section-title">{t.featured}</h2>
            </div>
            <button className="btn btn-ghost" onClick={() => onNav('catalog')}>{t.see_all} <Icon.Arrow/></button>
          </div>
          <div className="grid-4">
            {more.map(p => <ProductCard key={p.id} p={p} lang={lang} onOpen={onOpen} onWish={onWish} wished={wish.includes(p.id)} onAdd={onAdd}/>)}
          </div>
        </div>
      </section>

      {/* SERVICE */}
      <section className="section">
        <div className="container">
          <div className="grid-3">
            {[
              { t: t.svc_delivery, d: t.svc_delivery_sub },
              { t: t.svc_pay, d: t.svc_pay_sub },
              { t: t.svc_care, d: t.svc_care_sub },
            ].map((s, i) => (
              <div key={i} style={{ padding: '0 20px' }}>
                <div className="serif" style={{ fontSize: 22, marginBottom: 12 }}>0{i+1}.</div>
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>{s.t}</div>
                <p className="mute" style={{ fontSize: 14, lineHeight: 1.6 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section style={{ background: 'var(--ink)', color: 'var(--ivory)', padding: '100px 0' }}>
        <div className="container-tight" style={{ textAlign: 'center' }}>
          <div className="section-eyebrow" style={{ color: 'rgba(247,243,236,.5)' }}>{lang === 'fr' ? 'Correspondance' : 'Correspondence'}</div>
          <h2 className="serif" style={{ fontSize: 'clamp(32px, 4vw, 52px)', margin: '12px 0 16px', fontWeight: 400 }}>{t.newsletter_title}</h2>
          <p style={{ maxWidth: 520, margin: '0 auto 32px', color: 'rgba(247,243,236,.7)' }}>{t.newsletter_sub}</p>
          <form style={{ display: 'flex', gap: 12, maxWidth: 480, margin: '0 auto', borderBottom: '1px solid rgba(247,243,236,.3)' }} onSubmit={e => e.preventDefault()}>
            <input placeholder={t.email_ph} style={{ flex: 1, background: 'transparent', border: 0, padding: '14px 0', color: 'var(--ivory)', outline: 0, fontSize: 15 }}/>
            <button type="submit" style={{ color: 'var(--ivory)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', padding: '14px 0' }}>{t.subscribe} <Icon.Arrow/></button>
          </form>
        </div>
      </section>
    </main>
  );
}

function Catalog({ lang, onNav, onAdd, onWish, wish, onOpen, initCat }) {
  const [cat, setCat] = React.useState(initCat || 'all');
  const [sort, setSort] = React.useState('featured');
  let items = PirabelV2.products.filter(p => cat === 'all' || p.category === cat);
  if (sort === 'price-asc') items = [...items].sort((a,b) => a.price - b.price);
  if (sort === 'price-desc') items = [...items].sort((a,b) => b.price - a.price);

  const catMeta = PirabelV2.categories.find(c => c.id === cat);

  return (
    <main>
      <section style={{ padding: '56px 0 32px', textAlign: 'center', borderBottom: '1px solid var(--line)' }}>
        <div className="container">
          <div className="section-eyebrow">{lang === 'fr' ? 'Catalogue' : 'Catalog'}</div>
          <h1 className="serif" style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 400, margin: '8px 0 0' }}>
            {cat === 'all' ? (lang === 'fr' ? 'Toutes les pièces' : 'All pieces') : catMeta?.[lang]}
          </h1>
          <p className="mute mt-4">{items.length} {lang === 'fr' ? 'articles' : 'items'}</p>
        </div>
      </section>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 32 }}>
        <div className="row between wrap gap-4" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 20, marginBottom: 40 }}>
          <div className="row gap-4 wrap">
            {[{id:'all',l:lang==='fr'?'Tout':'All'},...PirabelV2.categories.map(c=>({id:c.id,l:c[lang]}))].map(c => (
              <button key={c.id} onClick={() => setCat(c.id)}
                style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase',
                  color: cat === c.id ? 'var(--ink)' : 'var(--ink-mute)',
                  borderBottom: cat === c.id ? '1px solid var(--ink)' : '1px solid transparent',
                  paddingBottom: 4 }}>{c.l}</button>
            ))}
          </div>
          <select className="select" style={{ width: 'auto', paddingRight: 24 }} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="featured">{lang === 'fr' ? 'En vedette' : 'Featured'}</option>
            <option value="price-asc">{lang === 'fr' ? 'Prix croissant' : 'Price: low to high'}</option>
            <option value="price-desc">{lang === 'fr' ? 'Prix décroissant' : 'Price: high to low'}</option>
          </select>
        </div>

        <div className="grid-4">
          {items.map(p => <ProductCard key={p.id} p={p} lang={lang} onOpen={onOpen} onWish={onWish} wished={wish.includes(p.id)} onAdd={onAdd}/>)}
        </div>
      </div>
    </main>
  );
}

function Product({ id, lang, onNav, onAdd, onWish, wish, onOpen }) {
  const p = PirabelV2.products.find(x => x.id === id);
  if (!p) return <main className="container" style={{ padding: 80 }}>Introuvable</main>;

  const [size, setSize] = React.useState(p.size?.[0]);
  const [color, setColor] = React.useState(p.color?.[0]);
  const [qty, setQty] = React.useState(1);
  const [mainImg, setMainImg] = React.useState(p.img);
  const related = PirabelV2.products.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);
  const discount = p.old ? Math.round((1 - p.price/p.old)*100) : 0;

  return (
    <main>
      <div className="container" style={{ paddingTop: 24, fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
        <a href="#" onClick={e => { e.preventDefault(); onNav('home'); }}>{lang === 'fr' ? 'Accueil' : 'Home'}</a> / <a href="#" onClick={e => { e.preventDefault(); onNav('catalog', {category: p.category}); }}>{p.collection}</a> / <span style={{color:'var(--ink)'}}>{p[lang].name}</span>
      </div>

      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 80, padding: '32px 40px 80px' }}>
        <div>
          <div style={{ aspectRatio: '4/5', background: 'var(--ivory-2)', overflow: 'hidden' }}>
            <img src={mainImg} alt={p[lang].name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
            {[p.img, p.img2, p.img, p.img2].filter(Boolean).map((im, i) => (
              <button key={i} onClick={() => setMainImg(im)} style={{ aspectRatio: 1, overflow: 'hidden', border: mainImg === im ? '1px solid var(--ink)' : '1px solid var(--line)', padding: 0 }}>
                <img src={im} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/>
              </button>
            ))}
          </div>
        </div>

        <div style={{ position: 'sticky', top: 120, alignSelf: 'start' }}>
          <div className="section-eyebrow">{p.collection}</div>
          <h1 className="serif" style={{ fontSize: 36, fontWeight: 400, lineHeight: 1.15, margin: '8px 0 20px' }}>{p[lang].name}</h1>
          <div className="pdp-price">
            {PirabelV2.fmt(p.price)}
            {p.old && <span className="old">{PirabelV2.fmt(p.old)}</span>}
          </div>
          <p className="mute mt-2" style={{ fontSize: 12 }}>{lang === 'fr' ? 'TTC, hors frais de livraison' : 'Tax included, delivery not included'}</p>

          {p[lang].desc && <p className="mute mt-6" style={{ fontSize: 14, lineHeight: 1.7 }}>{p[lang].desc}</p>}

          {p.color && (
            <div className="mt-8">
              <div className="caps mb-4">{lang === 'fr' ? 'Couleur' : 'Color'} — <span style={{ textTransform: 'none', color: 'var(--ink-mute)', letterSpacing: '.02em' }}>{color?.n}</span></div>
              <div className="row gap-3">
                {p.color.map(c => (
                  <button key={c.n} onClick={() => setColor(c)} className={`swatch ${color?.n === c.n ? 'active' : ''}`} style={{ background: c.c }} title={c.n}/>
                ))}
              </div>
            </div>
          )}

          {p.size && (
            <div className="mt-8">
              <div className="caps mb-4 row between">
                <span>{lang === 'fr' ? 'Taille' : 'Size'}</span>
                <a href="#" style={{ fontSize: 10, letterSpacing: '.14em', color: 'var(--ink-mute)' }}>{lang === 'fr' ? 'Guide des tailles' : 'Size guide'}</a>
              </div>
              <div className="row gap-2 wrap">
                {p.size.map(s => (
                  <button key={s} onClick={() => setSize(s)} className={`size-chip ${size === s ? 'active' : ''}`}>{s}</button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 row gap-3">
            <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--line)' }}>
              <button onClick={() => setQty(Math.max(1, qty-1))} style={{ width: 44, height: 52 }}><Icon.Minus/></button>
              <span style={{ minWidth: 32, textAlign: 'center', fontSize: 14 }}>{qty}</span>
              <button onClick={() => setQty(qty+1)} style={{ width: 44, height: 52 }}><Icon.Plus/></button>
            </div>
            <button className="btn btn-primary btn-lg" style={{ flex: 1, height: 52 }} onClick={() => { for(let i=0;i<qty;i++) onAdd(p.id); }}>
              {lang === 'fr' ? 'Ajouter au sac' : 'Add to bag'}
            </button>
            <button className="btn btn-outline" style={{ height: 52, padding: '0 20px' }} onClick={() => onWish(p.id)}>
              <Icon.Heart/>
            </button>
          </div>

          <div className="mt-8" style={{ borderTop: '1px solid var(--line)', paddingTop: 24 }}>
            {[
              {t: lang === 'fr' ? 'Livraison & retours' : 'Shipping & returns', d: lang === 'fr' ? 'Livraison offerte dès 50 000 FCFA. Retours sous 14 jours.' : 'Free shipping over 50,000 FCFA. 14-day returns.'},
              {t: lang === 'fr' ? 'Service client' : 'Customer care', d: lang === 'fr' ? 'Une conseillère disponible par WhatsApp, 7j/7.' : 'WhatsApp advisor available 7 days a week.'},
              {t: lang === 'fr' ? 'Matériaux & entretien' : 'Materials & care', d: lang === 'fr' ? 'Matériaux premium. Entretien recommandé en pressing.' : 'Premium materials. Professional cleaning recommended.'},
            ].map((s, i) => (
              <details key={i} style={{ padding: '16px 0', borderBottom: '1px solid var(--line)' }}>
                <summary style={{ cursor: 'pointer', fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', listStyle: 'none', display: 'flex', justifyContent: 'space-between' }}>
                  {s.t} <span>+</span>
                </summary>
                <p className="mute mt-4" style={{ fontSize: 13, lineHeight: 1.6 }}>{s.d}</p>
              </details>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section-sm" style={{ background: 'var(--ivory-2)' }}>
          <div className="container">
            <div className="section-head">
              <h2 className="section-title">{lang === 'fr' ? 'Autres pièces à découvrir' : 'You may also like'}</h2>
            </div>
            <div className="grid-4">
              {related.map(x => <ProductCard key={x.id} p={x} lang={lang} onOpen={onOpen} onWish={onWish} wished={wish.includes(x.id)} onAdd={onAdd}/>)}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function CartDrawer({ open, onClose, cart, onRemove, onQty, lang, onCheckout }) {
  if (!open) return null;
  const items = cart.map(c => ({ ...c, p: PirabelV2.products.find(x => x.id === c.id) })).filter(x => x.p);
  const subtotal = items.reduce((s, i) => s + i.p.price * i.qty, 0);
  return (
    <>
      <div className="drawer-backdrop" onClick={onClose}/>
      <aside className="drawer">
        <div className="drawer-head">
          <div className="drawer-title">{lang === 'fr' ? 'Votre sac' : 'Your bag'} {items.length > 0 && <span className="mute" style={{ fontSize: 14 }}>({items.length})</span>}</div>
          <button onClick={onClose}><Icon.X/></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <Icon.Bag s={32}/>
              <p className="mute mt-4">{lang === 'fr' ? 'Votre sac est vide' : 'Your bag is empty'}</p>
            </div>
          ) : items.map(it => (
            <div key={it.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 16, paddingBottom: 20, marginBottom: 20, borderBottom: '1px solid var(--line)' }}>
              <div style={{ aspectRatio: '4/5', overflow: 'hidden' }}>
                <img src={it.p.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/>
              </div>
              <div>
                <div className="serif" style={{ fontSize: 15 }}>{it.p[lang].name}</div>
                <div className="mute" style={{ fontSize: 12, marginTop: 4 }}>{it.p.collection}</div>
                <div className="row gap-2 mt-4" style={{ border: '1px solid var(--line)', display: 'inline-flex' }}>
                  <button onClick={() => onQty(it.id, it.qty-1)} style={{ width: 28, height: 28 }}><Icon.Minus s={10}/></button>
                  <span style={{ fontSize: 12, minWidth: 20, textAlign: 'center' }}>{it.qty}</span>
                  <button onClick={() => onQty(it.id, it.qty+1)} style={{ width: 28, height: 28 }}><Icon.Plus s={10}/></button>
                </div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <button onClick={() => onRemove(it.id)} style={{ color: 'var(--ink-mute)' }}><Icon.X s={14}/></button>
                <div className="serif" style={{ fontSize: 15 }}>{PirabelV2.fmt(it.p.price * it.qty)}</div>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div style={{ padding: 28, borderTop: '1px solid var(--line)' }}>
            <div className="row between mb-4">
              <span className="caps mute">{lang === 'fr' ? 'Sous-total' : 'Subtotal'}</span>
              <span className="serif" style={{ fontSize: 22 }}>{PirabelV2.fmt(subtotal)}</span>
            </div>
            <p className="mute" style={{ fontSize: 11, marginBottom: 16 }}>{lang === 'fr' ? 'Livraison et taxes calculées à la commande.' : 'Shipping and taxes calculated at checkout.'}</p>
            <button className="btn btn-primary btn-block btn-lg" onClick={onCheckout}>{lang === 'fr' ? 'Passer la commande' : 'Checkout'}</button>
          </div>
        )}
      </aside>
    </>
  );
}

function Checkout({ lang, cart, onNav, onPlace }) {
  const [step, setStep] = React.useState(1);
  const [info, setInfo] = React.useState({ name: '', phone: '', email: '', city: 'Cotonou', zone: '', address: '' });
  const [pay, setPay] = React.useState('mtn');
  const items = cart.map(c => ({ ...c, p: PirabelV2.products.find(x => x.id === c.id) })).filter(x => x.p);
  const subtotal = items.reduce((s, i) => s + i.p.price * i.qty, 0);
  const delivery = subtotal > 50000 ? 0 : 2500;

  if (items.length === 0 && step < 4) {
    return <main className="container" style={{ padding: '120px 40px', textAlign: 'center' }}>
      <h1 className="serif" style={{ fontSize: 32 }}>{lang === 'fr' ? 'Votre sac est vide' : 'Your bag is empty'}</h1>
      <button className="btn btn-outline mt-8" onClick={() => onNav('catalog')}>{lang === 'fr' ? 'Découvrir' : 'Discover'}</button>
    </main>;
  }

  return (
    <main className="container-tight" style={{ padding: '48px 40px 80px' }}>
      <div className="section-eyebrow">{lang === 'fr' ? 'Commande' : 'Checkout'}</div>
      <h1 className="serif" style={{ fontSize: 40, fontWeight: 400, marginBottom: 32 }}>
        {step === 4 ? (lang === 'fr' ? 'Merci.' : 'Thank you.') : (lang === 'fr' ? 'Finalisez votre commande' : 'Complete your order')}
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

      <div style={{ display: 'grid', gridTemplateColumns: step < 4 ? '1.4fr 1fr' : '1fr', gap: 64 }}>
        <div>
          {step === 1 && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, rowGap: 24 }}>
                <div className="field"><label>{lang === 'fr' ? 'Nom complet' : 'Full name'}</label><input className="input" value={info.name} onChange={e => setInfo({...info, name: e.target.value})}/></div>
                <div className="field"><label>{lang === 'fr' ? 'Téléphone' : 'Phone'}</label><input className="input" value={info.phone} onChange={e => setInfo({...info, phone: e.target.value})} placeholder="+229 01 97 12 34 56"/></div>
                <div className="field" style={{ gridColumn: '1/-1' }}><label>Email</label><input className="input" value={info.email} onChange={e => setInfo({...info, email: e.target.value})}/></div>
                <div className="field"><label>{lang === 'fr' ? 'Ville' : 'City'}</label>
                  <select className="select" value={info.city} onChange={e => setInfo({...info, city: e.target.value})}>
                    <option>Cotonou</option><option>Porto-Novo</option><option>Parakou</option><option>Abomey-Calavi</option><option>Ouidah</option>
                  </select></div>
                <div className="field"><label>{lang === 'fr' ? 'Quartier' : 'District'}</label><input className="input" value={info.zone} onChange={e => setInfo({...info, zone: e.target.value})}/></div>
                <div className="field" style={{ gridColumn: '1/-1' }}><label>{lang === 'fr' ? 'Adresse / repère' : 'Address / landmark'}</label><input className="input" value={info.address} onChange={e => setInfo({...info, address: e.target.value})}/></div>
              </div>
              <div className="mt-8"><button className="btn btn-primary btn-lg" onClick={() => setStep(2)} disabled={!info.name || !info.phone}>{lang === 'fr' ? 'Continuer' : 'Continue'}</button></div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  {id:'mtn',n:'MTN Mobile Money'},
                  {id:'moov',n:'Moov Money'},
                  {id:'celtiis',n:'Celtiis Cash'},
                  {id:'card',n:lang==='fr'?'Carte bancaire':'Credit card'},
                  {id:'cod',n:lang==='fr'?'Paiement à la livraison':'Cash on delivery'},
                ].map(m => (
                  <label key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 20, border: pay === m.id ? '1px solid var(--ink)' : '1px solid var(--line)', cursor: 'pointer' }}>
                    <div className="row gap-3">
                      <input type="radio" checked={pay === m.id} onChange={() => setPay(m.id)}/>
                      <span style={{ fontSize: 14 }}>{m.n}</span>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-8 row gap-3"><button className="btn btn-ghost" onClick={() => setStep(1)}>← {lang === 'fr' ? 'Retour' : 'Back'}</button><button className="btn btn-primary btn-lg" onClick={() => setStep(3)}>{lang === 'fr' ? 'Continuer' : 'Continue'}</button></div>
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
                <div>{pay === 'mtn' ? 'MTN MoMo' : pay === 'moov' ? 'Moov' : pay === 'celtiis' ? 'Celtiis' : pay === 'card' ? 'Carte' : (lang === 'fr' ? 'À la livraison' : 'On delivery')}</div>
              </div>
              <div className="mt-8 row gap-3"><button className="btn btn-ghost" onClick={() => setStep(2)}>← {lang === 'fr' ? 'Retour' : 'Back'}</button><button className="btn btn-primary btn-lg" onClick={() => { onPlace(); setStep(4); }}>{lang === 'fr' ? 'Payer' : 'Pay'} {PirabelV2.fmt(subtotal + delivery)}</button></div>
            </div>
          )}

          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ width: 64, height: 64, border: '1px solid var(--line)', borderRadius: 999, display: 'grid', placeItems: 'center', margin: '0 auto 24px' }}><Icon.Check s={24}/></div>
              <p className="serif" style={{ fontSize: 22, fontWeight: 400, lineHeight: 1.5, maxWidth: 520, margin: '0 auto 16px' }}>{lang === 'fr' ? 'Votre commande est confirmée. Un message de confirmation vous a été envoyé.' : 'Your order is confirmed. A confirmation message has been sent.'}</p>
              <div className="mono mute mt-4">№ PB-{Date.now().toString().slice(-6)}</div>
              <div className="mt-8 row gap-3" style={{ justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={() => onNav('track')}>{lang === 'fr' ? 'Suivre la commande' : 'Track order'}</button>
                <button className="btn btn-outline" onClick={() => onNav('home')}>{lang === 'fr' ? 'Retour à l\'accueil' : 'Back to home'}</button>
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
                  <div key={it.id} className="row gap-3">
                    <div style={{ width: 56, aspectRatio: '4/5', overflow: 'hidden' }}><img src={it.p.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/></div>
                    <div style={{ flex: 1 }}>
                      <div className="serif" style={{ fontSize: 14 }}>{it.p[lang].name}</div>
                      <div className="mute" style={{ fontSize: 11 }}>× {it.qty}</div>
                    </div>
                    <div style={{ fontSize: 13 }}>{PirabelV2.fmt(it.p.price * it.qty)}</div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}>
                <div className="row between mb-2"><span className="mute" style={{ fontSize: 13 }}>{lang === 'fr' ? 'Sous-total' : 'Subtotal'}</span><span>{PirabelV2.fmt(subtotal)}</span></div>
                <div className="row between mb-4"><span className="mute" style={{ fontSize: 13 }}>{lang === 'fr' ? 'Livraison' : 'Shipping'}</span><span>{delivery === 0 ? (lang === 'fr' ? 'Offerte' : 'Free') : PirabelV2.fmt(delivery)}</span></div>
                <div className="row between" style={{ paddingTop: 16, borderTop: '1px solid var(--line)' }}>
                  <span className="caps">{lang === 'fr' ? 'Total' : 'Total'}</span>
                  <span className="serif" style={{ fontSize: 22 }}>{PirabelV2.fmt(subtotal + delivery)}</span>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </main>
  );
}

function SimplePage({ title, children, eyebrow }) {
  return (
    <main>
      <section style={{ padding: '80px 0 40px', textAlign: 'center', borderBottom: '1px solid var(--line)' }}>
        <div className="container">
          {eyebrow && <div className="section-eyebrow">{eyebrow}</div>}
          <h1 className="serif" style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 400, margin: '8px 0 0' }}>{title}</h1>
        </div>
      </section>
      <div className="container-tight" style={{ padding: '64px 40px 80px' }}>{children}</div>
    </main>
  );
}

function About({ lang }) {
  const t = PirabelV2.i18n[lang];
  return (
    <main>
      <section style={{ height: '70vh', minHeight: 520, position: 'relative', overflow: 'hidden' }}>
        <img src={PirabelV2.img('photo-1558769132-cb1aea458c5e', 2000)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,.5))', display: 'flex', alignItems: 'flex-end', padding: '0 40px 64px' }}>
          <div className="container" style={{ color: 'var(--ivory)' }}>
            <div className="section-eyebrow" style={{ color: 'rgba(247,243,236,.7)' }}>{lang === 'fr' ? 'La Maison' : 'The House'}</div>
            <h1 className="serif" style={{ fontSize: 'clamp(48px, 7vw, 96px)', fontWeight: 400, lineHeight: 1, letterSpacing: '-.02em' }}>Pirabel.</h1>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container-tight" style={{ textAlign: 'center', maxWidth: 720 }}>
          <h2 className="serif" style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 400, lineHeight: 1.3, marginBottom: 24 }} dangerouslySetInnerHTML={{__html: t.story_title}}/>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--ink-soft)' }}>{t.story_body}</p>
        </div>
      </section>
      <section>
        <div className="split">
          <div className="split-img"><img src={PirabelV2.img('photo-1519415510236-718bdfcd89c8', 1400)} alt=""/></div>
          <div className="split-text" style={{ background: 'var(--ivory-2)' }}>
            <div className="section-eyebrow">01</div>
            <h3 className="serif" style={{ fontSize: 32, fontWeight: 400, marginBottom: 16 }}>{lang === 'fr' ? 'Une sélection exigeante' : 'A careful selection'}</h3>
            <p className="mute" style={{ fontSize: 15, lineHeight: 1.7 }}>{lang === 'fr' ? 'Chaque pièce est choisie pour la qualité de ses matériaux et la rigueur de sa finition.' : 'Each piece is chosen for the quality of its materials and the rigor of its finish.'}</p>
          </div>
        </div>
        <div className="split">
          <div className="split-text" style={{ background: 'var(--ink)', color: 'var(--ivory)' }}>
            <div className="section-eyebrow" style={{ color: 'rgba(247,243,236,.5)' }}>02</div>
            <h3 className="serif" style={{ fontSize: 32, fontWeight: 400, marginBottom: 16 }}>{lang === 'fr' ? 'Enracinée au Bénin' : 'Rooted in Benin'}</h3>
            <p style={{ color: 'rgba(247,243,236,.7)', fontSize: 15, lineHeight: 1.7 }}>{lang === 'fr' ? 'Basée à Cotonou, Pirabel livre dans tout le pays avec un service personnalisé.' : 'Based in Cotonou, Pirabel delivers across the country with personal service.'}</p>
          </div>
          <div className="split-img"><img src={PirabelV2.img('photo-1523206489230-c012c64b2b48', 1400)} alt=""/></div>
        </div>
      </section>
    </main>
  );
}

function Contact({ lang }) {
  const [sent, setSent] = React.useState(false);
  return (
    <SimplePage title={lang === 'fr' ? 'Nous écrire' : 'Write to us'} eyebrow={lang === 'fr' ? 'Contact' : 'Contact'}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>
        <div>
          <p className="mute" style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
            {lang === 'fr' ? 'Une question, une demande particulière ? Notre équipe vous répond sous 2h en jours ouvrés.' : 'A question or special request? Our team responds within 2h on weekdays.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div><div className="caps mute mb-2">WhatsApp</div><div>+229 01 97 12 34 56</div></div>
            <div><div className="caps mute mb-2">Email</div><div>contact@pirabel.bj</div></div>
            <div><div className="caps mute mb-2">{lang === 'fr' ? 'Adresse' : 'Address'}</div><div>Haie Vive, Cotonou · Bénin</div></div>
          </div>
        </div>
        <form onSubmit={e => { e.preventDefault(); setSent(true); }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: 60, border: '1px solid var(--line)' }}>
              <Icon.Check s={32}/>
              <p className="serif mt-4" style={{ fontSize: 20 }}>{lang === 'fr' ? 'Message envoyé.' : 'Message sent.'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="field"><label>{lang === 'fr' ? 'Nom' : 'Name'}</label><input className="input" required/></div>
              <div className="field"><label>Email</label><input className="input" type="email" required/></div>
              <div className="field"><label>Message</label><textarea className="textarea" rows={5} required/></div>
              <button className="btn btn-primary btn-lg" style={{ alignSelf: 'flex-start' }} type="submit">{lang === 'fr' ? 'Envoyer' : 'Send'}</button>
            </div>
          )}
        </form>
      </div>
    </SimplePage>
  );
}

function Track({ lang }) {
  return (
    <SimplePage title={lang === 'fr' ? 'Suivre votre commande' : 'Track your order'} eyebrow={lang === 'fr' ? 'Suivi' : 'Tracking'}>
      <div className="row gap-3 mb-8" style={{ maxWidth: 560 }}>
        <input className="input" placeholder="PB-XXXXXX" style={{ flex: 1 }}/>
        <button className="btn btn-primary">{lang === 'fr' ? 'Suivre' : 'Track'}</button>
      </div>
      <div style={{ padding: 32, background: 'var(--ivory-2)' }}>
        <div className="row between mb-6">
          <div><div className="caps mute mb-2">{lang === 'fr' ? 'Commande' : 'Order'}</div><div className="mono">PB-284719</div></div>
          <div><div className="caps mute mb-2">{lang === 'fr' ? 'Livraison estimée' : 'ETA'}</div><div>{lang === 'fr' ? "Aujourd'hui, 17h–18h" : 'Today, 5–6pm'}</div></div>
          <span style={{ padding: '8px 16px', background: 'var(--ink)', color: 'var(--ivory)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase' }}>{lang === 'fr' ? 'En route' : 'In transit'}</span>
        </div>
        <div style={{ position: 'relative', paddingLeft: 32 }}>
          <div style={{ position: 'absolute', left: 7, top: 6, bottom: 6, width: 1, background: 'var(--line)' }}/>
          {[
            {t: lang === 'fr' ? 'Commande confirmée' : 'Order confirmed', d: '12:34', done: true},
            {t: lang === 'fr' ? 'Paiement reçu' : 'Payment received', d: '12:35', done: true},
            {t: lang === 'fr' ? 'En préparation' : 'Being prepared', d: '13:10', done: true},
            {t: lang === 'fr' ? 'En route' : 'Out for delivery', d: '15:45', done: true, active: true},
            {t: lang === 'fr' ? 'Livrée' : 'Delivered', d: lang === 'fr' ? 'Attendu ~17:30' : 'Expected ~17:30', done: false},
          ].map((s, i) => (
            <div key={i} style={{ paddingBottom: 20, position: 'relative' }}>
              <div style={{ position: 'absolute', left: -25, top: 4, width: 15, height: 15, borderRadius: 999,
                background: s.active ? 'var(--ink)' : s.done ? 'var(--ink)' : 'var(--ivory)',
                border: '1px solid var(--ink)'}}/>
              <div style={{ fontSize: 14, fontWeight: s.active ? 500 : 400, color: s.done || s.active ? 'var(--ink)' : 'var(--ink-faint)' }}>{s.t}</div>
              <div className="mute" style={{ fontSize: 12, marginTop: 2 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>
    </SimplePage>
  );
}

function Account({ lang, onNav, wish, onOpen, onAdd, onWish }) {
  const [tab, setTab] = React.useState('orders');
  const wishItems = PirabelV2.products.filter(p => wish.includes(p.id));
  return (
    <SimplePage title={lang === 'fr' ? 'Mon compte' : 'My account'} eyebrow="Aïcha Koudougou">
      <div className="row gap-6 mb-8" style={{ borderBottom: '1px solid var(--line)' }}>
        {[
          {id:'orders', l:lang==='fr'?'Commandes':'Orders'},
          {id:'wish', l:lang==='fr'?'Souhaits':'Wishlist'},
          {id:'addr', l:lang==='fr'?'Adresses':'Addresses'},
          {id:'set', l:lang==='fr'?'Paramètres':'Settings'},
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '12px 0', fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase',
              color: tab === t.id ? 'var(--ink)' : 'var(--ink-mute)',
              borderBottom: tab === t.id ? '1px solid var(--ink)' : 'none', marginBottom: -1 }}>{t.l}</button>
        ))}
      </div>
      {tab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            {id:'PB-284719', d:'18 avril 2026', s:lang==='fr'?'En route':'In transit', t:147500, n:3},
            {id:'PB-281203', d:'02 avril 2026', s:lang==='fr'?'Livrée':'Delivered', t:285000, n:2},
          ].map(o => (
            <div key={o.id} className="row between" style={{ padding: 24, border: '1px solid var(--line)' }}>
              <div><div className="mono mute" style={{ fontSize: 12 }}>{o.id}</div><div className="serif mt-2" style={{ fontSize: 17 }}>{o.d} · {o.n} {lang==='fr'?'articles':'items'}</div></div>
              <span className="caps">{o.s}</span>
              <div className="serif" style={{ fontSize: 20 }}>{PirabelV2.fmt(o.t)}</div>
              <button className="btn btn-outline btn-sm" onClick={() => onNav('track')}>{lang==='fr'?'Suivre':'Track'}</button>
            </div>
          ))}
        </div>
      )}
      {tab === 'wish' && (
        wishItems.length === 0
          ? <div style={{ textAlign: 'center', padding: 60 }}><Icon.Heart s={28}/><p className="mute mt-4">{lang==='fr'?'Vous n\'avez pas encore de souhaits.':'No wishlist items yet.'}</p></div>
          : <div className="grid-4">{wishItems.map(p => <ProductCard key={p.id} p={p} lang={lang} onOpen={onOpen} onWish={onWish} wished={wish.includes(p.id)} onAdd={onAdd}/>)}</div>
      )}
      {tab === 'addr' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 24, border: '1px solid var(--line)' }}><div className="caps mute mb-2">{lang==='fr'?'Principale':'Primary'}</div><div>Cadjehoun, en face de la pharmacie · Cotonou</div></div>
          <button className="btn btn-outline" style={{ alignSelf: 'flex-start' }}>+ {lang==='fr'?'Ajouter':'Add'}</button>
        </div>
      )}
      {tab === 'set' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 560 }}>
          <div className="field"><label>{lang==='fr'?'Prénom':'First name'}</label><input className="input" defaultValue="Aïcha"/></div>
          <div className="field"><label>{lang==='fr'?'Nom':'Last name'}</label><input className="input" defaultValue="Koudougou"/></div>
          <div className="field" style={{gridColumn:'1/-1'}}><label>Email</label><input className="input" defaultValue="aicha@exemple.com"/></div>
          <div style={{gridColumn:'1/-1'}}><button className="btn btn-primary">{lang==='fr'?'Enregistrer':'Save'}</button></div>
        </div>
      )}
    </SimplePage>
  );
}

function Journal({ lang }) {
  const posts = [
    {t: lang === 'fr' ? 'La patine du cuir, un art du temps' : 'The patina of leather, the art of time', c: lang === 'fr' ? 'Savoir-faire' : 'Craft', img: PirabelV2.img('photo-1547731030-cd126f943bd6', 1200)},
    {t: lang === 'fr' ? 'Les ateliers qui nous inspirent' : 'Ateliers that inspire us', c: lang === 'fr' ? 'Rencontres' : 'Meetings', img: PirabelV2.img('photo-1441986300917-64674bd600d8', 1200)},
    {t: lang === 'fr' ? 'Un voyage à Abomey' : 'A journey to Abomey', c: lang === 'fr' ? 'Culture' : 'Culture', img: PirabelV2.img('photo-1523206489230-c012c64b2b48', 1200)},
  ];
  return (
    <SimplePage title={lang === 'fr' ? 'Le Journal' : 'Journal'} eyebrow={lang === 'fr' ? 'Lectures' : 'Readings'}>
      <div className="grid-3">
        {posts.map((p, i) => (
          <article key={i} style={{ cursor: 'pointer' }}>
            <div style={{ aspectRatio: '4/5', overflow: 'hidden', marginBottom: 16 }}><img src={p.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/></div>
            <div className="caps mute mb-2">{p.c}</div>
            <h3 className="serif" style={{ fontSize: 22, fontWeight: 400, lineHeight: 1.3 }}>{p.t}</h3>
          </article>
        ))}
      </div>
    </SimplePage>
  );
}

Object.assign(window, { Icon, ProductCard, Header, Footer, Home, Catalog, Product, CartDrawer, Checkout, About, Contact, Track, Account, Journal });
