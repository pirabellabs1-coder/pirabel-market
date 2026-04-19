export function AdminSignOut() {
  return (
    <form action="/api/auth/signout" method="post" style={{ marginTop: 8 }}>
      <button type="submit" style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-mute)', padding: 0 }}>
        Déconnexion
      </button>
    </form>
  );
}
