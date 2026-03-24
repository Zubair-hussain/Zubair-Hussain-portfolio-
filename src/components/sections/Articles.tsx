'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowUpRight, Clock } from 'lucide-react';

const articles = [
  {
    id: 'nextjs-15-performance',
    title: 'Achieving Lighthouse 100 with Next.js 15',
    excerpt: 'A deep dive into Server Components, image optimization, and bundle splitting strategies that push Lighthouse scores to perfection.',
    tags: ['Next.js', 'Performance', 'SEO'],
    readTime: '8 min',
    date: 'Dec 2024',
    url: 'https://zubair-hussain.github.io/Achieving-Lighthouse-100-with-Next.js-15/',
  },
  {
    id: 'ai-voice-agents',
    title: 'Building Production AI Voice Agents with Vapi',
    excerpt: 'How to integrate Vapi and Retell with OpenAI to create business-grade voice receptionists that integrate with CRMs and calendars.',
    tags: ['AI', 'Voice', 'Node.js'],
    readTime: '10 min',
    date: 'Nov 2024',
    url: 'https://zubair-hussain.github.io/AI-Voice-Agents-with-Vapi/',
  },
  {
    id: 'react-native-performance',
    title: 'React Native Performance: 60fps on Low-End Devices',
    excerpt: 'Practical techniques for using Reanimated 3, FlatList optimization, and Hermes to squeeze 60fps out of any device.',
    tags: ['React Native', 'Performance'],
    readTime: '6 min',
    date: 'Oct 2024',
    url: 'https://zubair-hussain.github.io/FlatList-optimization-/',
  },
];

export default function Articles() {
  const t = useTranslations('articles');
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

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
          <p className="text-xs font-mono tracking-[0.3em] uppercase text-[hsl(var(--primary))] mb-4">
            {t('label')}
          </p>
          <div className="section-divider" aria-hidden="true" />
          <h2 id="articles-heading" className="font-display font-light whitespace-pre-line">
            {t('heading')}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12, duration: 0.7 }}
              className="glass glass-hover rounded-2xl p-8 flex flex-col gap-4 group"
            >
              {/* Meta */}
              <div className="flex items-center gap-3 text-xs font-mono text-[hsl(var(--muted-foreground))]">
                <span>{article.date}</span>
                <span className="w-1 h-1 rounded-full bg-[hsl(var(--border))]" aria-hidden="true" />
                <Clock size={11} aria-hidden="true" />
                <span>{article.readTime}</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {article.tags.map((tag) => (
                  <span key={tag} className="text-xs font-mono text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)] px-2 py-0.5">
                    {tag}
                  </span>
                ))}
              </div>

              <h3 className="font-display text-xl font-light group-hover:text-[hsl(var(--primary))] transition-colors duration-200 flex-1">
                {article.title}
              </h3>

              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed line-clamp-3">
                {article.excerpt}
              </p>

              <a
                href={article.url}
                className="flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase text-[hsl(var(--primary))] hover:gap-3 transition-all duration-200 mt-auto pt-4 border-t border-[hsl(var(--border))]"
                aria-label={`Read article: ${article.title}`}
              >
                {t('read_more')}
                <ArrowUpRight size={12} aria-hidden="true" />
              </a>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
