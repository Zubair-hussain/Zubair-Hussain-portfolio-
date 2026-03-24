'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, User, Sparkles, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm Zubair's AI Assistant. Ask me about his skills, services, pricing, or how to get in touch! 👋",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://zubair-agent.vercel.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
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
            className="w-[min(calc(100vw-32px),380px)] h-[min(500px,calc(100vh-120px))] bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_20px_rgba(200,20,30,0.1)] flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/5 bg-gradient-to-r from-red-600/10 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center border border-red-500/30">
                  <Bot size={20} className="text-red-500" />
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold tracking-tight">Zubair AI</h4>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-white/40 uppercase font-mono tracking-widest">
                      Active now
                    </span>
                  </div>
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

            {/* Messages */}
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
                        : 'bg-red-600 text-white rounded-tr-none shadow-[0_4px_12px_rgba(239,68,68,0.2)]'
                    }`}
                  >
                    {msg.content}
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
                  className="absolute right-2 p-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:hover:bg-red-600 rounded-xl text-white transition-all shadow-[0_4px_12px_rgba(239,68,68,0.2)]"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white shadow-[0_10px_30px_rgba(239,68,68,0.4)] transition-all group overflow-hidden"
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