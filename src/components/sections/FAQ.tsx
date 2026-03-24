'use client';

import { useState, useRef, memo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';

const faqs = [
  {
    q: 'What is your typical project timeline?',
    a: 'Most projects take 2–6 weeks depending on scope. A landing page or MVP is usually 1–2 weeks; a full SaaS platform can take 4–8 weeks. I always provide a detailed timeline in the proposal.',
  },
  {
    q: 'Do you offer post-launch support?',
    a: 'Yes — all projects include 2 weeks of free bug fixes after launch. I also offer monthly maintenance retainers covering updates, monitoring, and minor feature additions.',
  },
  {
    q: 'What is your payment structure?',
    a: '50% upfront and 50% on delivery for new clients. For returning clients and long-term projects, I offer milestone-based payments. All transactions are handled securely via Upwork or direct transfer.',
  },
  {
    q: 'Can you work in my timezone?',
    a: 'Absolutely. I regularly work with US and Australian clients and can accommodate EST, PST, and AEST timezone meetings. Async communication is also seamless through Slack or email.',
  },
  {
    q: 'Do you provide the source code?',
    a: 'Yes, full source code ownership transfers to you on final payment. I use private GitHub repositories and will add you as owner/collaborator. No vendor lock-in.',
  },
  {
    q: 'How do AI integrations work in my project?',
    a: 'I can embed OpenAI, Anthropic Claude, or local LLMs into any web or mobile app — chatbots, document analysis, voice agents, content generation, and more. These use your API keys so costs stay transparent.',
  },
  {
    q: 'Are your websites SEO-optimized?',
    a: 'Yes — every Next.js project is built with Lighthouse 100/100 in mind: server-side rendering, structured data, meta tags, Core Web Vitals optimization, and proper semantic HTML. SEO audits are available as an add-on.',
  },
];

const FAQItem = memo(function FAQItem({
  q, a, index, inView,
}: {
  q: string; a: string; index: number; inView: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.07, duration: 0.5 }}
      className="border-b border-[hsl(var(--border))]"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-6 py-6 text-left group focus-visible:outline-none"
        aria-expanded={open}
      >
        <span className="font-body font-medium group-hover:text-[hsl(var(--primary))] transition-colors duration-200">
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0 w-6 h-6 rounded-full border border-[hsl(var(--border))] flex items-center justify-center group-hover:border-[hsl(var(--primary))] group-hover:text-[hsl(var(--primary))] transition-colors duration-200"
        >
          <Plus size={12} aria-hidden="true" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="accordion-content"
          >
            <p className="pb-6 text-[hsl(var(--muted-foreground))] leading-relaxed text-sm">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default function FAQ() {
  const t = useTranslations('faq');
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      id="faq"
      ref={ref}
      className="section-padding relative overflow-hidden"
      aria-labelledby="faq-heading"
    >
      <div className="container-custom">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-16 xl:gap-24">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="lg:sticky lg:top-28 lg:self-start"
          >
            <p className="text-xs font-mono tracking-[0.3em] uppercase text-[hsl(var(--primary))] mb-4">
              {t('label')}
            </p>
            <div className="section-divider" aria-hidden="true" />
            <h2 id="faq-heading" className="font-display font-light whitespace-pre-line mb-6">
              {t('heading')}
            </h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
              Can&apos;t find your answer? Feel free to{' '}
              <a
                href="#contact"
                className="text-[hsl(var(--primary))] underline underline-offset-4"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                reach out directly
              </a>
              .
            </p>
          </motion.div>

          {/* Right */}
          <div aria-label="Frequently asked questions list">
            {faqs.map((faq, i) => (
              <FAQItem key={faq.q} {...faq} index={i} inView={inView} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
