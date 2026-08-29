'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, PlayCircle, X } from 'lucide-react';
import { PROFILE } from '@/lib/zubair-profile';

const buttonVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
  },
};

const heroActionStyle = {
  background:
    'linear-gradient(135deg, rgba(var(--brand-rgb),0.18) 0%, rgba(var(--brand-rgb-3),0.08) 100%)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(var(--brand-rgb-2),0.35)',
  boxShadow:
    '0 0 0 1px rgba(var(--brand-rgb-2),0.1), 0 8px 40px rgba(var(--brand-rgb),0.2), inset 0 1px 0 rgba(var(--hl-rgb),0.08)',
  color: '#f5f4f0',
};

const externalHeroActions = [
  {
    href: PROFILE.actions.introVideo.url,
    label: 'My Intro',
    ariaLabel: PROFILE.actions.introVideo.label,
    icon: PlayCircle,
  },
];

export default function HeroCTA() {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const scheduleDialog = (
    <AnimatePresence>
      {scheduleOpen && (
        <motion.div
          className="fixed inset-0 z-[10050] flex min-h-screen items-center justify-center bg-black/80 px-3 py-5 backdrop-blur-xl sm:px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={PROFILE.actions.schedule.label}
          onMouseDown={() => setScheduleOpen(false)}
        >
          <motion.div
            className="relative flex h-[min(760px,92vh)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-red-500/30 bg-[#050505] shadow-[0_24px_90px_rgba(0,0,0,0.72),0_0_70px_rgba(var(--brand-rgb),0.22)]"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex min-h-[64px] items-center justify-between border-b border-white/10 bg-gradient-to-r from-red-600/15 to-transparent px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-red-500/30 bg-red-600/15">
                  <Calendar size={17} className="text-red-400" />
                </span>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.08em] text-white">
                    Schedule a Call
                  </p>
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/35">
                    Calendly booking
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setScheduleOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/60 transition-colors hover:border-red-500/40 hover:text-white"
                aria-label="Close scheduler"
              >
                <X size={18} />
              </button>
            </div>

            <iframe
              src={`${PROFILE.actions.schedule.privateUrl}?hide_gdpr_banner=1&primary_color=e11d30`}
              title="Schedule a call with Zubair"
              className="h-full w-full flex-1 bg-white"
              data-lenis-prevent="true"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  useEffect(() => {
    if (!scheduleOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setScheduleOpen(false);
    };

    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [scheduleOpen]);

  return (
    <>
      <motion.div
        className="flex w-full max-w-full flex-col xs:flex-row flex-wrap gap-3 sm:gap-4 pt-2"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
      >
        <motion.button
          type="button"
          onClick={() => setScheduleOpen(true)}
          variants={buttonVariants}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.97 }}
          aria-label={PROFILE.actions.schedule.label}
          className="group relative flex min-h-[52px] w-full xs:w-auto items-center justify-center gap-2.5 overflow-hidden rounded-full px-7 py-3.5 transition-all duration-500 sm:px-8"
          style={heroActionStyle}
        >
          <span
            className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            style={{
              background:
                'linear-gradient(135deg, rgba(var(--brand-rgb-2),0.22) 0%, rgba(var(--brand-rgb-3),0.12) 50%, rgba(var(--brand-rgb-2),0.18) 100%)',
            }}
          />
          <span
            className="absolute left-4 right-4 top-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(var(--hl-rgb),0.25), transparent)',
            }}
          />

          <Calendar
            size={14}
            className="relative z-10 text-red-400 transition-transform duration-300 group-hover:scale-110"
          />
          <span className="relative z-10 whitespace-nowrap text-sm font-medium uppercase leading-none tracking-[0.08em]">
            Schedule
          </span>

          <span
            className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ boxShadow: '0 0 28px rgba(var(--brand-rgb),0.45), 0 0 60px rgba(var(--brand-rgb),0.2)' }}
          />
        </motion.button>

        {externalHeroActions.map(({ href, label, ariaLabel, icon: Icon }) => (
          <motion.a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            variants={buttonVariants}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            aria-label={ariaLabel}
            className="group relative flex min-h-[52px] w-full xs:w-auto items-center justify-center gap-2.5 overflow-hidden rounded-full px-7 py-3.5 transition-all duration-500 sm:px-8"
            style={heroActionStyle}
          >
            <span
              className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              style={{
                background:
                  'linear-gradient(135deg, rgba(var(--brand-rgb-2),0.22) 0%, rgba(var(--brand-rgb-3),0.12) 50%, rgba(var(--brand-rgb-2),0.18) 100%)',
              }}
            />
            <span
              className="absolute left-4 right-4 top-0 h-px"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(var(--hl-rgb),0.25), transparent)',
              }}
            />

            <Icon
              size={14}
              className="relative z-10 text-red-400 transition-transform duration-300 group-hover:scale-110"
            />
            <span className="relative z-10 whitespace-nowrap text-sm font-medium uppercase leading-none tracking-[0.08em]">
              {label}
            </span>

            <span
              className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{ boxShadow: '0 0 28px rgba(var(--brand-rgb),0.45), 0 0 60px rgba(var(--brand-rgb),0.2)' }}
            />
          </motion.a>
        ))}
      </motion.div>

      {typeof document !== 'undefined' ? createPortal(scheduleDialog, document.body) : null}
    </>
  );
}
