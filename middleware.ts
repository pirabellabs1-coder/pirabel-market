import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Admin gate: hides /admin behind a secret URL (env var).
// Visiting /<ADMIN_GATE_SLUG> sets a signed cookie that unlocks /admin
// for 30 days. Without the cookie, /admin returns 404.
const GATE_COOKIE = 'pb_admin_gate';
const GATE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function computeGateToken(secret: string): Promise<string> {
  const data = new TextEncoder().encode(secret);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Buffer.from(hash).toString('base64url').slice(0, 32);
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const gateSlug = process.env.ADMIN_GATE_SLUG;
  const gateSecret = process.env.ADMIN_GATE_SECRET;

  // ============ ADMIN GATE ============
  if (gateSlug && gateSecret) {
    const gateToken = await computeGateToken(gateSecret);

    // Visiting the secret URL: set the gate cookie + redirect to login
    if (path === `/${gateSlug}`) {
      const redirect = NextResponse.redirect(new URL('/connexion?next=/admin', request.url));
      redirect.cookies.set(GATE_COOKIE, gateToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: GATE_MAX_AGE,
      });
      return redirect;
    }

    // /admin direct access: require the gate cookie, else 404
    if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
      const present = request.cookies.get(GATE_COOKIE)?.value;
      if (present !== gateToken) {
        return NextResponse.rewrite(new URL('/introuvable', request.url), { status: 404 });
      }
    }
  }

  // ============ SUPABASE SESSION ============
  let response = NextResponse.next({ request });
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (path.startsWith('/admin')) {
    if (!user) {
      const loginUrl = new URL('/connexion', request.url);
      loginUrl.searchParams.set('next', path);
      return NextResponse.redirect(loginUrl);
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle();
    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.svg|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
