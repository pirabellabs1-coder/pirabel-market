import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendWelcomeEmail } from '@/lib/email';

/**
 * OAuth callback endpoint.
 * Supabase redirects here after Google/provider sign-in with a `code`
 * query param. We exchange it for a session cookie, then redirect
 * the user to their intended destination (default /compte).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/compte';
  const errorParam = searchParams.get('error_description') || searchParams.get('error');

  if (errorParam) {
    const loginUrl = new URL('/connexion', origin);
    loginUrl.searchParams.set('error', errorParam);
    return NextResponse.redirect(loginUrl);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const loginUrl = new URL('/connexion', origin);
      loginUrl.searchParams.set('error', error.message);
      return NextResponse.redirect(loginUrl);
    }

    // First-sign-in welcome email (OAuth new users)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const admin = createAdminClient();
        const { data: profile } = await admin
          .from('profiles')
          .select('welcomed_at')
          .eq('id', user.id)
          .maybeSingle();
        if (!profile?.welcomed_at) {
          const firstName = (user.user_metadata?.full_name as string | undefined)?.split(' ')[0]
            ?? (user.user_metadata?.name as string | undefined)?.split(' ')[0];
          sendWelcomeEmail(user.email, firstName).catch(e => console.error('[welcome oauth]', e));
          await admin.from('profiles').update({ welcomed_at: new Date().toISOString() }).eq('id', user.id);
        }
      }
    } catch (e) {
      console.error('[auth-callback welcome]', e);
    }
  }

  // Resolve "next" safely — only allow relative paths to prevent open redirect
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/compte';
  return NextResponse.redirect(new URL(safeNext, origin));
}
