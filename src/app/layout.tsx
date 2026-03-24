import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, DM_Sans, JetBrains_Mono } from 'next/font/google';
import { getLocale, getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
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

export const metadata: Metadata = {
  metadataBase: new URL('https://zubairdeveloper.com'),
  title: {
    default: 'Zubair Hussain — Full Stack Developer',
    template: '%s | Zubair Hussain',
  },
  description:
    'Full Stack Developer (MERN, Next.js, React Native, AI) based in Hyderabad, Pakistan. Co-founder of Xovato. Building high-performance web & mobile applications.',
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
  authors: [{ name: 'Zubair Hussain', url: 'https://zubairdeveloper.com' }],
  creator: 'Zubair Hussain',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://zubairdeveloper.com',
    title: 'Zubair Hussain — Full Stack Developer',
    description:
      'MERN · Next.js · React Native · AI Integrations. Building digital experiences that convert.',
    siteName: 'Zubair Hussain Portfolio',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Zubair Hussain — Full Stack Developer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zubair Hussain — Full Stack Developer',
    description: 'MERN · Next.js · React Native · AI Integrations',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large' },
  },
  icons: {
    icon: '/icons/favicon.svg',
    apple: '/icons/icon-144x144.png',
    shortcut: '/icons/favicon.svg',
  },
  manifest: '/manifest.json',
  verification: {
    google: 'your-google-site-verification-code',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#050505' },
    { media: '(prefers-color-scheme: light)', color: '#f8f6f0' },
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
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${cormorant.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
        {/* Cloudflare Web Analytics */}
        <script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "YOUR_CLOUDFLARE_ANALYTICS_TOKEN"}'></script>
      </body>
    </html>
  );
}
