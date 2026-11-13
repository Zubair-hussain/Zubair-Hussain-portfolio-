import { NextRequest, NextResponse } from 'next/server';

/**
 * Edge middleware: canonical-URL redirects + locale cookie.
 *
 * It lives in `src/` on purpose: with a `src/app` directory Next.js only picks
 * up this file from `src/`. The old root-level middleware.ts was silently
 * ignored, so www, http and workers.dev URLs were never redirected and Google
 * indexed every article several times.
 *
 * Kept as `middleware` (edge runtime) rather than Next 16's `proxy` (Node.js
 * runtime) because OpenNext's Cloudflare adapter only officially supports the
 * edge version; Node.js proxy is marked experimental there.
 *
 * Every non-canonical host or protocol gets ONE 301 to
 * https://zubairhussain.xyz with the same path and query.
 */

const validLocales = new Set(['en', 'ur', 'es', 'hi', 'ru', 'de']);
const CANONICAL_HOST = 'zubairhussain.xyz';
const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;

function canonicalRedirect(request: NextRequest): NextResponse | null {
  const hostname = request.nextUrl.hostname.toLowerCase();
  const path = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  const wrongHost = hostname === `www.${CANONICAL_HOST}` || hostname.endsWith('.workers.dev');
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const insecure =
    hostname === CANONICAL_HOST &&
    (forwardedProto === 'http' || (!forwardedProto && request.nextUrl.protocol === 'http:'));

  if (!wrongHost && !insecure) return null;
  return NextResponse.redirect(new URL(path, CANONICAL_ORIGIN), 301);
}

export function middleware(request: NextRequest) {
  const redirect = canonicalRedirect(request);
  if (redirect) return redirect;

  // robots.txt / sitemap.xml / llms.txt only need the host redirects above.
  if (request.nextUrl.pathname.includes('.')) return NextResponse.next();

  const lang = request.nextUrl.searchParams.get('lang');
  const cookieLocale = request.cookies.get('locale')?.value;
  const locale = lang && validLocales.has(lang)
    ? lang
    : cookieLocale && validLocales.has(cookieLocale)
      ? cookieLocale
      : 'en';

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale', locale);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.cookies.set('locale', locale, { path: '/', maxAge: 31536000, sameSite: 'lax' });
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)', '/robots.txt', '/sitemap.xml', '/llms.txt'],
};
