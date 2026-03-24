'use client';

import { motion } from 'framer-motion';
import { Download, ArrowUpRight } from 'lucide-react';

interface HeroCTAProps {
  ctaPrimary: string;
  ctaSecondary: string;
}

const buttonVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function HeroCTA({ ctaPrimary, ctaSecondary }: HeroCTAProps) {
  const scrollToProjects = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.div
      className="flex flex-col xs:flex-row flex-wrap gap-3 sm:gap-4 pt-2"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
    >
      {/* ── Primary CTA ── */}
      <motion.a
        href="#projects"
        onClick={scrollToProjects}
        variants={buttonVariants}
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.97 }}
        aria-label={ctaPrimary}
        className="group relative flex items-center gap-2.5 px-8 py-3.5 rounded-full overflow-hidden transition-all duration-500"
        style={{
          background:
            'linear-gradient(135deg, rgba(220,20,30,0.18) 0%, rgba(180,10,20,0.08) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(220,40,50,0.35)',
          boxShadow:
            '0 0 0 1px rgba(220,40,50,0.1), 0 8px 40px rgba(200,20,30,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
          color: '#f5f4f0',
        }}
      >
        {/* Liquid shimmer on hover */}
        <span
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background:
              'linear-gradient(135deg, rgba(220,40,50,0.22) 0%, rgba(180,10,20,0.12) 50%, rgba(220,40,50,0.18) 100%)',
          }}
        />
        {/* Top glint */}
        <span
          className="absolute top-0 left-4 right-4 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
          }}
        />

        <span className="relative z-10 font-medium text-sm tracking-[0.08em] uppercase">
          {ctaPrimary}
        </span>
        <ArrowUpRight
          size={14}
          className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-red-400"
        />

        {/* Outer glow on hover */}
        <span
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ boxShadow: '0 0 28px rgba(200,20,30,0.45), 0 0 60px rgba(200,20,30,0.2)' }}
        />
      </motion.a>

      {/* ── Secondary CTA ── */}
      <motion.a
        href="/Zubair-Resume.pdf"
        download
        variants={buttonVariants}
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.97 }}
        aria-label="Download CV"
        className="group relative flex items-center gap-2.5 px-7 py-3.5 rounded-full overflow-hidden transition-all duration-500"
        style={{
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow:
            '0 0 0 1px rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
          color: 'rgba(245,244,240,0.7)',
        }}
      >
        <span
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              'linear-gradient(135deg, rgba(220,40,50,0.08) 0%, transparent 60%)',
          }}
        />
        <span
          className="absolute top-0 left-4 right-4 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(220,40,50,0.4), transparent)',
          }}
        />

        <Download
          size={13}
          className="relative z-10 text-red-500/70 group-hover:text-red-400 transition-all duration-300 group-hover:scale-110"
        />
        <span className="relative z-10 font-medium text-sm tracking-[0.08em] uppercase group-hover:text-white/90 transition-colors duration-300">
          {ctaSecondary}
        </span>

        <span
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ boxShadow: '0 0 20px rgba(200,20,30,0.15)' }}
        />
      </motion.a>
    </motion.div>
  );
}