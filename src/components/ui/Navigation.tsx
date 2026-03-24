'use client';

import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Globe, Sun, Moon, Palette, ArrowUpRight } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import HireMeModal from './HireMeModal';

const navLinks = [
  { key: 'about',    href: '#about'    },
  { key: 'skills',   href: '#skills'   },
  { key: 'projects', href: '#projects' },
  { key: 'services', href: '#services' },
] as const;

const locales = [
  { id: 'en', label: 'EN — English'  },
  { id: 'ur', label: 'UR — اردو'     },
  { id: 'es', label: 'ES — Español'  },
  { id: 'hi', label: 'HI — हिन्दी'    },
  { id: 'ru', label: 'RU — Русский'  },
  { id: 'de', label: 'DE — Deutsch'  },
];

function scrollTo(href: string) {
  const el = document.getElementById(href.replace('#', ''));
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Sliding underline hook ── */
function useSlideUnderline() {
  const ref       = useRef<HTMLDivElement>(null);
  const lineLeft  = useMotionValue(0);
  const lineWidth = useMotionValue(0);
  const springL   = useSpring(lineLeft,  { stiffness: 320, damping: 34 });
  const springW   = useSpring(lineWidth, { stiffness: 320, damping: 34 });

  const onEnter = useCallback((el: HTMLButtonElement) => {
    if (!ref.current) return;
    const cr = ref.current.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    lineLeft.set(er.left - cr.left);
    lineWidth.set(er.width);
  }, [lineLeft, lineWidth]);

  const onLeave = useCallback(() => {
    lineWidth.set(0);
  }, [lineWidth]);

  return { ref, springL, springW, onEnter, onLeave };
}

const Navigation = memo(function Navigation() {
  const t               = useTranslations('nav');
  const { theme, cycleTheme } = useTheme();
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [locale,      setLocale]      = useState('en');
  const [localeOpen,  setLocaleOpen]  = useState(false);
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState<{ title: string; price: string; category: string } | null>(null);
  const { ref, springL, springW, onEnter, onLeave } = useSlideUnderline();

  /* Listen for openHireMeModal events explicitly dispatched from other components */
  useEffect(() => {
    const handleOpenHireMe = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setPreselectedService(customEvent.detail);
      }
      setIsHireModalOpen(true);
      setMobileOpen(false);
    };
    window.addEventListener('openHireMeModal', handleOpenHireMe);
    return () => window.removeEventListener('openHireMeModal', handleOpenHireMe);
  }, []);

  /* lock body scroll when mobile menu open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    const saved = document.cookie
      .split('; ')
      .find(r => r.startsWith('locale='))
      ?.split('=')[1];
    if (saved) setLocale(saved);

    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const changeLocale = useCallback((next: string) => {
    document.cookie = `locale=${next};path=/;max-age=31536000`;
    setLocale(next);
    setLocaleOpen(false);
    window.location.reload();
  }, []);

  const isDark    = theme === 'dark';
  const ThemeIcon = isDark ? Sun : theme === 'light' ? Palette : Moon;

  /* stagger variants */
  const linkVariants = {
    hidden:  { opacity: 0, y: -14 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { duration: 0.7, ease: [0.16,1,0.3,1], delay: 0.08 + i * 0.07 },
    }),
  };

  return (
    <>
      {/* ════════════════════════════════════════
          DESKTOP NAVBAR
      ════════════════════════════════════════ */}
      <motion.header
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1,  y: 0   }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-[9999]"
        style={{
          background: scrolled
            ? 'rgba(3,4,8,0.88)'
            : 'transparent',
          backdropFilter:       scrolled ? 'blur(24px) saturate(1.6)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(1.6)' : 'none',
          transition: 'background 0.6s ease, backdrop-filter 0.6s ease',
        }}
      >
        {/* razor border — fades in on scroll */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
          animate={{ opacity: scrolled ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(200,20,30,0.55) 20%, rgba(200,20,30,0.8) 50%, rgba(200,20,30,0.55) 80%, transparent 100%)',
          }}
        />

        <nav className="mx-auto flex items-center justify-between px-4 sm:px-8 md:px-14 lg:px-20 h-[70px] max-w-[1440px]">

          {/* ── Logo / Wordmark ── */}
          <motion.button
            onClick={() => scrollTo('#hero')}
            aria-label="Go to top"
            className="relative group flex-shrink-0"
            whileHover={{ x: 2 }}
            transition={{ duration: 0.3 }}
          >
            {/* Italic serif wordmark */}
            <span
              className="relative block leading-none select-none"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize:   '1.75rem',
                fontStyle:  'italic',
                fontWeight: 400,
                letterSpacing: '-0.03em',
                color: '#f5f4f0',
              }}
            >
              ZH
              {/* red period */}
              <span style={{ color: '#c8141e' }}>.</span>
            </span>
            {/* slide-in underline on hover */}
            <span
              className="absolute -bottom-1 left-0 h-px w-0 group-hover:w-full transition-all duration-500"
              style={{ background: 'linear-gradient(90deg, rgba(200,20,30,0.8), transparent)' }}
            />
          </motion.button>

          {/* ── Centre links ── */}
          <div ref={ref} className="hidden md:flex items-center gap-8 lg:gap-10 relative" onMouseLeave={onLeave}>
            {/* sliding underline bar */}
            <motion.span
              className="absolute -bottom-[2px] h-[1.5px] rounded-full pointer-events-none"
              style={{
                left:  springL,
                width: springW,
                background: 'linear-gradient(90deg, rgba(200,20,30,0.9), rgba(220,40,50,0.5))',
                boxShadow: '0 0 8px rgba(200,20,30,0.5)',
              }}
            />

            {navLinks.map(({ key, href }, i) => (
              <motion.button
                key={key}
                custom={i}
                variants={linkVariants}
                initial="hidden"
                animate="visible"
                onClick={() => scrollTo(href)}
                onMouseEnter={e => onEnter(e.currentTarget as HTMLButtonElement)}
                className="relative text-[11px] font-mono tracking-[0.22em] uppercase pb-0.5 transition-colors duration-200"
                style={{ color: 'rgba(245,244,240,0.52)' }}
                whileHover={{ color: 'rgba(245,244,240,0.95)' } as any}
              >
                {t(key)}
              </motion.button>
            ))}
          </div>

          {/* ── Right controls ── */}
          <div className="flex items-center gap-3 sm:gap-4">

            {/* Locale picker */}
            <div className="relative hidden sm:block">
              <motion.button
                onClick={() => setLocaleOpen(o => !o)}
                aria-label="Change language"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300"
                style={{
                  color:  'rgba(245,244,240,0.45)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
                whileHover={{ color: 'rgba(245,244,240,0.85)', borderColor: 'rgba(200,20,30,0.35)' } as any}
              >
                <Globe size={13} strokeWidth={1.5} />
                <span className="text-[10px] font-mono tracking-[0.18em] uppercase">{locale}</span>
              </motion.button>

              <AnimatePresence>
                {localeOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1   }}
                    exit={{    opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.22, ease: [0.16,1,0.3,1] }}
                    className="absolute top-full right-0 mt-3 w-40 overflow-hidden rounded-sm"
                    style={{
                      background:    'rgba(8,10,14,0.96)',
                      border:        '1px solid rgba(200,20,30,0.18)',
                      backdropFilter:'blur(20px)',
                      boxShadow:     '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,20,30,0.08)',
                    }}
                  >
                    {/* top accent line */}
                    <div
                      className="h-px w-full"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(200,20,30,0.6), transparent)' }}
                    />
                    {locales.map(l => (
                      <button
                        key={l.id}
                        onClick={() => changeLocale(l.id)}
                        className="w-full text-left px-4 py-2.5 text-[10px] font-mono tracking-[0.18em] uppercase transition-colors duration-150 hover:bg-white/[0.04]"
                        style={{
                          color: locale === l.id ? 'rgba(200,20,30,0.9)' : 'rgba(245,244,240,0.38)',
                        }}
                      >
                        {l.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme toggle */}
            <motion.button
              onClick={cycleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-full transition-colors duration-200"
              style={{ color: 'rgba(245,244,240,0.38)' }}
              whileHover={{ color: 'rgba(245,244,240,0.85)' } as any}
              whileTap={{ scale: 0.88 }}
            >
              <ThemeIcon size={15} strokeWidth={1.5} />
            </motion.button>

            {/* Hire Me CTA */}
            <motion.button
              onClick={() => setIsHireModalOpen(true)}
              aria-label="Hire me"
              className="hidden sm:flex items-center gap-2 px-5 py-2 rounded-full overflow-hidden relative group"
              style={{
                background: 'linear-gradient(135deg, rgba(200,20,30,0.16), rgba(160,10,20,0.08))',
                border:     '1px solid rgba(200,20,30,0.32)',
                boxShadow:  '0 0 0 1px rgba(200,20,30,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
                color:      '#f5f4f0',
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{   scale: 0.97 }}
            >
              {/* shimmer */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'linear-gradient(135deg, rgba(200,20,30,0.24), rgba(160,10,20,0.14))' }}
              />
              <span
                className="absolute top-0 left-4 right-4 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }}
              />
              <span
                className="relative z-10 text-[10px] font-mono tracking-[0.22em] uppercase"
              >
                {t('hire')}
              </span>
              <ArrowUpRight
                size={11}
                className="relative z-10 text-red-500/70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
              />
              {/* outer glow */}
              <span
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ boxShadow: '0 0 22px rgba(200,20,30,0.4)' }}
              />
            </motion.button>

            {/* Mobile hamburger — minimal lines, not an icon */}
            <button
              className="md:hidden flex flex-col justify-center gap-[5px] w-8 h-8 group"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <span
                className="block h-px w-6 transition-all duration-300 group-hover:w-8"
                style={{ background: 'rgba(245,244,240,0.7)' }}
              />
              <span
                className="block h-px w-4 transition-all duration-300 group-hover:w-8"
                style={{ background: 'rgba(200,20,30,0.8)' }}
              />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* ════════════════════════════════════════
          MOBILE FULL-SCREEN MENU
          Editorial split panel — left dark / right links
      ════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[9998] md:hidden flex flex-col sm:flex-row"
            style={{ background: 'rgba(3,4,8,0.97)' }}
          >
            {/* ── Top/Left panel — red atmospheric glow + logo ── */}
            <motion.div
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: 0,   opacity: 1 }}
              exit={{    x: -40, opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
              className="relative flex flex-row sm:flex-col justify-between items-center sm:items-start p-6 sm:p-10 w-full sm:w-2/5 border-b border-[rgba(200,20,30,0.12)] sm:border-b-0 sm:border-r shrink-0"
            >
              {/* Red glow from bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 h-2/3 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse 80% 70% at 20% 100%, rgba(180,10,20,0.3) 0%, transparent 65%)',
                }}
              />

              {/* Wordmark */}
              <span
                style={{
                  fontFamily:    "'Instrument Serif', serif",
                  fontSize:      '2.4rem',
                  fontStyle:     'italic',
                  letterSpacing: '-0.04em',
                  color:         '#f5f4f0',
                }}
              >
                ZH<span style={{ color: '#c8141e' }}>.</span>
              </span>

              {/* Bottom meta */}
              <div className="relative z-10 space-y-1 hidden xs:block pr-12 sm:pr-0">
                <p className="text-[9px] font-mono tracking-[0.3em] uppercase text-white/25">
                  Full-Stack Dev
                </p>
                <p className="text-[9px] font-mono tracking-[0.3em] uppercase text-white/20">
                  Hyderabad, PK
                </p>
              </div>
            </motion.div>

            {/* ── Right panel — editorial links ── */}
            <div className="flex flex-col justify-center flex-1 px-8 sm:px-14 relative pb-10 sm:pb-0">

              {/* Close button */}
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="fixed sm:absolute top-4 right-4 sm:top-5 sm:right-5 flex flex-col items-center justify-center gap-[6px] w-12 h-12 group z-[9999]"
              >
                <span
                  className="block h-px w-6 rotate-45 translate-y-[4.5px]"
                  style={{ background: 'rgba(245,244,240,0.6)' }}
                />
                <span
                  className="block h-px w-6 -rotate-45"
                  style={{ background: 'rgba(245,244,240,0.6)' }}
                />
              </button>

              {/* Nav links — large editorial type */}
              <nav className="space-y-1">
                {navLinks.map(({ key, href }, i) => (
                  <motion.button
                    key={key}
                    onClick={() => { scrollTo(href); setMobileOpen(false); }}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0  }}
                    exit={{    opacity: 0, x: 12  }}
                    transition={{ duration: 0.55, ease: [0.16,1,0.3,1], delay: 0.1 + i * 0.08 }}
                    className="group flex items-baseline gap-3 w-full text-left py-3"
                  >
                    {/* index number */}
                    <span
                      className="text-[9px] font-mono tracking-widest mt-1 w-4 flex-shrink-0 transition-colors duration-300 group-hover:text-red-500"
                      style={{ color: 'rgba(200,20,30,0.4)' }}
                    >
                      0{i + 1}
                    </span>

                    {/* link text */}
                    <span
                      className="transition-all duration-300 leading-none"
                      style={{
                        fontFamily:    "'Instrument Serif', serif",
                        fontSize:      'clamp(2.4rem, 10vw, 3.2rem)',
                        fontStyle:     'italic',
                        fontWeight:    400,
                        letterSpacing: '-0.03em',
                        color:         'rgba(245,244,240,0.32)',
                      }}
                    >
                      <span className="group-hover:text-white/90 transition-colors duration-300">
                        {t(key)}
                      </span>
                    </span>
                  </motion.button>
                ))}
              </nav>

              {/* Bottom CTA */}
              <motion.button
                onClick={() => { setIsHireModalOpen(true); setMobileOpen(false); }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y:  0  }}
                exit={{    opacity: 0, y: 10  }}
                transition={{ duration: 0.6, ease: [0.16,1,0.3,1], delay: 0.55 }}
                className="mt-12 self-start flex items-center gap-2.5 px-7 py-3.5 rounded-full relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, rgba(200,20,30,0.18), rgba(160,10,20,0.08))',
                  border:     '1px solid rgba(200,20,30,0.32)',
                  color:      '#f5f4f0',
                }}
              >
                <span
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'linear-gradient(135deg, rgba(200,20,30,0.28), rgba(160,10,20,0.16))' }}
                />
                <span className="relative z-10 text-[10px] font-mono tracking-[0.24em] uppercase">
                  {t('hire')}
                </span>
                <ArrowUpRight size={11} className="relative z-10 text-red-500/70" />
              </motion.button>

              {/* Locale row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="mt-8 flex flex-wrap gap-x-5 gap-y-2"
              >
                {locales.map(l => (
                  <button
                    key={l.id}
                    onClick={() => changeLocale(l.id)}
                    className="text-[9px] font-mono tracking-[0.2em] uppercase transition-colors duration-200"
                    style={{
                      color: locale === l.id
                        ? 'rgba(200,20,30,0.8)'
                        : 'rgba(245,244,240,0.2)',
                    }}
                  >
                    {l.id}
                  </button>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <HireMeModal 
        isOpen={isHireModalOpen} 
        onClose={() => {
          setIsHireModalOpen(false);
          setTimeout(() => setPreselectedService(null), 500); // clear after exit animation
        }} 
        preselectedService={preselectedService}
      />
    </>
  );
});

export default Navigation;