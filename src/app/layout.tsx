import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, DM_Sans, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import { getLocale, getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { PROFILE } from '@/lib/zubair-profile';
import { getSiteUrl } from '@/lib/site-url';
import '../styles/globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
  preload: true,
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
  preload: false,
});

const cloudflareAnalyticsToken = process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN;
const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const googleTagManagerId = process.env.NEXT_PUBLIC_GTM_ID;
const languageAlternates = {
  en: '/',
  ur: '/?lang=ur',
  es: '/?lang=es',
  hi: '/?lang=hi',
  ru: '/?lang=ru',
  de: '/?lang=de',
  'x-default': '/',
};

const openGraphLocales: Record<string, string> = {
  en: 'en_US',
  ur: 'ur_PK',
  es: 'es_ES',
  hi: 'hi_IN',
  ru: 'ru_RU',
  de: 'de_DE',
};


export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const siteUrl = getSiteUrl();
  const canonical = locale === 'en' ? '/' : `/?lang=${locale}`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: 'Zubair Hussain - Full Stack Developer',
      template: '%s | Zubair Hussain',
    },
    description:
      'Full Stack Developer (MERN, Next.js, React Native, AI) based in Hyderabad, Pakistan. Co-founder of Xovato. Building high-performance web and mobile applications.',
    alternates: {
      canonical,
      languages: languageAlternates,
    },
    keywords: [
      'Full Stack Developer',
      'MERN Stack',
      'Next.js Developer',
      'React Native',
      'AI Integration',
      'Freelancer',
      'Xovato',
      'Hyderabad Pakistan',
      'Web Developer',
      'Mobile App Developer',
    ],
    authors: [{ name: 'Zubair Hussain', url: siteUrl }],
    creator: 'Zubair Hussain',
    openGraph: {
      type: 'website',
      locale: openGraphLocales[locale] ?? 'en_US',
      url: canonical,
      title: 'Zubair Hussain - Full Stack Developer',
      description:
        'MERN, Next.js, React Native, AI Integrations. Building digital experiences that convert.',
      siteName: 'Zubair Hussain Portfolio',
      // OG image is generated dynamically by src/app/opengraph-image.tsx
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Zubair Hussain - Full Stack Developer',
      description: 'MERN, Next.js, React Native, AI Integrations',
      // Twitter image reuses the dynamic opengraph-image.
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large' },
    },
    icons: {
      icon: '/icons/favicon.svg',
      apple: '/icons/favicon.svg',
      shortcut: '/icons/favicon.svg',
    },
    manifest: '/manifest.json',
    // Only emit the verification tag when the code is actually configured,
    // so we never ship a bogus google-site-verification meta tag.
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
      : {}),
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#050505' },
    { media: '(prefers-color-scheme: light)', color: '#f6f2ea' },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const isRTL = locale === 'ur';

  return (
    <html
      lang={locale}
      dir={isRTL ? 'rtl' : 'ltr'}
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://portfolio-assets-sigma.vercel.app" />
        <link rel="preconnect" href="https://i.ytimg.com" />
        <link rel="me" href={PROFILE.socials.github} />
        <link rel="me" href={PROFILE.socials.linkedin} />
        <link rel="author" href={PROFILE.socials.blog} />
        <link rel="video_src" href={PROFILE.actions.introVideo.embedUrl} />

        {/* ── JSON-LD structured data (rich results / knowledge panel) ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Person',
                  '@id': `${getSiteUrl()}/#person`,
                  name: PROFILE.name,
                  alternateName: 'Zubair Hussain',
                  url: getSiteUrl(),
                  image: `${getSiteUrl()}/opengraph-image`,
                  jobTitle: PROFILE.role,
                  email: `mailto:${PROFILE.email}`,
                  description: PROFILE.tagline,
                  address: {
                    '@type': 'PostalAddress',
                    addressLocality: 'Hyderabad',
                    addressCountry: 'PK',
                  },
                  knowsAbout: Object.values(PROFILE.skills).flat(),
                  sameAs: [
                    PROFILE.socials.github,
                    PROFILE.socials.linkedin,
                    PROFILE.socials.blog,
                    PROFILE.socials.figma,
                    PROFILE.socials.fiverr,
                    PROFILE.socials.upwork,
                  ].filter(Boolean),
                },
                {
                  '@type': 'WebSite',
                  '@id': `${getSiteUrl()}/#website`,
                  url: getSiteUrl(),
                  name: 'Zubair Hussain — Portfolio',
                  description: PROFILE.tagline,
                  publisher: { '@id': `${getSiteUrl()}/#person` },
                  inLanguage: 'en',
                },
                {
                  '@type': 'ProfilePage',
                  '@id': `${getSiteUrl()}/#profilepage`,
                  url: getSiteUrl(),
                  name: `${PROFILE.name} — ${PROFILE.role}`,
                  isPartOf: { '@id': `${getSiteUrl()}/#website` },
                  about: { '@id': `${getSiteUrl()}/#person` },
                  inLanguage: 'en',
                },
              ],
            }),
          }}
        />
        {isRTL && (
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600&display=swap"
          />
        )}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'dark';
                  if (theme !== 'light') theme = 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {}
              })();
            `,
          }}
        />
        {(googleTagManagerId || googleAnalyticsId) && (
          <Script
            id="google-consent-mode"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                (function() {
                  var consent = 'denied';
                  try {
                    consent = localStorage.getItem('cookie-consent') === 'accepted' ? 'granted' : 'denied';
                  } catch(e) {}
                  gtag('consent', 'default', {
                    ad_storage: consent,
                    analytics_storage: consent,
                    ad_user_data: consent,
                    ad_personalization: consent,
                    functionality_storage: 'granted',
                    security_storage: 'granted',
                    wait_for_update: 500
                  });
                })();
              `,
            }}
          />
        )}
        {googleTagManagerId && (
          <Script
            id="google-tag-manager"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${googleTagManagerId}');
              `,
            }}
          />
        )}
        {googleAnalyticsId && (
          <>
            <Script
              id="google-analytics-src"
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${googleAnalyticsId}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body
        className={`${cormorant.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
      >
        {googleTagManagerId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
              title="Google Tag Manager"
            />
          </noscript>
        )}
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
        {cloudflareAnalyticsToken && (
          <Script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            strategy="lazyOnload"
            data-cf-beacon={JSON.stringify({ token: cloudflareAnalyticsToken })}
          />
        )}
      </body>
    </html>
  );
}
