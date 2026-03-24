'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTop = () => {
    const lenis = (window as typeof window & { lenis?: { scrollTo: (target: number, opts: object) => void } }).lenis;
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.4 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.25 }}
          onClick={scrollTop}
          className="fixed bottom-24 right-8 z-[900] w-10 h-10 glass rounded-full flex items-center justify-center hover:text-[hsl(var(--primary))] hover:border-[hsl(var(--primary))] transition-colors duration-200 focus-visible:outline-none"
          aria-label="Back to top"
          style={{ willChange: 'transform' }}
        >
          <ArrowUp size={16} aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
