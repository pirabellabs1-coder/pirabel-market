const U = 'https://images.unsplash.com/';

export function img(id: string, w = 900): string {
  return `${U}${id}?auto=format&fit=crop&w=${w}&q=85`;
}

export function fmt(price: number): string {
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
}
