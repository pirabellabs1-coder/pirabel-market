'use client';
import { useTransition } from 'react';
import { deletePromo } from '../actions';

export function DeletePromoButton({ code }: { code: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      className="btn btn-outline btn-sm"
      style={{ borderColor: '#c56060', color: '#a63d2a' }}
      disabled={pending}
      onClick={() => { if (confirm(`Supprimer le code ${code} ?`)) start(() => deletePromo(code)); }}
    >{pending ? '…' : 'Supprimer'}</button>
  );
}
