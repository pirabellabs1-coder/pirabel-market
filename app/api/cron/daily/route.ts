import { NextResponse } from 'next/server';

/**
 * Single daily cron (Vercel Hobby allows 1 cron/day).
 * Runs all background jobs sequentially and returns a summary.
 * Runs at 10:00 UTC = 11:00 Cotonou.
 */
export async function GET(request: Request) {
  const base = new URL(request.url);
  const origin = `${base.protocol}//${base.host}`;

  // Call each job endpoint in sequence; each is idempotent and already
  // filters by "only new since last run" via DB flags.
  const tasks = ['abandoned-cart', 'welcome-drip', 'stock-restock'];
  const results: Record<string, unknown> = {};

  for (const t of tasks) {
    try {
      const res = await fetch(`${origin}/api/cron/${t}`, { cache: 'no-store' });
      results[t] = await res.json().catch(() => ({ status: res.status }));
    } catch (e) {
      results[t] = { error: (e as Error).message };
    }
  }

  return NextResponse.json({ ran_at: new Date().toISOString(), ...results });
}
