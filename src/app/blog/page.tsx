import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Clock } from 'lucide-react';
import Navigation from '@/components/ui/Navigation';
import Footer from '@/components/ui/Footer';
import ThemeProvider from '@/components/ui/ThemeProvider';
import DeferredClientTools from '@/components/ui/DeferredClientTools';
import { getAllPostSummaries } from '@/lib/blog';
import { getSiteUrl } from '@/lib/site-url';

export const revalidate = 1800;

export function generateMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}/blog`;

  return {
    metadataBase: new URL(siteUrl),
    title: 'Articles',
    description: 'Articles by Zubair Hussain about full-stack development, Next.js, React Native, AI, developer tools and software engineering.',
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: canonical,
      title: 'Articles by Zubair Hussain',
      description: 'Practical writing about full-stack development, AI and modern software engineering.',
      siteName: 'Zubair Hussain Portfolio',
    },
    robots: { index: true, follow: true },
  };
}

export default async function BlogIndexPage() {
  const posts = await getAllPostSummaries();

  return (
    <ThemeProvider>
      <Navigation />
      <main id="main-content" className="section-padding relative min-h-screen overflow-hidden">
        <div className="container-custom">
          <Link
            href="/#articles"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--primary))]"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Back to portfolio
          </Link>

          <header className="mt-10 max-w-3xl">
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-[hsl(var(--primary))]">Writing</p>
            <h1 className="mt-4 font-display text-5xl font-light sm:text-7xl">Articles</h1>
            <p className="mt-5 text-[hsl(var(--muted-foreground))]">
              Notes, tutorials and analysis on building modern products with web, mobile and AI technologies.
            </p>
          </header>

          {posts.length ? (
            <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <article key={post.slug} className="glass glass-hover flex min-h-[290px] flex-col rounded-2xl p-7">
                  <div className="flex items-center gap-3 text-xs font-mono text-[hsl(var(--muted-foreground))]">
                    <time dateTime={post.isoDate || undefined}>{post.date}</time>
                    <span aria-hidden="true">·</span>
                    <Clock size={12} aria-hidden="true" />
                    <span>{post.readTime}</span>
                  </div>
                  <h2 className="mt-5 font-display text-2xl font-light leading-snug">{post.title}</h2>
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
