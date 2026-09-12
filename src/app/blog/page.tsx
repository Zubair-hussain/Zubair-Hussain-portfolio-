import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Clock } from "lucide-react";
import Navigation from "@/components/ui/Navigation";
import Footer from "@/components/ui/Footer";
import ThemeProvider from "@/components/ui/ThemeProvider";
import DeferredClientTools from "@/components/ui/DeferredClientTools";
import { getAllPostSummaries } from "@/lib/blog";
import { getSiteUrl } from "@/lib/site-url";
import { PROFILE } from "@/lib/zubair-profile";
import { jsonLd, metaDescription } from "@/lib/seo";

export const revalidate = 1800;

const BLOG_TITLE = "Articles on Next.js, React Native & AI";
const BLOG_DESCRIPTION =
  "Practical Next.js, React Native and AI guides, real-world fixes and tech news explained simply by full-stack developer Zubair Hussain. Read the latest.";
const BLOG_SOCIAL_DESCRIPTION =
  "Practical Next.js, React Native and AI guides, real-world fixes and tech news explained simply by full-stack developer Zubair Hussain.";

export function generateMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}/blog`;
  const images = [
    {
      url: `${siteUrl}/opengraph-image`,
      width: 1200,
      height: 630,
      alt: "Articles by Zubair Hussain",
    },
  ];

  return {
    metadataBase: new URL(siteUrl),
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    keywords: [
      "Zubair Hussain blog",
      "Next.js tutorials",
      "React Native tutorials",
      "AI development",
      "full-stack development",
      "web development blog",
      "developer tools",
      "software engineering articles",
      "tech news explained",
    ],
    authors: [{ name: "Zubair Hussain", url: siteUrl }],
    alternates: {
      canonical,
      types: {
        "application/atom+xml": `${PROFILE.socials.blog}feeds/posts/default`,
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      title: `${BLOG_TITLE} | Zubair Hussain`,
      description: BLOG_SOCIAL_DESCRIPTION,
      siteName: "Zubair Hussain Portfolio",
      locale: "en_US",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: `${BLOG_TITLE} | Zubair Hussain`,
      description: BLOG_SOCIAL_DESCRIPTION,
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
      },
    },
  };
}

export default async function BlogIndexPage() {
  const posts = await getAllPostSummaries();
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}/blog`;

  const blogLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: `${BLOG_TITLE} | Zubair Hussain`,
        description: BLOG_DESCRIPTION,
        inLanguage: "en",
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#person` },
        mainEntity: { "@id": `${canonical}#blog` },
        breadcrumb: { "@id": `${canonical}#breadcrumb` },
      },
      {
        "@type": "Blog",
        "@id": `${canonical}#blog`,
        url: canonical,
        name: "Zubair Hussain — Articles",
        description: BLOG_DESCRIPTION,
        inLanguage: "en",
        author: { "@id": `${siteUrl}/#person` },
        publisher: { "@id": `${siteUrl}/#person` },
        blogPost: posts.slice(0, 50).map((post) => ({
          "@type": "BlogPosting",
          "@id": `${siteUrl}${post.url}#article`,
          url: `${siteUrl}${post.url}`,
          headline: post.title,
          description: metaDescription(post.seoDescription || post.excerpt),
          inLanguage: post.lang,
          datePublished: post.isoDate || undefined,
          dateModified: post.isoUpdated || post.isoDate || undefined,
          author: { "@id": `${siteUrl}/#person` },
          ...(post.image ? { image: post.image } : {}),
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "Articles",
            item: canonical,
          },
        ],
      },
    ],
  };

  return (
    <ThemeProvider>
      <Navigation />
      <main
        id="main-content"
        className="section-padding relative min-h-screen overflow-hidden"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(blogLd) }}
        />
        <div className="container-custom">
          <Link
            href="/#articles"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--primary))]"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Back to portfolio
          </Link>

          <header className="mt-10 max-w-3xl">
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-[hsl(var(--primary))]">
              Writing
            </p>
            <h1 className="mt-4 font-display text-5xl font-light sm:text-7xl">
              Articles
            </h1>
            <p className="mt-5 text-[hsl(var(--muted-foreground))]">
              Notes, tutorials and analysis on building modern products with
              web, mobile and AI technologies.
            </p>
          </header>

          {posts.length ? (
            <div className="mt-10 grid min-w-0 gap-5 sm:mt-14 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <article
                  key={post.sourceUrl}
                  className="glass glass-hover flex min-w-0 flex-col rounded-2xl p-5 sm:min-h-[290px] sm:p-7"
                >
                  <div className="flex items-center gap-3 text-xs font-mono text-[hsl(var(--muted-foreground))]">
                    <time dateTime={post.isoDate || undefined}>
                      {post.date}
                    </time>
                    <span aria-hidden="true">·</span>
                    <Clock size={12} aria-hidden="true" />
                    <span>{post.readTime}</span>
                  </div>
                  <h2 className="mt-5 break-words font-display text-xl font-light leading-snug sm:text-2xl">
                    {post.title}
                  </h2>
                  <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                    {post.excerpt}
                  </p>
                  <Link
                    href={post.url}
                    className="mt-auto flex items-center gap-2 border-t border-[hsl(var(--border))] pt-5 text-xs font-mono uppercase tracking-widest text-[hsl(var(--primary))]"
                  >
                    Read article <ArrowUpRight size={13} aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="glass mt-14 rounded-2xl p-8 text-[hsl(var(--muted-foreground))]">
              Articles are temporarily unavailable. Please check back shortly.
            </div>
          )}
        </div>
      </main>
      <Footer />
      <DeferredClientTools />
    </ThemeProvider>
  );
}
