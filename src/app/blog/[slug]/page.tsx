import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Clock, Sparkles } from 'lucide-react';
import Navigation from '@/components/ui/Navigation';
import Footer from '@/components/ui/Footer';
import ThemeProvider from '@/components/ui/ThemeProvider';
import DeferredClientTools from '@/components/ui/DeferredClientTools';
import { getAllPostSummaries, getPostBySlug, getRelatedPosts } from '@/lib/blog';
import { getSiteUrl } from '@/lib/site-url';
import { PROFILE } from '@/lib/zubair-profile';

// Refetch the Blogger feed at most every 30 min; unknown slugs 404.
export const revalidate = 1800;

interface PageProps {
  params: Promise<{ slug: string }>;
}

// BCP-47 → Open Graph locale, mirroring the root layout.
const openGraphLocales: Record<string, string> = {
  en: 'en_US',
  ur: 'ur_PK',
  es: 'es_ES',
  hi: 'hi_IN',
  ru: 'ru_RU',
  de: 'de_DE',
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const siteUrl = getSiteUrl();

  if (!post) {
    return {
      title: 'Article not found',
      robots: { index: false, follow: false },
    };
  }

  const canonical = `${siteUrl}/blog/${post.slug}`;
  const images = post.image ? [{ url: post.image }] : [`${siteUrl}/opengraph-image`];

  return {
    metadataBase: new URL(siteUrl),
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: PROFILE.name, url: siteUrl }],
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'article',
      url: canonical,
      title: post.title,
      description: post.excerpt,
      siteName: 'Zubair Hussain Portfolio',
      locale: openGraphLocales[post.lang] ?? 'en_US',
      publishedTime: post.isoDate || undefined,
      modifiedTime: post.isoUpdated || post.isoDate || undefined,
      authors: [PROFILE.name],
      tags: post.tags,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([getPostBySlug(slug), getAllPostSummaries()]);

  if (!post) notFound();

  const related = getRelatedPosts(post, allPosts, 3);
  const recent = allPosts.filter((item) => item.slug !== post.slug).slice(0, 5);
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}/blog/${post.slug}`;
  const isRtl = post.lang === 'ur';
  const wasUpdated = Boolean(post.isoUpdated) && post.isoUpdated !== post.isoDate;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    inLanguage: post.lang,
    datePublished: post.isoDate || undefined,
    dateModified: post.isoUpdated || post.isoDate || undefined,
    author: { '@type': 'Person', name: PROFILE.name, url: siteUrl },
    publisher: { '@type': 'Person', name: PROFILE.name },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    url: canonical,
    keywords: post.tags.join(', '),
    ...(post.image ? { image: post.image } : {}),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Articles', item: `${siteUrl}/#articles` },
      { '@type': 'ListItem', position: 3, name: post.title, item: canonical },
    ],
  };

  return (
    <ThemeProvider>
      <Navigation />

      <main id="main-content" className="section-padding relative overflow-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />

        <div className="container-custom">
          <Link
            href="/#articles"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--primary))]"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            All Articles
          </Link>

          <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* ── Article body ── */}
            <article lang={post.lang}>
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[hsl(var(--muted-foreground))]">
                {post.isoDate ? (
                  <time dateTime={post.isoDate}>{post.date}</time>
                ) : (
                  <span>{post.date}</span>
                )}
                <span className="h-1 w-1 rounded-full bg-[hsl(var(--border))]" aria-hidden="true" />
                <Clock size={11} aria-hidden="true" />
                <span>{post.readTime}</span>
                {wasUpdated && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-[hsl(var(--border))]" aria-hidden="true" />
                    <span>
                      Updated{' '}
                      <time dateTime={post.isoUpdated}>
                        {new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit', year: 'numeric' }).format(
                          new Date(post.isoUpdated)
                        )}
                      </time>
                    </span>
                  </>
                )}
              </div>

              <h1 className="mt-4 font-display text-3xl font-light leading-tight sm:text-4xl">
                {post.title}
              </h1>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-mono text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)] px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="section-divider my-8" aria-hidden="true" />

              <div
                className="blog-content"
                lang={post.lang}
                dir={isRtl ? 'rtl' : 'ltr'}
                // Content is Zubair's own Blogger post, sanitized in src/lib/blog.ts.
                dangerouslySetInnerHTML={{ __html: post.contentHtml }}
              />

              <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-[hsl(var(--border))] pt-8">
                <a
                  href={post.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary)/0.35)] px-5 py-3 text-xs font-mono uppercase tracking-widest text-[hsl(var(--primary))] transition-all duration-300 hover:border-[hsl(var(--primary)/0.7)] hover:bg-[hsl(var(--primary)/0.08)]"
                >
                  View original on Blogger
                  <ArrowUpRight
                    size={12}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </article>

            {/* ── Sidebar: suggestions + most recent ── */}
            <aside className="flex flex-col gap-10">
              {related.length > 0 && (
                <section>
                  <h2 className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.3em] text-[hsl(var(--primary))]">
                    <Sparkles size={13} aria-hidden="true" />
                    Suggestions
                  </h2>
                  <div className="mt-5 flex flex-col gap-4">
                    {related.map((item) => (
                      <Link
                        key={item.slug}
                        href={item.url}
                        className="glass glass-hover rounded-xl p-5 group"
                      >
                        <p className="text-xs font-mono text-[hsl(var(--muted-foreground))]">
                          {item.date} · {item.readTime}
                        </p>
                        <h3 className="mt-2 font-display text-lg font-light leading-snug group-hover:text-[hsl(var(--primary))] transition-colors">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">
                          {item.excerpt}
                        </p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {recent.length > 0 && (
                <section>
                  <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-[hsl(var(--primary))]">
                    Most Recent
                  </h2>
                  <ul className="mt-5 flex flex-col divide-y divide-[hsl(var(--border))]">
                    {recent.map((item) => (
                      <li key={item.slug}>
                        <Link
                          href={item.url}
                          className="flex items-start gap-3 py-3 text-sm text-[hsl(var(--foreground)/0.85)] transition-colors hover:text-[hsl(var(--primary))]"
                        >
                          <ArrowUpRight size={14} className="mt-0.5 shrink-0 text-[hsl(var(--primary))]" aria-hidden="true" />
                          <span className="leading-snug">{item.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </aside>
          </div>
        </div>
      </main>

      <Footer />
      <DeferredClientTools />
    </ThemeProvider>
  );
}
