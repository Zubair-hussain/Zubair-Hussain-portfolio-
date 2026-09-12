import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Clock, Sparkles } from "lucide-react";
import Navigation from "@/components/ui/Navigation";
import Footer from "@/components/ui/Footer";
import ThemeProvider from "@/components/ui/ThemeProvider";
import DeferredClientTools from "@/components/ui/DeferredClientTools";
import { getBlogPageData, getPostBySlug, getRelatedPosts } from "@/lib/blog";
import { getSiteUrl } from "@/lib/site-url";
import { PROFILE } from "@/lib/zubair-profile";
import {
  jsonLd,
  metaDescription,
  readTimeToIsoDuration,
  topicTags,
} from "@/lib/seo";

// Refetch the Blogger feed at most every 30 min; unknown slugs 404.
export const revalidate = 1800;

interface PageProps {
  params: Promise<{ slug: string }>;
}

// BCP-47 → Open Graph locale, mirroring the root layout.
const openGraphLocales: Record<string, string> = {
  en: "en_US",
  ur: "ur_PK",
  es: "es_ES",
  hi: "hi_IN",
  ru: "ru_RU",
  de: "de_DE",
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const siteUrl = getSiteUrl();

  if (!post) {
    return {
      title: "Article not found",
      robots: { index: false, follow: false },
    };
  }

  const canonical = `${siteUrl}/blog/${post.slug}`;
  const title = post.seoTitle || post.title;
  const description = metaDescription(post.seoDescription || post.excerpt);
  const topics = topicTags(post.tags);
  const images = post.image
    ? [{ url: post.image, alt: post.title }]
    : [
        {
          url: `${siteUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ];
  const translationUrls = post.translations.map((translation) => [
    translation.lang,
    translation.url.startsWith("http")
      ? translation.url
      : `${siteUrl}${translation.url}`,
  ]);
  const englishUrl =
    post.lang === "en"
      ? canonical
      : translationUrls.find(([lang]) => lang === "en")?.[1];
  const languageAlternates = Object.fromEntries([
    [post.lang, canonical],
    ...translationUrls,
    // hreflang x-default only matters when the article exists in several languages.
    ...(translationUrls.length > 0 && englishUrl
      ? [["x-default", englishUrl]]
      : []),
  ]);

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords: post.seoKeywords,
    authors: [{ name: PROFILE.name, url: siteUrl }],
    creator: PROFILE.name,
    publisher: PROFILE.name,
    category: topics[0],
    alternates: {
      canonical,
      languages: languageAlternates,
    },
    openGraph: {
      type: "article",
      url: canonical,
      title,
      description,
      siteName: "Zubair Hussain Portfolio",
      locale: openGraphLocales[post.lang] ?? "en_US",
      publishedTime: post.isoDate || undefined,
      modifiedTime: post.isoUpdated || post.isoDate || undefined,
      authors: [siteUrl],
      section: topics[0],
      tags: topics.length ? topics : post.seoKeywords,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    other: {
      "twitter:label1": "Written by",
      "twitter:data1": PROFILE.name,
      "twitter:label2": "Reading time",
      "twitter:data2": post.readTime,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const { post, summaries: allPosts } = await getBlogPageData(slug);

  if (!post) notFound();

  const related = getRelatedPosts(post, allPosts, 3);
  const recent = allPosts
    .filter((item) => item.sourceUrl !== post.sourceUrl)
    .slice(0, 5);
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}/blog/${post.slug}`;
  const isRtl = post.lang === "ur";
  const wasUpdated =
    Boolean(post.isoUpdated) && post.isoUpdated !== post.isoDate;

  const topics = topicTags(post.tags);
  const timeRequired = readTimeToIsoDuration(post.readTime);
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${canonical}#article`,
    // Google truncates headlines past 110 characters in article rich results.
    headline:
      post.title.length > 110
        ? `${post.title.slice(0, 109).trimEnd()}…`
        : post.title,
    ...(post.seoTitle && post.seoTitle !== post.title
      ? { alternativeHeadline: post.seoTitle }
      : {}),
    description: post.seoDescription || post.excerpt,
    inLanguage: post.lang,
    datePublished: post.isoDate || undefined,
    dateModified: post.isoUpdated || post.isoDate || undefined,
    author: {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: PROFILE.name,
      url: siteUrl,
    },
    publisher: {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: PROFILE.name,
      url: siteUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
      url: canonical,
      name: post.seoTitle || post.title,
      isPartOf: { "@id": `${siteUrl}/#website` },
      breadcrumb: { "@id": `${canonical}#breadcrumb` },
      ...(related.length
        ? { relatedLink: related.map((item) => `${siteUrl}${item.url}`) }
        : {}),
    },
    isPartOf: {
      "@type": "Blog",
      "@id": `${siteUrl}/blog#blog`,
      url: `${siteUrl}/blog`,
    },
    url: canonical,
    // Google requires an image for Article rich results; fall back to the site card.
    image: [post.image || `${siteUrl}/opengraph-image`],
    keywords: post.seoKeywords.join(", "),
    ...(topics[0] ? { articleSection: topics[0] } : {}),
    ...(timeRequired ? { timeRequired } : {}),
    ...(post.translations.length
      ? {
          workTranslation: post.translations.map((translation) => ({
            "@type": "BlogPosting",
            inLanguage: translation.lang,
            url: translation.url.startsWith("http")
              ? translation.url
              : `${siteUrl}${translation.url}`,
          })),
        }
      : {}),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${canonical}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Articles",
        item: `${siteUrl}/blog`,
      },
      { "@type": "ListItem", position: 3, name: post.title, item: canonical },
    ],
  };

  return (
    <ThemeProvider>
      <Navigation />

      <main
        id="main-content"
        className="section-padding relative overflow-hidden"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(articleLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbLd) }}
        />

        <div className="container-custom">
          <Link
            href="/#articles"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--primary))]"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            All Articles
          </Link>

          <div className="mt-8 grid min-w-0 gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
            {/* ── Article body ── */}
            <article lang={post.lang} className="min-w-0">
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[hsl(var(--muted-foreground))]">
                {post.isoDate ? (
                  <time dateTime={post.isoDate}>{post.date}</time>
                ) : (
                  <span>{post.date}</span>
                )}
                <span
                  className="h-1 w-1 rounded-full bg-[hsl(var(--border))]"
                  aria-hidden="true"
                />
                <Clock size={11} aria-hidden="true" />
                <span>{post.readTime}</span>
                {wasUpdated && (
                  <>
                    <span
                      className="h-1 w-1 rounded-full bg-[hsl(var(--border))]"
                      aria-hidden="true"
                    />
                    <span>
                      Updated{" "}
                      <time dateTime={post.isoUpdated}>
                        {new Intl.DateTimeFormat("en", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        }).format(new Date(post.isoUpdated))}
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
                dir={isRtl ? "rtl" : "ltr"}
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
                {post.translations.length > 0 && (
                  <nav
                    aria-label="Article translations"
                    className="flex flex-wrap items-center gap-2"
                  >
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      Translations:
                    </span>
                    {post.translations.map((translation) => (
                      <a
                        key={`${translation.lang}-${translation.url}`}
                        href={translation.url}
                        hrefLang={translation.lang}
                        lang={translation.lang}
                        className="rounded-full border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-mono uppercase text-[hsl(var(--primary))] transition-colors hover:border-[hsl(var(--primary)/0.7)]"
                      >
                        {translation.lang}
                      </a>
                    ))}
                  </nav>
                )}
              </div>
            </article>

            {/* ── Sidebar: suggestions + most recent ── */}
            <aside className="min-w-0 flex flex-col gap-10">
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
                          <ArrowUpRight
                            size={14}
                            className="mt-0.5 shrink-0 text-[hsl(var(--primary))]"
                            aria-hidden="true"
                          />
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
