import Link from 'next/link';

// Internal 404 target used by the admin gate rewrite.
// Looks identical to /not-found so the admin URL gives nothing away.
export default function NotFoundFallback() {
  return (
    <main className="container" style={{ padding: '120px 40px', textAlign: 'center' }}>
      <div className="section-eyebrow">404</div>
      <h1 className="serif" style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 400, margin: '16px 0 24px' }}>
        Page introuvable
      </h1>
      <p className="mute" style={{ maxWidth: 480, margin: '0 auto 40px' }}>
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link className="btn btn-outline" href="/">Retour à l&apos;accueil</Link>
    </main>
  );
}
