'use client';

import { useRef, memo } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowUpRight, BadgeDollarSign, CalendarClock, Check, Handshake } from 'lucide-react';
import { PROFILE } from '@/lib/zubair-profile';

const platformIcons = {
  fiverr: BadgeDollarSign,
  upwork: Handshake,
  direct: CalendarClock,
} as const;

type FreelanceProfile = (typeof PROFILE.freelanceProfiles)[number];

const ServiceCard = memo(function ServiceCard({
  profile,
  index,
  inView,
}: {
  profile: FreelanceProfile;
  index: number;
  inView: boolean;
}) {
  const Icon = platformIcons[profile.id as keyof typeof platformIcons] ?? Handshake;
  const isExternal = profile.href.startsWith('http');

  return (
    <motion.a
      href={profile.href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex min-h-[360px] flex-col overflow-hidden rounded-sm border border-white/10 bg-white/[0.025] p-7 transition-all duration-500 hover:-translate-y-1 hover:border-red-500/35 hover:bg-white/[0.04] sm:p-8"
      aria-label={`${profile.cta}: ${profile.label}`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.08] via-transparent to-white/[0.03] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative z-10 mb-8 flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-red-500/25 bg-red-500/10 text-red-300 transition-transform duration-500 group-hover:scale-105">
          <Icon size={23} aria-hidden="true" />
        </div>
        <ArrowUpRight
          size={18}
          className="text-white/25 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-red-300"
          aria-hidden="true"
        />
      </div>

      <div className="relative z-10">
        <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.28em] text-red-400/70">
          {profile.eyebrow}
        </p>
        <h3 className="mb-4 text-2xl font-black uppercase italic tracking-tight text-white transition-colors duration-300 group-hover:text-red-200">
          {profile.label}
        </h3>
        <p className="max-w-sm text-sm leading-relaxed text-white/50 sm:text-base">
          {profile.description}
        </p>
      </div>

      <ul className="relative z-10 my-8 flex flex-col gap-3" aria-label={`${profile.label} highlights`}>
        {profile.highlights.map((highlight) => (
          <li key={highlight} className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.22em] text-white/40">
            <Check size={13} className="shrink-0 text-red-400/70" aria-hidden="true" />
            {highlight}
          </li>
        ))}
      </ul>

      <div className="relative z-10 mt-auto flex items-center justify-between border-t border-white/10 pt-6">
        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/35">
          Platform terms
        </span>
        <span className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.24em] text-red-300">
          {profile.cta}
        </span>
      </div>
    </motion.a>
  );
});

export default function Services() {
  const t = useTranslations('services');
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      id="services"
      ref={ref}
      className="relative overflow-hidden bg-black py-24 md:py-32 lg:py-40"
      aria-labelledby="services-heading"
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(var(--brand-rgb),0.14),transparent_42%),radial-gradient(ellipse_at_bottom_left,rgba(var(--brand-rgb-3),0.12),transparent_38%)]" />

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-16 max-w-4xl md:mb-20"
        >
          <div className="mb-4 flex items-center gap-4">
            <span className="h-px w-12 bg-red-500/50" />
            <p className="text-sm font-mono font-medium uppercase tracking-[0.4em] text-red-500/80">
              {t('label')}
            </p>
          </div>
          <h2
            id="services-heading"
            className="text-5xl font-black uppercase italic leading-none tracking-tighter text-white sm:text-6xl md:text-7xl lg:text-8xl"
          >
            {t('heading')}
          </h2>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/45 sm:text-base">
            Hire through the platform that fits your workflow: Fiverr for published packages, Upwork for custom
            contracts, or a direct call for scope and quote clarity.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {PROFILE.freelanceProfiles.map((profile, i) => (
            <ServiceCard key={profile.id} profile={profile} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
