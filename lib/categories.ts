import type { Category } from './types';
import { img } from './format';

export const categories: Category[] = [
  { id: 'women', fr: 'Femme', en: 'Women', img: img('photo-1490481651871-ab68de25d43d', 900), count: 128 },
  { id: 'men', fr: 'Homme', en: 'Men', img: img('photo-1507680434567-5739c80be1ac', 900), count: 96 },
  { id: 'shoes', fr: 'Souliers', en: 'Shoes', img: img('photo-1549298916-b41d501d3772', 900), count: 64 },
  { id: 'eyewear', fr: 'Lunetterie', en: 'Eyewear', img: img('photo-1572635196237-14b3f281503f', 900), count: 42 },
  { id: 'kids', fr: 'Enfant', en: 'Children', img: img('photo-1558877385-81a1c7e67d72', 900), count: 38 },
  { id: 'accessories', fr: 'Accessoires', en: 'Accessories', img: img('photo-1511556820780-d912e42b4980', 900), count: 74 },
];
