import { NextRequest, NextResponse } from 'next/server';

const validLocales = new Set(['en', 'ur', 'es', 'hi', 'ru', 'de']);
const CANONICAL_ORIGIN = 'https://zubairhussain.xyz';

export function middleware(request: NextRequest) {
  const hostname = request.nextUrl.hostname.toLowerCase();

  // Old Cloudflare workers.dev URLs (e.g. zubair-hussain-portfolio.detroonshah.workers.dev)
  // permanently (301) redirect to the canonical domain so Google transfers them.
  if (hostname.endsWith('.workers.dev')) {
    const target = new URL(
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
      CANONICAL_ORIGIN,
    );
    return NextResponse.redirect(target, 301);
  }

  if (hostname === 'www.zubairhussain.xyz') {
    const canonicalUrl = request.nextUrl.clone();
    canonicalUrl.hostname = 'zubairhussain.xyz';
    canonicalUrl.protocol = 'https:';
    canonicalUrl.port = '';
    return NextResponse.redirect(canonicalUrl, 308);
  }

  const forwardedProto = request.headers.get('x-forwarded-proto');
  if (forwardedProto === 'http') {
    const secureUrl = request.nextUrl.clone();
    secureUrl.protocol = 'https:';
    return NextResponse.redirect(secureUrl, 308);
  }

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

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.cookies.set('locale', locale, {
    path: '/',
    maxAge: 31536000,
    sameSite: 'lax',
  });

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)', '/robots.txt', '/sitemap.xml', '/llms.txt'],
};
