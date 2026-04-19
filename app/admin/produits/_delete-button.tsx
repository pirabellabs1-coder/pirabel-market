'use client';

import { useTransition } from 'react';
import { deleteProduct } from '../actions';

export function DeleteProductButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      className="btn btn-outline btn-sm"
      style={{ borderColor: '#c56060', color: '#a63d2a' }}
      disabled={pending}
      onClick={() => {
        if (confirm('Supprimer ce produit ?')) start(() => deleteProduct(id));
      }}
    >
      {pending ? '…' : 'Supprimer'}
    </button>
  );
}
