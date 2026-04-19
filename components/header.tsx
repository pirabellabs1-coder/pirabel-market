'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from './store-provider';
import { Icon } from './icons';
import { i18n } from '@/lib/i18n';

export function Header() {
  const { lang, toggleLang, cartCount, wish, openBag } = useStore();
  const t = i18n[lang];
  const pathname = usePathname();
  const isCatalog = (cat: string) => pathname.startsWith(`/catalogue/${cat}`);

  return (
    <>
      <div className="announce">{t.announce}</div>
      <header className="header">
        <div className="container header-top">
          <div className="header-side header-side-left">
            <button className="head-btn hide-sm" onClick={toggleLang} aria-label="Langue">{lang.toUpperCase()}</button>
            <button className="head-btn hide-sm" aria-label={t.search}><Icon.Search/></button>
          </div>

          <Link className="brand" href="/">
            Pirabel
            <span className="brand-sub">Cotonou · Est. 2026</span>
          </Link>

          <div className="header-side header-side-right">
            <Link className="head-btn hide-sm" href="/compte" aria-label={t.account}><Icon.User/></Link>
            <Link className="head-btn" href="/compte?tab=wish" aria-label={t.wishlist}>
              <Icon.Heart/>{wish.length > 0 && <span className="count">{wish.length}</span>}
            </Link>
            <button className="head-btn" onClick={openBag} aria-label={t.bag}>
              <Icon.Bag/>{cartCount > 0 && <span className="count">{cartCount}</span>}
            </button>
          </div>
        </div>

        <nav className="container header-nav-row">
          <Link className={`header-link ${isCatalog('women') ? 'active' : ''}`} href="/catalogue/women">{t.nav.women}</Link>
          <Link className={`header-link ${isCatalog('men') ? 'active' : ''}`} href="/catalogue/men">{t.nav.men}</Link>
          <Link className={`header-link ${isCatalog('shoes') ? 'active' : ''}`} href="/catalogue/shoes">{lang === 'fr' ? 'Souliers' : 'Shoes'}</Link>
          <Link className={`header-link ${isCatalog('eyewear') ? 'active' : ''}`} href="/catalogue/eyewear">{t.nav.eyewear}</Link>
          <Link className={`header-link ${isCatalog('kids') ? 'active' : ''}`} href="/catalogue/kids">{t.nav.kids}</Link>
          <Link className={`header-link ${isCatalog('accessories') ? 'active' : ''}`} href="/catalogue/accessories">{t.nav.accessories}</Link>
          <Link className={`header-link ${pathname === '/journal' ? 'active' : ''}`} href="/journal">{t.nav.journal}</Link>
        </nav>
      </header>
    </>
  );
}
