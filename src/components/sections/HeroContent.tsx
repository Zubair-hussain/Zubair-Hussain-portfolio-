'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';
const AvatarSequence = dynamic(() => import('@/components/3d/AvatarSequence'), { ssr: false });
import HeroCTA from './HeroCTA';

interface HeroContentProps {
  t: {
    available: string;
    greeting: string;
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  tags: string[];
  stats: { value: string; label: string }[];
}

/* ── Stagger container ── */
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const fadeRise = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.4, ease: 'easeOut' } },
};

export default function HeroContent({ t, tags, stats }: HeroContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  /* Scroll-linked transforms */
  const avatarOpacity  = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const avatarScale    = useTransform(scrollYProgress, [0, 0.35], [1, 0.88]);
  const contentY       = useTransform(scrollYProgress, [0, 0.4],  [0, -90]);
  const bgOpacity      = useTransform(scrollYProgress, [0, 0.4],  [1, 0]);
  const manifestoY     = useTransform(scrollYProgress, [0.3, 0.7],[80, 0]);
  const manifestoOp    = useTransform(scrollYProgress, [0.3, 0.6],[0, 1]);

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: 'clamp(200vh, 260vh, 260vh)' }}>

      {/* ══════════════════════════════════════
          STICKY HERO VIEWPORT
      ══════════════════════════════════════ */}
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden pt-[90px] sm:pt-20 lg:pt-28">

        {/* ── Atmospheric red glow layers ── */}
        <motion.div style={{ opacity: bgOpacity }} className="absolute inset-0 z-0 pointer-events-none">
          {/* Bottom red ember */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px]"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 110%, rgba(200,20,30,0.38) 0%, transparent 68%)',
            }}
          />
          {/* Left ambient */}
          <div
            className="absolute bottom-0 left-0 w-[55%] h-[70%]"
            style={{
              background: 'radial-gradient(ellipse 60% 70% at 0% 100%, rgba(180,15,25,0.2) 0%, transparent 60%)',
            }}
          />
          {/* Right ambient */}
          <div
            className="absolute bottom-0 right-0 w-[55%] h-[70%]"
            style={{
              background: 'radial-gradient(ellipse 60% 70% at 100% 100%, rgba(180,15,25,0.15) 0%, transparent 60%)',
            }}
          />
          {/* Subtle top vignette */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 35%, rgba(0,0,0,0.65) 100%)',
            }}
          />
        </motion.div>

        {/* ── 3D Avatar — completely untouched ── */}
        <motion.div
          style={{ opacity: avatarOpacity, scale: avatarScale }}
          className="relative z-10 w-full max-w-[95vw] md:max-w-[80vw] lg:max-w-[70vw] flex items-center justify-center"
        >
          <div className="w-full relative flex items-center justify-center">
            <AvatarSequence />
          </div>
        </motion.div>

        {/* ── Floating content overlay ── */}
        <motion.div
          style={{ y: contentY }}
          className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-4 sm:p-8 md:p-14 lg:p-20 pt-[85px] sm:pt-8"
        >
          {/* ── TOP: headline block ── */}
          <motion.div
            className="flex justify-between items-start mt-4 sm:mt-10 md:mt-16 pointer-events-auto"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Left column */}
            <div className="max-w-[85vw] sm:max-w-xl lg:max-w-2xl space-y-4">
              
              {/* Status badge */}
              <motion.div variants={fadeRise} className="flex items-center gap-3 mb-1">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full bg-red-500"
                  style={{ boxShadow: '0 0 6px rgba(220,40,50,0.9), 0 0 14px rgba(200,20,30,0.5)' }}
                />
                <span className="text-red-500/75 text-[10px] font-mono tracking-[0.4em] uppercase font-semibold">
                  {t.available}
                </span>
              </motion.div>

              {/* H1 — cinematic italic headline */}
              <motion.h1
                variants={fadeRise}
                className="font-black tracking-tighter uppercase leading-[0.83] select-none"
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: 'clamp(3.8rem, 9vw, 9.5rem)',
                  fontStyle: 'italic',
                  color: '#f5f4f0',
                  textShadow:
                    '0 0 80px rgba(200,20,30,0.18), 0 2px 0 rgba(0,0,0,0.5)',
                  letterSpacing: '-0.04em',
                }}
              >
                {t.title}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={fadeRise}
                className="text-white/35 text-[10px] sm:text-xs font-mono uppercase tracking-[0.38em] ml-0.5"
              >
                {t.subtitle}
              </motion.p>

              {/* Tags row */}
              <motion.div variants={fadeRise} className="flex flex-wrap gap-2 pt-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] font-mono tracking-[0.2em] uppercase px-3 py-1 rounded-full pointer-events-auto"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      color: 'rgba(245,244,240,0.45)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div variants={fadeRise} className="pointer-events-auto pt-4">
                <HeroCTA ctaPrimary={t.ctaPrimary} ctaSecondary={t.ctaSecondary} />
              </motion.div>
            </div>

            {/* Right column — mono info block */}
            <motion.div
              variants={fadeIn}
              className="hidden md:flex flex-col items-end gap-2 text-right font-mono text-[9px] tracking-[0.22em] text-white/18 uppercase mt-2"
            >
              <span>{t.greeting}</span>
              <span
                className="w-8 h-px"
                style={{ background: 'rgba(200,20,30,0.4)' }}
              />
              <span>Frame_Rate : 60fps</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════
          MANIFESTO / PROMPT SECTION
          (scroll-triggered)
      ══════════════════════════════════════ */}
      <div className="relative z-30 w-full flex flex-col items-center justify-center overflow-hidden py-32">

        {/* Dark gradient transition from hero */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(3,4,8,0.98) 40%, rgba(3,4,8,1) 100%)',
          }}
        />

        {/* Deep red floor glow */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[50%] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 90% 70% at 50% 100%, rgba(180,10,20,0.32) 0%, transparent 65%)',
          }}
        />

        {/* Vertical red line separator */}
        <motion.div
          style={{ opacity: manifestoOp }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 pointer-events-none"
        >
          <div
            className="w-px h-full"
            style={{
              background: 'linear-gradient(to bottom, transparent, rgba(200,20,30,0.55), rgba(200,20,30,0.2))',
            }}
          />
        </motion.div>

        {/* Manifesto card */}
        <motion.div
          style={{ y: manifestoY, opacity: manifestoOp }}
          className="relative z-10 flex flex-col items-center px-6 max-w-4xl w-full"
        >
          {/* Section label */}
          <div className="flex items-center gap-4 mb-12">
            <span
              className="h-px w-10"
              style={{ background: 'rgba(200,20,30,0.4)' }}
            />
            <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-red-600/65">
              Manifesto
            </span>
            <span
              className="h-px w-10"
              style={{ background: 'rgba(200,20,30,0.4)' }}
            />
          </div>

          {/* The glowing card */}
          <div
            className="relative w-full rounded-sm px-5 py-8 sm:px-10 sm:py-14 md:px-16 md:py-16 text-center overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.014)',
              border: '1px solid rgba(200,20,30,0.18)',
              boxShadow:
                '0 0 0 1px rgba(200,20,30,0.08), 0 0 60px rgba(180,10,20,0.22), 0 0 160px rgba(180,10,20,0.1), inset 0 0 60px rgba(180,10,20,0.04)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            {/* Background texture via CSS */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27 opacity=%270.5%27/%3E%3C/svg%3E')]" />

            {/* Corner accents — red */}
            {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map(
              (pos, i) => (
                <span
                  key={i}
                  className={`absolute ${pos} w-6 h-6 pointer-events-none`}
                  style={{
                    background:
                      i < 2
                        ? `linear-gradient(${i === 0 ? '135deg' : '225deg'}, rgba(200,20,30,0.5), transparent 60%)`
                        : `linear-gradient(${i === 2 ? '45deg' : '315deg'}, rgba(200,20,30,0.5), transparent 60%)`,
                  }}
                />
              )
            )}

            {/* Gradient border via pseudo — simulated with top/bottom lines */}
            <span
              className="absolute top-0 left-8 right-8 h-px"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(200,20,30,0.5), rgba(255,255,255,0.12), rgba(200,20,30,0.5), transparent)',
              }}
            />
            <span
              className="absolute bottom-0 left-8 right-8 h-px"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(200,20,30,0.3), rgba(200,20,30,0.3), transparent)',
              }}
            />

            {/* Large ornamental quote mark */}
            <div
              className="mb-4 select-none leading-none"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(5rem, 10vw, 8rem)',
                fontWeight: 300,
                color: 'rgba(200,20,30,0.14)',
                lineHeight: '0.6',
              }}
            >
              "
            </div>

            {/* Manifesto text */}
            <p
              style={{
                fontFamily: "'Cormorant Garamond', 'Instrument Serif', serif",
                fontSize: 'clamp(1.35rem, 2.8vw, 2rem)',
                fontWeight: 300,
                fontStyle: 'italic',
                lineHeight: 1.7,
                letterSpacing: '0.01em',
                color: 'rgba(245,244,240,0.88)',
              }}
            >
              {/* First sentence — highlighted words */}
              We&apos;re designing tools for{' '}
              <span
                className="relative inline-block"
                style={{ color: '#f5f4f0', fontStyle: 'italic' }}
              >
                deep thinkers
                <span
                  className="absolute bottom-0.5 left-0 right-0 h-px"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(200,20,30,0.8), rgba(200,20,30,0.25))',
                  }}
                />
              </span>
              ,{' '}
              <span
                className="relative inline-block"
                style={{ color: '#f5f4f0', fontStyle: 'italic' }}
              >
                bold creators
                <span
                  className="absolute bottom-0.5 left-0 right-0 h-px"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(200,20,30,0.8), rgba(200,20,30,0.25))',
                  }}
                />
              </span>
              , and{' '}
              <span
                className="relative inline-block"
                style={{ color: '#f5f4f0', fontStyle: 'italic' }}
              >
                quiet rebels
                <span
                  className="absolute bottom-0.5 left-0 right-0 h-px"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(200,20,30,0.8), rgba(200,20,30,0.25))',
                  }}
                />
              </span>
              .{' '}
              {/* Second sentence — glow words */}
              Amid the chaos, we build{' '}
              <span
                style={{
                  color: '#f5f4f0',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  textShadow:
                    '0 0 24px rgba(220,40,50,0.5), 0 0 60px rgba(200,20,30,0.28)',
                }}
              >
                digital spaces
              </span>{' '}
              for{' '}
              <span
                style={{
                  color: '#f5f4f0',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  textShadow:
                    '0 0 24px rgba(220,40,50,0.5), 0 0 60px rgba(200,20,30,0.28)',
                }}
              >
                sharp focus
              </span>{' '}
              and{' '}
              <span
                style={{
                  color: '#f5f4f0',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  textShadow:
                    '0 0 24px rgba(220,40,50,0.5), 0 0 60px rgba(200,20,30,0.28)',
                }}
              >
                inspired work
              </span>
              .
            </p>

            {/* Attribution line */}
            <div className="flex items-center justify-center gap-4 mt-10">
              <span
                className="h-px w-8"
                style={{ background: 'rgba(200,20,30,0.5)' }}
              />
              <span className="text-[10px] font-mono tracking-[0.28em] uppercase text-red-600/55">
                Zubair Hussain — Xovato
              </span>
              <span
                className="h-px w-8"
                style={{ background: 'rgba(200,20,30,0.5)' }}
              />
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}