'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Cookie } from 'lucide-react';

export default function CookieConsent() {
  const t = useTranslations('cookie');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('cookie-consent');
    if (!accepted) {
      const timer = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-8 left-4 right-4 md:left-auto md:right-8 md:max-w-sm z-[500]"
          role="dialog"
          aria-label="Cookie consent"
          aria-live="polite"
        >
          <div className="glass rounded-2xl p-5 flex flex-col gap-4 shadow-2xl shadow-black/30">
            <div className="flex items-center gap-2">
              <Cookie size={16} className="text-[hsl(var(--primary))]" aria-hidden="true" />
              <p className="text-xs font-mono tracking-wider uppercase text-[hsl(var(--muted-foreground))]">
                Cookies
              </p>
            </div>
            <p className="text-sm text-[hsl(var(--foreground)/0.8)] leading-relaxed">
              {t('message')}
            </p>
            <div className="flex gap-3">
              <button onClick={accept} className="btn-primary text-xs flex-1 justify-center">
                {t('accept')}
              </button>
              <button onClick={decline} className="btn-outline text-xs flex-1 justify-center">
                {t('decline')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
