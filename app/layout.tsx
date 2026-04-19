import type { Metadata } from 'next';
import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google';
import { StoreProvider } from '@/components/store-provider';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CartDrawer } from '@/components/cart-drawer';
import { Toast } from '@/components/toast';
import { WhatsAppFloat } from '@/components/whatsapp-float';
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-theme="light" className={`${playfair.variable} ${inter.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <body>
        <StoreProvider>
          <Header/>
          {children}
          <Footer/>
          <CartDrawer/>
          <WhatsAppFloat/>
          <Toast/>
        </StoreProvider>
      </body>
    </html>
  );
}
