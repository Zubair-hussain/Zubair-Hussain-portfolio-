'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight, ArrowUpRight, Clock, Newspaper, TrendingUp } from 'lucide-react';

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
  readTime: string;
  date: string;
  /** Internal reader path (/blog/[slug]) or an external URL. */
  url: string;
  trending?: boolean;
}

// Show 3 articles per page; clicking 2, 3, … reveals the next 3, and new posts
// simply add more pages automatically.
const PER_PAGE = 3;

// Shown only when the live blog can't be reached, so the section is never empty.
const blogHomeFallback: Article = {
  id: 'blog-home',
  title: 'Zubair Blog Home',
  excerpt: 'Visit the main blog homepage for the complete collection of posts, research notes, tutorials, and future articles.',
  tags: ['Blog Home', 'All Posts'],
  readTime: 'Live',
  date: 'Home',
  url: '/blog',
  trending: true,
};

/** Internal reader links stay on-site; external links open in a new tab. */
const isInternal = (url: string) => url.startsWith('/');

export default function Articles({ initialArticles = [] }: { initialArticles?: Article[] }) {
  const t = useTranslations('articles');
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [articles, setArticles] = useState<Article[]>(initialArticles.length ? initialArticles : [blogHomeFallback]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let ignore = false;

    async function loadArticles() {
      try {
        const response = await fetch('/api/articles');
        if (!response.ok) return;

        const data = await response.json();
        const posts: Article[] = Array.isArray(data.posts) ? data.posts : [];

        // Only real, on-site (OG-tagged) blog posts are listed; if the feed is
        // empty, keep the single "Blog Home" fallback so the grid isn't blank.
        if (!ignore) setArticles(posts.length ? posts : [blogHomeFallback]);
      } catch {
        if (!ignore) setArticles([blogHomeFallback]);
      }
    }

    loadArticles();

    return () => {
      ignore = true;
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(articles.length / PER_PAGE));

  const activePage = Math.min(page, totalPages);

  const pageArticles = useMemo(() => {
    const start = (activePage - 1) * PER_PAGE;
    return articles.slice(start, start + PER_PAGE);
  }, [activePage, articles]);

  const goTo = (next: number) => {
    setPage(Math.min(Math.max(1, next), totalPages));
    ref.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      id="articles"
      ref={ref}
      className="section-padding relative overflow-hidden"
      aria-labelledby="articles-heading"
    >
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-mono tracking-[0.3em] uppercase text-[hsl(var(--primary))] mb-4">
                {t('label')}
              </p>
              <div className="section-divider" aria-hidden="true" />
              <h2 id="articles-heading" className="font-display font-light whitespace-pre-line">
                {t('heading')}
              </h2>
            </div>

            <Link
              href="/blog"
              className="group inline-flex w-fit items-center gap-2 rounded-full border border-[hsl(var(--primary)/0.35)] px-5 py-3 text-xs font-mono uppercase tracking-widest text-[hsl(var(--primary))] transition-all duration-300 hover:border-[hsl(var(--primary)/0.7)] hover:bg-[hsl(var(--primary)/0.08)]"
            >
              <Newspaper size={14} aria-hidden="true" />
              Blog Home
              <ArrowUpRight size={12} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </Link>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {pageArticles.map((article, i) => {
            const internal = isInternal(article.url);
            const linkProps = internal
              ? { href: article.url }
              : { href: article.url, target: '_blank', rel: 'noopener noreferrer' };
            const Card = internal ? motion(Link) : motion.a;

            return (
              <Card
                key={article.id}
                {...linkProps}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="glass glass-hover rounded-2xl p-8 flex min-h-[300px] flex-col gap-4 group cursor-pointer"
                aria-label={`Open article: ${article.title}`}
              >
                <div className="flex items-center justify-between gap-3 text-xs font-mono text-[hsl(var(--muted-foreground))]">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="truncate">{article.date}</span>
                    <span className="h-1 w-1 shrink-0 rounded-full bg-[hsl(var(--border))]" aria-hidden="true" />
                    <Clock size={11} className="shrink-0" aria-hidden="true" />
                    <span className="whitespace-nowrap">{article.readTime}</span>
                  </div>
                  {article.trending && (
                    <span className="inline-flex shrink-0 items-center gap-1 text-[10px] uppercase tracking-widest text-[hsl(var(--primary))]">
                      <TrendingUp size={11} aria-hidden="true" />
                      Trending
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {article.tags.map((tag) => (
                    <span key={tag} className="text-xs font-mono text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)] px-2 py-0.5">
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className="font-display text-xl font-light group-hover:text-[hsl(var(--primary))] transition-colors duration-200">
                  {article.title}
                </h3>

                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed line-clamp-4">
                  {article.excerpt || 'Open this article on the blog to read the full post.'}
                </p>

                <span className="flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase text-[hsl(var(--primary))] group-hover:gap-3 transition-all duration-200 mt-auto pt-4 border-t border-[hsl(var(--border))]">
                  {article.id === 'blog-home' ? 'Open Blog' : t('read_more')}
                  <ArrowUpRight size={12} aria-hidden="true" />
                </span>
              </Card>
            );
          })}
        </div>

        {totalPages > 1 && (
          <nav
            className="mt-12 flex items-center justify-center gap-2"
            aria-label="Article pages"
          >
            <button
              type="button"
              onClick={() => goTo(activePage - 1)}
              disabled={activePage === 1}
              aria-label="Previous page"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--border))] text-[hsl(var(--foreground))] transition-all hover:border-[hsl(var(--primary)/0.7)] hover:text-[hsl(var(--primary))] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft size={16} aria-hidden="true" />
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => {
              const active = number === activePage;
              return (
                <button
                  key={number}
                  type="button"
                  onClick={() => goTo(number)}
                  aria-label={`Page ${number}`}
                  aria-current={active ? 'page' : undefined}
                  className={`inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-full border px-3 text-sm font-mono transition-all ${
                    active
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]'
                      : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/0.7)] hover:text-[hsl(var(--primary))]'
                  }`}
                >
                  {number}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => goTo(activePage + 1)}
              disabled={activePage === totalPages}
              aria-label="Next page"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--border))] text-[hsl(var(--foreground))] transition-all hover:border-[hsl(var(--primary)/0.7)] hover:text-[hsl(var(--primary))] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}
