import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import Navigation from '@/components/ui/Navigation';
import Footer from '@/components/ui/Footer';
import ThemeProvider from '@/components/ui/ThemeProvider';
import DeferredClientTools from '@/components/ui/DeferredClientTools';
import { getSiteUrl } from '@/lib/site-url';
import { jsonLd } from '@/lib/seo';
import type { CreativeService } from '@/lib/creative-services';

const eyebrow = 'text-xs font-mono uppercase tracking-[0.3em] text-[hsl(var(--primary))]';
const heading = 'mt-4 font-display text-4xl font-light sm:text-5xl';
const muted = 'text-sm leading-relaxed text-[hsl(var(--muted-foreground))]';

export function creativeServiceMetadata(service: CreativeService): Metadata {
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}${service.path}`;
  const images = [{ url: `${siteUrl}/opengraph-image`, width: 1200, height: 630, alt: service.metaTitle }];

  return {
    metadataBase: new URL(siteUrl),
    title: service.metaTitle,
    description: service.metaDescription,
    keywords: service.keywords,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: canonical,
      title: `${service.metaTitle} | Zubair Hussain`,
      description: service.metaDescription,
      siteName: 'Zubair Hussain Portfolio',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${service.metaTitle} | Zubair Hussain`,
      description: service.metaDescription,
      images,
    },
    robots: { index: true, follow: true },
  };
}

export default function CreativeServicePage({ service, design }: { service: CreativeService; design: ReactNode }) {
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}${service.path}`;
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${canonical}#service`,
        name: service.metaTitle,
        serviceType: service.serviceType,
        description: service.metaDescription,
        url: canonical,
        provider: { '@id': `${siteUrl}/#person` },
        areaServed: [
          { '@type': 'City', name: 'Hyderabad, Sindh, Pakistan' },
          { '@type': 'Country', name: 'Pakistan' },
          'Worldwide',
        ],
        ...(service.plans && {
          offers: service.plans.map((plan) => ({
            '@type': 'Offer',
            name: `${plan.name} plan`,
            description: plan.summary,
            url: `${canonical}#plans`,
            availability: 'https://schema.org/InStock',
            priceSpecification: {
              '@type': 'PriceSpecification',
              minPrice: plan.price.replace('$', ''),
              priceCurrency: 'USD',
            },
          })),
        }),
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: service.eyebrow,
          itemListElement: service.offerings.map((item) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: item.title, description: item.text },
          })),
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${canonical}#faq`,
        mainEntity: service.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: service.eyebrow, item: canonical },
        ],
      },
    ],
  };

  return (
    <ThemeProvider>
      <Navigation />
      <main id="main-content" className="relative min-h-screen overflow-x-clip">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
        {design}
        <div className="container-custom pb-24">
          {/* Plain-language summary: who, what and where, for readers and AI answers. */}
          <section className="cv-auto mt-20 max-w-3xl">
            <p className={eyebrow}>At a glance</p>
            <h2 className={heading}>{service.metaTitle}</h2>
            <p className={`mt-6 ${muted}`}>{service.answer}</p>
          </section>
          <section className="cv-auto mt-20 max-w-3xl">
            <p className={eyebrow}>FAQ</p>
            <h2 className={heading}>Common questions</h2>
            <div className="mt-8 space-y-3">
              {service.faqs.map((faq) => (
                <details key={faq.q} className="glass rounded-xl p-5">
                  <summary className="cursor-pointer">{faq.q}</summary>
                  <p className={`mt-3 ${muted}`}>{faq.a}</p>
                </details>
              ))}
            </div>
          </section>
          <p className="mt-10">
            <Link href={service.related.href} className="btn-outline text-xs">{service.related.label}</Link>
          </p>
        </div>
      </main>
      <Footer />
      <DeferredClientTools />
    </ThemeProvider>
  );
}
