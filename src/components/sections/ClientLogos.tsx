'use client';

import { useRef, memo } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';

const logos = [
  { name: 'Upwork',    abbr: 'UW',  color: '#14a800' },
  { name: 'Fiverr',   abbr: 'FVR', color: '#1dbf73' },
  { name: 'Vercel',   abbr: 'VCL', color: '#ffffff' },
  { name: 'MongoDB',  abbr: 'MDB', color: '#47a248' },
  { name: 'Stripe',   abbr: 'STR', color: '#635bff' },
  { name: 'Xovato',   abbr: 'XVT', color: '#C9A84C' },
  { name: 'OpenAI',   abbr: 'OAI', color: '#10a37f' },
  { name: 'Firebase', abbr: 'FB',  color: '#ffca28' },
  { name: 'AWS',      abbr: 'AWS', color: '#ff9900' },
  { name: 'Netlify',  abbr: 'NET', color: '#00d9ff' },
];

const LogoItem = memo(function LogoItem({
  name, abbr, color
}: {
  name: string; abbr: string; color: string;
}) {
  return (
    <div
      className="flex-shrink-0 flex items-center gap-3 px-8 py-4 glass rounded-xl mx-3 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-default"
      aria-label={name}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: `${color}20`, border: `1px solid ${color}40` }}
        aria-hidden="true"
      >
        <span className="text-xs font-mono font-bold" style={{ color }}>{abbr}</span>
      </div>
      <span className="text-sm font-body font-medium tracking-wide whitespace-nowrap">
        {name}
      </span>
    </div>
  );
});

export default function ClientLogos() {
  const t = useTranslations('logos');
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true });

  // Duplicate for seamless loop
  const doubled = [...logos, ...logos];

  return (
    <section
      ref={ref}
      className="py-16 relative overflow-hidden border-y border-[hsl(var(--border))]"
      aria-label="Client logos and technologies"
    >
      {/* Fade edges */}
      <div
        className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, hsl(var(--background)) 0%, transparent 100%)' }}
        aria-hidden="true"
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(-90deg, hsl(var(--background)) 0%, transparent 100%)' }}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.7 }}
        className="mb-8 text-center"
      >
        <p className="text-xs font-mono tracking-[0.3em] uppercase text-[hsl(var(--muted-foreground))]">
          {t('label')}
        </p>
      </motion.div>

      {/* Marquee track — GPU accelerated */}
      <div
        className="flex overflow-hidden"
        aria-hidden="true"  /* decorative, screen reader gets label from section */
      >
        <div
          className="marquee-track"
          style={{ willChange: 'transform' }}
        >
          {doubled.map((logo, i) => (
            <LogoItem key={`${logo.name}-${i}`} {...logo} />
          ))}
        </div>
      </div>
    </section>
  );
}
