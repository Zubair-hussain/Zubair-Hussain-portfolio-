'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bot, Calendar, Mail, MessageCircle, Send, X, User, Sparkles, Loader2 } from 'lucide-react';
import { PROFILE } from '@/lib/zubair-profile';

type ChatView = 'home' | 'ai' | 'zubair';

const DIRECT_LINKS = [
  { icon: MessageCircle, label: 'WhatsApp', detail: 'Usually the fastest', href: 'https://wa.me/923708729117' },
  { icon: Mail, label: 'Email', detail: PROFILE.email, href: `mailto:${PROFILE.email}` },
  { icon: Calendar, label: 'Book a call', detail: '30 minutes on Google Meet', href: '/book' },
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Turn URLs and emails inside a bot reply into clickable links.
function renderRich(text: string) {
  const parts = text.split(/(https?:\/\/[^\s]+|\/book(?![\w-])|[\w.+-]+@[\w-]+\.[\w.-]+)/g);
  return parts.map((part, i) => {
    if (part === '/book')
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-red-400 underline underline-offset-2 hover:text-red-300 break-all">
          booking page
        </a>
      );
    if (/^https?:\/\//.test(part))
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-red-400 underline underline-offset-2 hover:text-red-300 break-all">
          {part.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
        </a>
      );
    if (/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(part))
      return (
        <a key={i} href={`mailto:${part}`} className="text-red-400 underline underline-offset-2 hover:text-red-300 break-all">
          {part}
        </a>
      );
    return <span key={i}>{part}</span>;
  });
}

export default function AIChatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<ChatView>('home');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm Zubair AI 👋 Ask me about his projects, skills, latest blog posts, or book a call. How can I help?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const QUICK_ASKS = [
    'What can Zubair build?',
    'Show recent projects',
    'Latest blog posts',
    'Book a call',
    'My Intro',
  ];

  const handleSubmit = async (e: React.FormEvent, preset?: string) => {
    e.preventDefault();
    const text = (preset ?? input).trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Self-contained Cloudflare edge endpoint — no external backend.
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          // Pass sessionId to maintain conversation memory
          ...(sessionId && { sessionId }),
        }),
      });

      if (!response.ok) {
        throw new Error(`Agent returned ${response.status}`);
      }

      const data = await response.json();

      // Save sessionId for conversation memory across messages
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        // ✅ Agent returns data.reply — not data.response or data.message
        content: data.reply || "I'm having trouble responding right now. Please try again!",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          "Having trouble connecting right now. Reach Zubair directly on WhatsApp: wa.me/+923708729117",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[10000] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-[min(calc(100vw-32px),380px)] h-[min(500px,calc(100vh-120px))] bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_20px_rgba(var(--brand-rgb),0.1)] flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/5 bg-gradient-to-r from-red-600/10 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-3">
                {view !== 'home' && (
                  <button
                    onClick={() => setView('home')}
                    className="p-1.5 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
                    aria-label="Back to chat options"
                  >
                    <ArrowLeft size={16} />
                  </button>
                )}
                <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center border border-red-500/30">
                  {view === 'zubair' ? (
                    <span className="font-display text-lg italic text-red-500">Z</span>
                  ) : (
                    <Bot size={20} className="text-red-500" />
                  )}
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold tracking-tight">
                    {view === 'home' ? 'Hi there 👋' : view === 'ai' ? 'Zubair AI' : 'Zubair Hussain'}
                  </h4>
                  <span className="text-[10px] text-white/40 uppercase font-mono tracking-widest">
                    {view === 'home' ? 'How can we help?' : view === 'ai' ? 'AI assistant' : 'Talk to me directly'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            {view === 'home' && (
              <div className="flex-grow p-5 flex flex-col gap-3">
                <p className="text-sm text-white/60 mb-1">Who would you like to talk to?</p>
                <button
                  onClick={() => setView('ai')}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-red-500/40 hover:bg-red-600/10 transition-all text-left"
                >
                  <span className="w-12 h-12 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0">
                    <Sparkles size={20} className="text-red-500" />
                  </span>
                  <span>
                    <b className="block text-sm text-white">Zubair AI</b>
                    <span className="text-xs text-white/50">Instant answers about projects, skills and blogs</span>
                  </span>
                </button>
                <button
                  onClick={() => setView('zubair')}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-red-500/40 hover:bg-red-600/10 transition-all text-left"
                >
                  <span className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shrink-0 font-display text-2xl italic text-white">
                    Z
                  </span>
                  <span>
                    <b className="block text-sm text-white">Zubair Hussain</b>
                    <span className="text-xs text-white/50">Talk to me directly</span>
                  </span>
                </button>
              </div>
            )}

            {view === 'zubair' && (
              <div className="flex-grow p-5 flex flex-col gap-3">
                <p className="text-sm text-white/60 mb-1">Choose how you'd like to reach me:</p>
                {DIRECT_LINKS.map(({ icon: Icon, label, detail, href }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith('/') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-red-500/40 hover:bg-red-600/10 transition-all"
                  >
                    <Icon size={20} className="text-red-500 shrink-0" />
                    <span>
                      <b className="block text-sm text-white">{label}</b>
                      <span className="text-xs text-white/50 break-all">{detail}</span>
                    </span>
                  </a>
                ))}
              </div>
            )}

            {/* Messages */}
            {view === 'ai' && (<>
            <div
              ref={scrollRef}
              data-lenis-prevent="true"
              className="flex-grow overflow-y-auto p-6 flex flex-col gap-6 overscroll-contain"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                      msg.role === 'assistant'
                        ? 'bg-red-600/10 border-red-500/20'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <Bot size={14} className="text-red-500" />
                    ) : (
                      <User size={14} className="text-white/60" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'assistant'
                        ? 'bg-white/[0.03] text-white/80 rounded-tl-none'
                        : 'bg-red-600 text-white rounded-tr-none shadow-[0_4px_12px_rgba(var(--brand-rgb-5),0.2)]'
                    }`}
                  >
                    {msg.role === 'assistant' ? renderRich(msg.content) : msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-600/10 border border-red-500/20 flex items-center justify-center">
                    <Loader2 size={14} className="text-red-500 animate-spin" />
                  </div>
                  <div className="bg-white/[0.03] p-4 rounded-2xl rounded-tl-none">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick asks — shown until the user sends their first message */}
            {messages.length === 1 && !isLoading && (
              <div className="px-4 pt-1 pb-2 flex flex-wrap gap-2">
                {QUICK_ASKS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={(e) => handleSubmit(e, q)}
                    className="text-[11px] px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-white/60 hover:text-white hover:border-red-500/40 hover:bg-red-600/10 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="p-4 bg-white/[0.02] border-t border-white/5"
            >
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about Zubair's projects..."
                  disabled={isLoading}
                  className="w-full bg-black border border-white/10 rounded-2xl py-3.5 pl-5 pr-14 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/40 transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:hover:bg-red-600 rounded-xl text-white transition-all shadow-[0_4px_12px_rgba(var(--brand-rgb-5),0.2)]"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
            </>)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { setView('home'); setIsOpen((prev) => !prev); }}
        className="relative w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white shadow-[0_10px_30px_rgba(var(--brand-rgb-5),0.4)] transition-all group overflow-hidden"
        aria-label={isOpen ? 'Close AI chat' : 'Open AI chat'}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={28} />
            </motion.div>
          ) : (
            <motion.div
              key="bot"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 10, stiffness: 200 }}
              className="flex items-center justify-center"
            >
              <Bot size={28} />
              <motion.div
                className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg"
                initial={{ y: 0 }}
                animate={{ y: [-2, 2, -2] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles size={10} className="text-red-500" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
