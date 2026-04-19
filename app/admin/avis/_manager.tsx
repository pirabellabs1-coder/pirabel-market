'use client';

import { useTransition } from 'react';
import { approveReview, deleteReview } from '../actions';

type Review = {
  id: string; product_id: string; author_name: string;
  rating: number; title: string | null; body: string | null;
  approved: boolean; created_at: string;
};

export function ReviewsManager({ reviews }: { reviews: Review[] }) {
  const [pending, start] = useTransition();
  return (
    <div className="admin-card" style={{ padding: 0 }}>
      <table className="admin-table">
        <thead><tr><th>Date</th><th>Produit</th><th>Auteur</th><th>Note</th><th>Contenu</th><th>État</th><th></th></tr></thead>
        <tbody>
          {reviews.map(r => (
            <tr key={r.id}>
              <td className="mute" style={{ fontSize: 12 }}>{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
              <td className="mono mute" style={{ fontSize: 12 }}>{r.product_id}</td>
              <td>{r.author_name}</td>
              <td style={{ color: 'var(--gold)' }}>{'★'.repeat(r.rating)}<span style={{ color: 'var(--ink-faint)' }}>{'★'.repeat(5 - r.rating)}</span></td>
              <td style={{ maxWidth: 320 }}>
                {r.title && <div style={{ fontWeight: 500 }}>{r.title}</div>}
                {r.body && <div className="mute" style={{ fontSize: 12, lineHeight: 1.5, marginTop: 2 }}>{r.body.slice(0, 140)}{r.body.length > 140 ? '…' : ''}</div>}
              </td>
              <td><span className="admin-badge" style={{ background: r.approved ? 'var(--ivory-2)' : '#fff3cd', color: r.approved ? 'var(--ink)' : '#8b6100' }}>{r.approved ? 'Approuvé' : 'En attente'}</span></td>
              <td className="row gap-2">
                <button
                  className="btn btn-outline btn-sm"
                  disabled={pending}
                  onClick={() => start(() => approveReview(r.id, !r.approved))}
                >{r.approved ? 'Retirer' : 'Approuver'}</button>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ borderColor: '#c56060', color: '#a63d2a' }}
                  disabled={pending}
                  onClick={() => { if (confirm('Supprimer cet avis ?')) start(() => deleteReview(r.id)); }}
                >Supprimer</button>
              </td>
            </tr>
          ))}
          {reviews.length === 0 && (
            <tr><td colSpan={7} style={{ textAlign: 'center', padding: 60 }}><p className="mute">Aucun avis pour l&apos;instant.</p></td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
