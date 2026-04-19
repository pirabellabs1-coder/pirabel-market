import type { Metadata } from 'next';
import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google';
import { StoreProvider } from '@/components/store-provider';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CartDrawer } from '@/components/cart-drawer';
import { Toast } from '@/components/toast';
import { WhatsAppFloat } from '@/components/whatsapp-float';
import { SearchModal } from '@/components/search-modal';
import { PopupHost } from '@/components/popup-host';
import { SocialProof } from '@/components/social-proof';
import { GoogleAnalytics } from '@/components/google-analytics';
import { getProducts } from '@/lib/db';
import { createAdminClient } from '@/lib/supabase/admin';
import { organizationJsonLd } from '@/lib/seo';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://pirabel-one.store'),
  title: {
    default: 'Pirabel — Maison de Cotonou',
    template: '%s · Pirabel',
  },
  description: "Une sélection d'objets, vêtements et accessoires pensés pour durer. Livrés avec soin, partout au Bénin.",
  keywords: ['Pirabel', 'boutique', 'mode', 'Cotonou', 'Bénin', 'cuir', 'lunetterie', 'accessoires', 'livraison Bénin'],
  icons: { icon: '/favicon.svg' },
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
    : undefined,
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: '/',
    siteName: 'Pirabel',
    title: 'Pirabel — Maison de Cotonou',
    description: "Une sélection d'objets, vêtements et accessoires pensés pour durer.",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pirabel — Maison de Cotonou',
    description: "Une sélection d'objets, vêtements et accessoires pensés pour durer.",
  },
};

async function fetchActivePopups() {
  try {
    const sb = createAdminClient();
    const { data } = await sb
      .from('popups')
      .select('id, title, body, cta_label, cta_url, image, position, trigger_type, trigger_value, show_once')
      .eq('active', true)
      .or(`ends_at.is.null,ends_at.gt.${new Date().toISOString()}`)
      .lte('starts_at', new Date().toISOString())
      .limit(3);
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetch products + popups once at layout level (cached).
  const [products, popups] = await Promise.all([
    getProducts(),
    fetchActivePopups(),
  ]);

  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="fr" data-theme="light" className={`${playfair.variable} ${inter.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <body>
        <StoreProvider>
          <Header/>
          {children}
          <Footer/>
          <CartDrawer products={products}/>
          <SearchModal products={products}/>
          <PopupHost popups={popups}/>
          <SocialProof/>
          <WhatsAppFloat/>
          <Toast/>
        </StoreProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        {gaId && <GoogleAnalytics gaId={gaId}/>}
      </body>
    </html>
  );
}
