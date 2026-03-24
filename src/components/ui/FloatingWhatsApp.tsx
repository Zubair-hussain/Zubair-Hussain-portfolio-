'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

export default function FloatingWhatsApp() {
  const [open, setOpen] = useState(false);
  const phone = '923000000000'; // replace with your number
  const message = encodeURIComponent("Hi Zubair! I'm interested in your services.");

  return (
    <div className="whatsapp-float flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="glass rounded-2xl p-5 w-64 shadow-2xl"
          >
            <p className="text-xs font-mono tracking-wider uppercase text-[hsl(var(--muted-foreground))] mb-2">
              WhatsApp
            </p>
            <p className="text-sm mb-4 leading-relaxed">
              Hi there 👋 Need a quote or have questions? Let&apos;s chat!
            </p>
            <a
              href={`https://wa.me/${phone}?text=${message}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-xs w-full justify-center"
              style={{ background: '#25d366' }}
              aria-label="Open WhatsApp chat"
            >
              <MessageCircle size={12} aria-hidden="true" />
              Start Chat
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl shadow-black/40"
        style={{ background: '#25d366' }}
        aria-label={open ? 'Close WhatsApp chat' : 'Open WhatsApp chat'}
        aria-expanded={open}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? 'close' : 'open'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {open ? (
              <X size={22} className="text-white" aria-hidden="true" />
            ) : (
              <MessageCircle size={22} className="text-white" aria-hidden="true" />
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
