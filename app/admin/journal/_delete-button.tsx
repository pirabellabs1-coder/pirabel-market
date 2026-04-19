'use client';

import { useTransition } from 'react';
import { deleteJournalPost } from '../actions';

export function DeletePostButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      className="btn btn-outline btn-sm"
      style={{ borderColor: '#c56060', color: '#a63d2a' }}
      disabled={pending}
      onClick={() => {
        if (confirm('Supprimer cet article ?')) start(() => deleteJournalPost(id));
      }}
    >
      {pending ? '…' : 'Supprimer'}
    </button>
  );
}
