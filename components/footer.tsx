'use client';

import Link from 'next/link';
import { useStore } from './store-provider';
import { i18n } from '@/lib/i18n';
import { BRAND } from '@/lib/brand';

export function Footer() {
  const { lang } = useStore();
  const t = i18n[lang];
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">Pirabel</div>
            <p style={{ maxWidth: 340, color: 'rgba(247,243,236,.6)', fontSize: 13, lineHeight: 1.6, marginTop: 16 }}>{t.footer_about}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 28, flexWrap: 'wrap' }}>
              {['MTN MoMo', 'Moov', 'Celtiis', 'Visa', 'Cash'].map(x => (
                <span key={x} style={{ padding: '6px 10px', border: '1px solid rgba(247,243,236,.2)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase' }}>{x}</span>
              ))}
            </div>
          </div>
          <div>
            <h5>{lang === 'fr' ? 'Maison' : 'House'}</h5>
            <ul>
              <li><Link href="/propos">{lang === 'fr' ? 'Notre histoire' : 'Our story'}</Link></li>
              <li><Link href="/propos">{lang === 'fr' ? 'Savoir-faire' : 'Craft'}</Link></li>
              <li><Link href="/journal">{lang === 'fr' ? 'Le Journal' : 'Journal'}</Link></li>
              <li><Link href="/lookbooks">Lookbooks</Link></li>
              <li><Link href="/cartes-cadeaux">{lang === 'fr' ? 'Chèques cadeaux' : 'Gift cards'}</Link></li>
              <li><Link href="/contact">{lang === 'fr' ? 'Carrières' : 'Careers'}</Link></li>
            </ul>
          </div>
          <div>
            <h5>{lang === 'fr' ? 'Service' : 'Service'}</h5>
            <ul>
              <li><Link href="/contact">{lang === 'fr' ? 'Contact' : 'Contact'}</Link></li>
              <li><Link href="/suivi">{lang === 'fr' ? 'Suivi de commande' : 'Track order'}</Link></li>
              <li><Link href="/contact">{lang === 'fr' ? 'Livraison' : 'Shipping'}</Link></li>
              <li><Link href="/contact">{lang === 'fr' ? 'Retours' : 'Returns'}</Link></li>
            </ul>
          </div>
          <div>
            <h5>{lang === 'fr' ? 'Boutique' : 'Boutique'}</h5>
            <ul>
              <li>{BRAND.address}</li>
              <li>{BRAND.phoneDisplay}</li>
              <li>{BRAND.contactEmail}</li>
              <li style={{ marginTop: 8 }}><a href={BRAND.whatsappUrl} target="_blank" rel="noopener">WhatsApp</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bot">
          <div>
            © 2026 Pirabel Maison · Cotonou, Bénin
            <span style={{ marginLeft: 16, opacity: 0.7 }}>
              · {lang === 'fr' ? 'Créé par' : 'Built by'}{' '}
              <a href="https://pirabellabs.com" target="_blank" rel="noopener" style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: 3 }}>Pirabel Labs</a>
            </span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <Link href="/conditions">{lang === 'fr' ? 'Conditions' : 'Terms'}</Link>
            <Link href="/confidentialite">{lang === 'fr' ? 'Confidentialité' : 'Privacy'}</Link>
            <Link href="/cookies">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
