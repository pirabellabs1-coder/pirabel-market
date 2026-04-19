export type Lang = 'fr' | 'en';

export type Translation = {
  name: string;
  desc?: string;
};

export type Color = {
  n: string;
  c: string;
};

export type Product = {
  id: string;
  category: string;
  collection: string;
  fr: Translation;
  en: Translation;
  price: number;
  old?: number;
  img: string;
  img2?: string;
  tag?: string;
  size?: string[];
  color?: Color[];
  stock?: number; // -1 = unlimited, 0 = out, >0 = remaining
};

export type Category = {
  id: string;
  fr: string;
  en: string;
  img: string;
  count: number;
};

export type CartItem = {
  id: string;
  qty: number;
  size?: string;
  color?: string;
};
