'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

const stats = [
  { key: 'years', value: '4+' },
  { key: 'projects', value: '50+' },
  { key: 'clients', value: '30+' },
  { key: 'rating', value: '5.0★' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 95,
      damping: 17,
      duration: 1,
    },
  },
};

const premiumHover = {
  hover: {
    scale: 1.05,
    y: -4,
    boxShadow: '0 0 40px rgba(239, 68, 68, 0.3), 0 0 80px rgba(225, 29, 72, 0.2)',
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export default function About() {
  const t = useTranslations('about');
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      id="about"
      ref={ref}
      className="relative w-full bg-black py-24 md:py-32 lg:py-36 overflow-hidden"
      aria-labelledby="about-heading"
    >
      {/* Deeper premium ambient glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-cyan-900/10 rounded-full blur-[200px] animate-pulse-slow" />
        <div className="absolute bottom-10 left-1/4 w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[240px] animate-pulse-slow delay-1000" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-60" />
      </div>

      <div className="relative z-10 container-custom mx-auto px-4 sm:px-6 md:px-12 lg:px-20 max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-20 xl:gap-24 items-center">

          {/* Clean premium photo (Left side) */}
          <motion.div
            initial={{ opacity: 0, x: -60, filter: 'blur(10px)' }}
            animate={isInView ? { opacity: 1, x: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative w-full max-w-[480px] mx-auto lg:mx-0 group"
          >
            <div className="relative overflow-visible transition-all duration-700">
              <div className="w-full aspect-[3/4] bg-gradient-to-br from-[#1a0505] to-[#050000] border border-red-500/10 rounded-2xl flex items-center justify-center overflow-hidden group-hover:border-red-500/30 group-hover:shadow-[0_0_40px_rgba(200,20,30,0.1)] transition-all duration-700 relative">
                <span className="text-6xl sm:text-8xl font-black text-red-500/5 font-display italic tracking-tighter group-hover:scale-110 transition-transform duration-700">ZH.</span>
                
                {/* Fallback image if file is added later */}
                <img 
                  src="/icons/icon-144x144.png" 
                  alt="Zubair Hussain"
                  className="absolute inset-0 w-full h-full object-contain p-10 opacity-0 transition-opacity duration-1000 grayscale-[0.2] group-hover:grayscale-0 group-hover:brightness-110"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  onLoad={(e) => { (e.target as HTMLImageElement).style.opacity = '1'; }}
                />
              </div>
            </div>
          </motion.div>

          {/* Right content (Text, Stats, Links) */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="lg:col-span-7 space-y-12 md:space-y-14 flex flex-col justify-center"
          >
            {/* Headers */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="h-px w-12 bg-red-500/50" />
                <p className="text-sm md:text-base font-mono tracking-[0.4em] uppercase text-red-500/80 font-medium">
                  {t('label')}
                </p>
              </div>
              <h2
                id="about-heading"
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter bg-gradient-to-br from-white to-red-500/40 bg-clip-text text-transparent uppercase italic leading-none mb-8 sm:mb-12"
              >
                {t('heading')}
              </h2>
            </motion.div>

            {/* Body */}
            <motion.div variants={itemVariants} className="space-y-6 sm:space-y-8 text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed text-white/70 font-light max-w-2xl">
              <p>{t('body')}</p>
              <p>{t('body2')}</p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8 pt-8 border-t border-red-500/15"
            >
              {stats.map((stat) => (
                <div key={stat.key} className="flex flex-col gap-2 group cursor-default">
                  <span className="text-4xl md:text-5xl font-light text-white group-hover:text-red-400 transition-colors duration-500">
                    {stat.value}
                  </span>
                  <span className="text-xs md:text-sm font-mono tracking-widest uppercase text-white/40 group-hover:text-white/70 transition-colors">
                    {t(stat.key as 'years' | 'projects' | 'clients' | 'rating')}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Call to Actions */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-6 pt-6">
              {[
                { href: 'https://www.upwork.com/freelancers/zubairdeveloper', label: 'Upwork Profile' },
                { href: 'https://xovato.com', label: 'Xovato Agency' },
              ].map((link) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover="hover"
                  variants={premiumHover}
                  className="group relative px-5 py-3 sm:px-8 sm:py-4 bg-[#0a0a0f] border border-red-500/30 hover:border-red-400/60 rounded-2xl text-red-50 font-mono text-[10px] sm:text-sm md:text-base uppercase tracking-widest flex items-center gap-3 shadow-lg overflow-hidden transition-colors"
                >
                  {/* Subtle sweep effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                  
                  <ExternalLink size={18} className="relative z-10 text-red-400 group-hover:text-red-300" />
                  <span className="relative z-10">{link.label}</span>
                </motion.a>
              ))}
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}