import { NextRequest, NextResponse } from 'next/server';

const validLocales = new Set(['en', 'ur', 'es', 'hi', 'ru', 'de']);

export function middleware(request: NextRequest) {
  const forwardedProto = request.headers.get('x-forwarded-proto');
  if (forwardedProto === 'http') {
    const secureUrl = request.nextUrl.clone();
    secureUrl.protocol = 'https:';
    return NextResponse.redirect(secureUrl, 308);
  }

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
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
