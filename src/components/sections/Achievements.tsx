'use client';

import { useRef, memo } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useCounter } from '@/hooks/useIntersection';
import { Trophy, Users, Star, Code2, Globe, Zap } from 'lucide-react';

const achievements = [
  { icon: Code2,   value: 50,  suffix: '+', label: 'Projects Delivered',    color: '#C9A84C' },
  { icon: Users,   value: 30,  suffix: '+', label: 'Happy Clients',         color: '#4ECDC4' },
  { icon: Star,    value: 5,   suffix: '.0★', label: 'Average Rating',      color: '#FFE66D' },
  { icon: Globe,   value: 8,   suffix: '+', label: 'Countries Served',      color: '#A8E6CF' },
  { icon: Trophy,  value: 4,   suffix: '+', label: 'Years Experience',      color: '#FF6B9D' },
  { icon: Zap,     value: 100, suffix: '%', label: 'Client Satisfaction',   color: '#C9A84C' },
];

const Counter = memo(function Counter({
  value, suffix, active
}: { value: number; suffix: string; active: boolean }) {
  const count = useCounter(value, 2200, active);
  return (
    <span className="text-4xl md:text-5xl font-black italic tracking-tighter text-white">
      {count}{suffix}
    </span>
  );
});

const AchievementCard = memo(function AchievementCard({
  icon: Icon, value, suffix, label, color, index, inView
}: typeof achievements[0] & { index: number; inView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="relative py-12 flex flex-col items-center text-center group"
    >
      <div className="absolute inset-0 bg-white/[0.02] scale-0 group-hover:scale-100 transition-transform duration-700 rounded-full blur-3xl pointer-events-none" />
      
      <div className="mb-6 relative">
        <Icon size={32} style={{ color }} className="opacity-40 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-40 transition-opacity" />
      </div>

      <Counter value={value} suffix={suffix} active={inView} />

      <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 group-hover:text-white/60 transition-colors mt-4">
        {label}
      </p>
    </motion.div>
  );
});

export default function Achievements() {
  const t = useTranslations('achievements');
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      id="achievements"
      ref={ref}
      className="py-24 md:py-32 lg:py-48 relative overflow-hidden bg-black"
      aria-labelledby="achievements-heading"
    >
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-24 text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="h-px w-8 bg-red-500/30" />
            <p className="text-xs font-mono tracking-[0.4em] uppercase text-red-500/60">
              {t('label')}
            </p>
            <span className="h-px w-8 bg-red-500/30" />
          </div>
          <h2 id="achievements-heading" className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter uppercase italic leading-none text-white overflow-hidden">
             Impact.
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 sm:gap-x-8 gap-y-10 sm:gap-y-16">
          {achievements.map((item, i) => (
            <AchievementCard key={item.label} {...item} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
