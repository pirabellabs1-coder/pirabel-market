'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { CartItem, Lang } from '@/lib/types';
import { products } from '@/lib/products';

type Theme = 'light' | 'dark';

type StoreValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;

  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;

  cart: CartItem[];
  addToCart: (id: string, size?: string, color?: string) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;

  wish: string[];
  toggleWish: (id: string) => void;

  bagOpen: boolean;
  openBag: () => void;
  closeBag: () => void;

  toast: string;
  showToast: (msg: string) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [lang, setLangState] = useState<Lang>('fr');
  const [theme, setThemeState] = useState<Theme>('light');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wish, setWish] = useState<string[]>([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    setLangState(readJSON<Lang>('pb_lang', 'fr'));
    setThemeState(readJSON<Theme>('pb_theme', 'light'));
    setCart(readJSON<CartItem[]>('pb_cart', []));
    setWish(readJSON<string[]>('pb_wish', []));
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) localStorage.setItem('pb_lang', JSON.stringify(lang)); document.documentElement.lang = lang; }, [lang, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem('pb_theme', JSON.stringify(theme)); document.documentElement.dataset.theme = theme; }, [theme, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem('pb_cart', JSON.stringify(cart)); }, [cart, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem('pb_wish', JSON.stringify(wish)); }, [wish, hydrated]);

  const setLang = (l: Lang) => setLangState(l);
  const toggleLang = () => setLangState(l => (l === 'fr' ? 'en' : 'fr'));
  const setTheme = (t: Theme) => setThemeState(t);
  const toggleTheme = () => setThemeState(t => (t === 'light' ? 'dark' : 'light'));

  const addToCart = (id: string, size?: string, color?: string) => {
    setCart(c => {
      const existing = c.find(x => x.id === id && x.size === size && x.color === color);
      if (existing) return c.map(x => x === existing ? { ...x, qty: x.qty + 1 } : x);
      return [...c, { id, qty: 1, size, color }];
    });
    showToast(lang === 'fr' ? '✓ Ajouté au sac' : '✓ Added to bag');
  };
  const removeFromCart = (id: string) => setCart(c => c.filter(x => x.id !== id));
  const setQty = (id: string, qty: number) => {
    setCart(c => (qty <= 0 ? c.filter(x => x.id !== id) : c.map(x => (x.id === id ? { ...x, qty } : x))));
  };
  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartSubtotal = cart.reduce((s, i) => {
    const p = products.find(x => x.id === i.id);
    return s + (p ? p.price * i.qty : 0);
  }, 0);

  const toggleWish = (id: string) => setWish(w => (w.includes(id) ? w.filter(x => x !== id) : [...w, id]));

  const openBag = () => setBagOpen(true);
  const closeBag = () => setBagOpen(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const value: StoreValue = {
    lang, setLang, toggleLang,
    theme, setTheme, toggleTheme,
    cart, addToCart, removeFromCart, setQty, clearCart, cartCount, cartSubtotal,
    wish, toggleWish,
    bagOpen, openBag, closeBag,
    toast, showToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
