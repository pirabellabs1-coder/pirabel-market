'use client';
import { useTransition } from 'react';
import { deleteLookbook } from '../actions';

export function DeleteLookbookButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      className="btn btn-outline btn-sm"
      style={{ borderColor: '#c56060', color: '#a63d2a' }}
      disabled={pending}
      onClick={() => { if (confirm('Supprimer ce lookbook ?')) start(() => deleteLookbook(id)); }}
    >{pending ? '…' : 'Supprimer'}</button>
  );
}
