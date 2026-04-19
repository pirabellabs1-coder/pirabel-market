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
import { getProducts } from '@/lib/db';
import { createAdminClient } from '@/lib/supabase/admin';
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
  title: 'Pirabel — Maison de Cotonou',
  description: "Une sélection d'objets, vêtements et accessoires pensés pour durer. Livrés avec soin, partout au Bénin.",
  icons: { icon: '/favicon.svg' },
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

  return (
    <html lang="fr" data-theme="light" className={`${playfair.variable} ${inter.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <body>
        <StoreProvider>
          <Header/>
          {children}
          <Footer/>
          <CartDrawer/>
          <SearchModal products={products}/>
          <PopupHost popups={popups}/>
          <WhatsAppFloat/>
          <Toast/>
        </StoreProvider>
      </body>
    </html>
  );
}
