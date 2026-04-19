import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSignOut } from './_components/sign-out';

export const metadata = {
  title: 'Admin · Pirabel',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/connexion?next=/admin');

  const { data: profile } = await sb.from('profiles').select('is_admin, first_name, last_name').eq('id', user.id).maybeSingle();
  if (!profile?.is_admin) redirect('/');

  const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || user.email;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="serif" style={{ fontSize: 22 }}>Pirabel</div>
          <div className="caps mute" style={{ fontSize: 9, marginTop: 2 }}>Admin</div>
        </div>
        <nav className="admin-nav">
          <Link href="/admin">Tableau de bord</Link>
          <Link href="/admin/produits">Produits</Link>
          <Link href="/admin/commandes">Commandes</Link>
          <Link href="/admin/categories">Catégories</Link>
          <Link href="/admin/clients">Clients</Link>
          <div style={{ height: 1, background: 'var(--line)', margin: '10px 12px' }}/>
          <Link href="/admin/journal">Journal</Link>
          <Link href="/admin/promos">Codes promo</Link>
          <Link href="/admin/popups">Popups</Link>
          <Link href="/admin/avis">Avis clients</Link>
          <Link href="/admin/newsletter">Newsletter</Link>
        </nav>
        <div style={{ marginTop: 'auto', padding: '20px 0', borderTop: '1px solid var(--line)' }}>
          <div className="caps mute" style={{ fontSize: 9 }}>Connecté en tant que</div>
          <div style={{ fontSize: 13, marginTop: 4, wordBreak: 'break-word' }}>{displayName}</div>
          <Link href="/" style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginTop: 12, display: 'inline-block' }}>← Voir la boutique</Link>
          <AdminSignOut/>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
