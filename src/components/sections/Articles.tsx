'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowUpRight, Clock, Newspaper, TrendingUp } from 'lucide-react';
import { PROFILE } from '@/lib/zubair-profile';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
  readTime: string;
  date: string;
  url: string;
  trending?: boolean;
}

const blogHomeArticle: Article = {
  id: 'blog-home',
  title: 'Zubair Blog Home',
  excerpt: 'Visit the main blog homepage for the complete collection of posts, research notes, tutorials, and future articles.',
  tags: ['Blog Home', 'All Posts'],
  readTime: 'Live',
  date: 'Home',
  url: PROFILE.socials.blog,
  trending: true,
};

const featuredArticles: Article[] = [
  {
    id: 'nextjs-15-performance',
    title: 'Achieving Lighthouse 100 with Next.js 15',
    excerpt: 'A deep dive into Server Components, image optimization, and bundle splitting strategies that push Lighthouse scores to perfection.',
    tags: ['Featured', 'Next.js', 'SEO'],
    readTime: '8 min',
    date: 'Dec 2024',
    url: 'https://zubair-hussain.github.io/Achieving-Lighthouse-100-with-Next.js-15/',
  },
  {
    id: 'ai-voice-agents',
    title: 'Building Production AI Voice Agents with Vapi',
    excerpt: 'How to integrate Vapi and Retell with OpenAI to create business-grade voice receptionists that integrate with CRMs and calendars.',
    tags: ['Featured', 'AI', 'Voice'],
    readTime: '10 min',
    date: 'Nov 2024',
    url: 'https://zubair-hussain.github.io/AI-Voice-Agents-with-Vapi/',
  },
  {
    id: 'react-native-performance',
    title: 'React Native Performance: 60fps on Low-End Devices',
    excerpt: 'Practical techniques for using Reanimated 3, FlatList optimization, and Hermes to squeeze 60fps out of any device.',
    tags: ['Featured', 'React Native'],
    readTime: '6 min',
    date: 'Oct 2024',
    url: 'https://zubair-hussain.github.io/FlatList-optimization-/',
  },
];

const fallbackArticles: Article[] = [blogHomeArticle, ...featuredArticles];

export default function Articles() {
  const t = useTranslations('articles');
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [articles, setArticles] = useState<Article[]>(fallbackArticles);

  useEffect(() => {
    let ignore = false;

    async function loadArticles() {
      try {
        const response = await fetch('/api/articles');
        if (!response.ok) return;

        const data = await response.json();
        const posts: Article[] = Array.isArray(data.posts) ? data.posts : [];
        const blogHome = typeof data.blogHome === 'string' ? data.blogHome : PROFILE.socials.blog;

        if (!ignore) {
          setArticles([
            {
              ...blogHomeArticle,
              excerpt: 'Open the main blog homepage for every current and upcoming article from Zubair.',
              url: blogHome,
              tags: ['Blog Home', `${posts.length || 4}+ Blog Posts`],
              trending: posts.length === 0,
            },
            ...posts,
            ...featuredArticles,
          ]);
        }
      } catch {
        if (!ignore) setArticles(fallbackArticles);
      }
    }

    loadArticles();

    return () => {
      ignore = true;
    };
  }, []);

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

            <a
              href={PROFILE.socials.blog}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex w-fit items-center gap-2 rounded-full border border-[hsl(var(--primary)/0.35)] px-5 py-3 text-xs font-mono uppercase tracking-widest text-[hsl(var(--primary))] transition-all duration-300 hover:border-[hsl(var(--primary)/0.7)] hover:bg-[hsl(var(--primary)/0.08)]"
            >
              <Newspaper size={14} aria-hidden="true" />
              Blog Home
              <ArrowUpRight size={12} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </a>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article, i) => (
            <motion.a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08, duration: 0.7 }}
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
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
