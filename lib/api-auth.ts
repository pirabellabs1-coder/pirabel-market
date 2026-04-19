import { NextResponse } from 'next/server';

/**
 * Gate for /api/v1/*: require a Bearer token equal to process.env.ADMIN_API_KEY.
 * Returns a NextResponse with 401 if the key is missing/invalid, otherwise null.
 */
export function requireApiKey(request: Request): NextResponse | null {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) {
    return NextResponse.json({ error: 'API key not configured on server' }, { status: 503 });
  }
  const header = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing Authorization: Bearer <key>' }, { status: 401 });
  }
  const provided = header.slice(7).trim();
  if (provided !== expected) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }
  return null;
}
