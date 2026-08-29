import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

const validLocales = ['en', 'ur', 'es', 'hi', 'ru', 'de'];

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const locale = headerStore.get('x-locale') ?? cookieStore.get('locale')?.value ?? 'en';
  const resolvedLocale = validLocales.includes(locale) ? locale : 'en';

  return {
    locale: resolvedLocale,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default,
  };
});
