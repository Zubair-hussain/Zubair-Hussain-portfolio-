'use client';

/**
 * Live chat widget — a Crisp-style messenger.
 *
 * ONE thread, three participants, each with its own avatar:
 *   • the visitor            (right side)
 *   • Zubair AI              (sparkle avatar + "AI" chip) — answers instantly
 *   • Zubair himself         ("Z" avatar) — replies from his admin inbox
 *
 * The thread lives on the Zubair-Agent backend (NEXT_PUBLIC_CHAT_API_URL).
 * If that URL is not configured, or the backend is unreachable, the widget
 * quietly falls back to the site's own /api/chat so visitors always get an
 * answer.
 *
 * Security: message text is only ever rendered as React text nodes (never
 * dangerouslySetInnerHTML), and links are restricted to http(s)/mailto.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Mail, MessageCircle, Phone, Send, Sparkles, X } from 'lucide-react';
import { PROFILE } from '@/lib/zubair-profile';
import './chat-widget.css';

const API_BASE = (process.env.NEXT_PUBLIC_CHAT_API_URL || '').replace(/\/+$/, '');
const STORAGE_KEY = 'zh-live-chat';
const POLL_OPEN_MS = 3000;
const POLL_CLOSED_MS = 20000;
const MAX_LENGTH = 2000;

type Author = 'visitor' | 'ai' | 'zubair';

interface ChatMessage {
  key: string;
  id?: number; // server sequence number (absent for local-only messages)
  author: Author;
  text: string;
  at: number;
  pending?: boolean;
  greeting?: boolean; // automatic hello shown when the visitor switches to Zubair
}

type Agent = 'ai' | 'zubair';

interface LiveStatus {
  online: boolean;
  lastSeenAt: number | null;
  replyTime: string;
}

interface ServerMessage {
  id: number;
  author: string;
  text: string;
  at: number;
}

/** Loose shape of the backend's JSON replies (every field is validated before use). */
interface LiveResponse {
  token?: unknown;
  messages?: ServerMessage[];
  status?: LiveStatus;
  typing?: unknown;
  aiActive?: unknown;
  identified?: unknown;
  handoff?: unknown;
  error?: unknown;
}

interface Saved {
  token?: string;
  identified?: boolean;
  emailDismissed?: boolean;
  agent?: Agent;
}

const FULL_NAME = `${PROFILE.shortName} Hussain`;

const WELCOME: ChatMessage = {
  key: 'welcome',
  author: 'ai',
  text: `Hi there 👋 I'm Zubair AI. Ask me anything about ${PROFILE.shortName}'s work, pricing or availability — and if you'd rather talk to ${PROFILE.shortName} himself, he can jump into this same chat.`,
  at: Date.now(),
};

const QUICK_REPLIES = ['What can Zubair build?', 'Show me pricing', 'Recent projects', 'Book a call'];
const HUMAN_REPLY = 'Talk to Zubair';

/* ------------------------------- storage -------------------------------- */

function loadSaved(): Saved {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function persist(patch: Saved | null) {
  try {
    if (patch === null) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...loadSaved(), ...patch }));
  } catch {
    /* private mode / storage blocked — the chat still works for this page view */
  }
}

/* ------------------------------ formatting ------------------------------ */

const LINK_RE = /(\*\*[^*\n]+\*\*|https?:\/\/[^\s<>"')]+|\/book(?![\w-])|[\w.+-]+@[\w-]+\.[\w.-]+)/g;

/** Tiny, safe formatter: **bold**, links and emails. Everything else is plain text. */
function renderRich(text: string) {
  return text.split(LINK_RE).map((part, i) => {
    if (!part) return null;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4)
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part === '/book')
      return <a key={i} href="/book" target="_blank" rel="noopener noreferrer">booking page</a>;
    if (/^https?:\/\//.test(part)) {
      const href = part.replace(/[.,;:!?]+$/, '');
      const tail = part.slice(href.length);
      return (
        <React.Fragment key={i}>
          <a href={href} target="_blank" rel="noopener noreferrer nofollow">
            {href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
          </a>
          {tail}
        </React.Fragment>
      );
    }
    if (/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(part)) return <a key={i} href={`mailto:${part}`}>{part}</a>;
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

const clock = (ms: number) => new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

function ago(ms: number) {
  const minutes = Math.max(1, Math.round((Date.now() - ms) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return null; // older than a day — not worth showing
}

/** "Active now" / "Active 12m ago" / "Usually replies within 1 hour". */
function lastActive(status: LiveStatus | null) {
  if (status?.online) return 'Active now';
  const seen = status?.lastSeenAt ? ago(status.lastSeenAt) : null;
  return seen ? `Active ${seen}` : `Usually replies ${status?.replyTime || 'within 1 hour'}`;
}

function footerText(status: LiveStatus | null) {
  if (!status) return 'Zubair AI answers instantly';
  if (status.online) return `${PROFILE.shortName} is online — replies in minutes`;
  const seen = status.lastSeenAt ? ago(status.lastSeenAt) : null;
  return `${PROFILE.shortName} typically replies ${status.replyTime}${seen ? ` · active ${seen}` : ''}`;
}

const isAuthor = (value: string): value is Author => value === 'visitor' || value === 'ai' || value === 'zubair';

/* -------------------------------- avatars ------------------------------- */

function Avatar({ author, large, online }: { author: Author; large?: boolean; online?: boolean }) {
  if (author === 'ai')
    return (
      <span className={`zc-avatar ai${large ? ' lg' : ''}`} aria-hidden="true">
        <Sparkles size={large ? 18 : 14} />
      </span>
    );
  return (
    <span className={`zc-avatar human${large ? ' lg' : ''}`} aria-hidden="true">
      Z
      {online !== undefined && <span className={`zc-presence${online ? ' online' : ''}`} />}
    </span>
  );
}

/* -------------------------------- widget -------------------------------- */

export default function AIChatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<LiveStatus | null>(null);
  const [zubairTyping, setZubairTyping] = useState(false);
  const [aiActive, setAiActive] = useState(true);
  const [unread, setUnread] = useState(0);
  const [hasThread, setHasThread] = useState(false);
  const [askEmail, setAskEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [liveDown, setLiveDownState] = useState(false);
  // Who the visitor is talking to. The AI is the default; tapping Zubair's photo
  // (or asking the AI for him) switches the same thread to the human.
  const [agent, setAgent] = useState<Agent>(() => (loadSaved().agent === 'zubair' ? 'zubair' : 'ai'));

  const tokenRef = useRef<string | null>(null);
  const lastIdRef = useRef(0);
  const localCounter = useRef(0);
  const openRef = useRef(false);
  const liveDownRef = useRef(false);
  const lastTypingRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const setLiveDown = useCallback((down: boolean) => {
    liveDownRef.current = down;
    setLiveDownState(down);
  }, []);

  useEffect(() => {
    openRef.current = isOpen;
  }, [isOpen]);

  /* ----------------------------- API helpers ---------------------------- */

  const live = useCallback(async (path: string, init?: { method?: string; body?: unknown }) => {
    const res = await fetch(`${API_BASE}/api/live${path}`, {
      method: init?.method || 'GET',
      headers: {
        ...(init?.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {}),
      },
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
      credentials: 'omit',
    });
    const data = res.status === 204 ? {} : await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data: data as LiveResponse };
  }, []);

  const forgetThread = useCallback(() => {
    tokenRef.current = null;
    lastIdRef.current = 0;
    persist(null);
    setHasThread(false);
  }, []);

  /** Append server messages we have not seen yet (ids are monotonic). */
  const absorb = useCallback((incoming: ServerMessage[] | undefined, countUnread: boolean) => {
    const fresh = (incoming || [])
      .filter((m) => m && typeof m.id === 'number' && m.id > lastIdRef.current && isAuthor(m.author))
      .sort((a, b) => a.id - b.id);
    if (!fresh.length) return;
    lastIdRef.current = fresh[fresh.length - 1].id;

    setMessages((prev) => [
      ...prev.filter((m) => !m.pending),
      ...fresh.map((m) => ({
        key: `s${m.id}`,
        id: m.id,
        author: m.author as Author,
        text: String(m.text),
        at: m.at,
      })),
    ]);

    if (countUnread && !openRef.current) {
      setUnread((n) => n + fresh.filter((m) => m.author !== 'visitor').length);
    }
  }, []);

  const poll = useCallback(async () => {
    if (!API_BASE || !tokenRef.current || document.hidden) return;
    try {
      const { ok, status: code, data } = await live(`/messages?after=${lastIdRef.current}`);
      if (code === 401 || code === 404) return forgetThread();
      if (!ok) return;
      setLiveDown(false);
      absorb(data.messages, true);
      if (data.status) setStatus(data.status);
      setZubairTyping(Boolean(data.typing));
      setAiActive(data.aiActive !== false);
      if (data.identified) persist({ identified: true });
    } catch {
      /* offline — try again on the next tick */
    }
  }, [absorb, forgetThread, live, setLiveDown]);

  /* ------------------------------ lifecycle ----------------------------- */

  // Restore an existing conversation (if any) once, on mount.
  useEffect(() => {
    if (!API_BASE) return;
    const saved = loadSaved();
    if (typeof saved.token === 'string') {
      tokenRef.current = saved.token;
      setHasThread(true);
      poll();
    }
  }, [poll]);

  // Presence for the header/footer — only fetched when the widget is opened.
  useEffect(() => {
    if (!isOpen) return;
    setUnread(0);
    if (!API_BASE || tokenRef.current) return; // the poll already carries status
    let cancelled = false;
    live('/status')
      .then(({ ok, data }) => {
        if (!cancelled && ok && data.status) setStatus(data.status);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isOpen, live]);

  // Poll quickly while open, slowly while closed (keeps the unread badge fresh).
  useEffect(() => {
    if (!API_BASE || !hasThread) return;
    if (isOpen) poll();
    const timer = window.setInterval(poll, isOpen ? POLL_OPEN_MS : POLL_CLOSED_MS);
    const onVisible = () => {
      if (!document.hidden) poll();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [hasThread, isOpen, poll]);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, sending, zubairTyping, askEmail, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    if (window.matchMedia('(pointer: fine)').matches) inputRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  /* ------------------------------- sending ------------------------------ */

  const addLocal = (author: Author, text: string, pending = false) => {
    localCounter.current += 1;
    const message: ChatMessage = { key: `l${localCounter.current}`, author, text, at: Date.now(), pending };
    setMessages((prev) => [...prev, message]);
    return message.key;
  };

  /** Fallback brain: the site's own edge endpoint. Used when the live backend is absent/down. */
  const answerLocally = async (text: string, pendingKey: string) => {
    setMessages((prev) => prev.map((m) => (m.key === pendingKey ? { ...m, pending: false } : m)));
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      addLocal('ai', typeof data.reply === 'string' && data.reply ? data.reply : 'Sorry, I could not answer that just now.');
    } catch {
      addLocal('ai', `I'm having trouble connecting right now. You can reach ${PROFILE.shortName} directly at ${PROFILE.email}.`);
    }
  };

  const sendLive = async (text: string): Promise<boolean> => {
    for (let attempt = 0; attempt < 2; attempt++) {
      const { ok, status: code, data } = tokenRef.current
        ? await live('/messages', { method: 'POST', body: { text, agent } })
        : await live('/conversations', { method: 'POST', body: { text, agent, page: window.location.pathname.slice(0, 200) } });

      // The saved conversation expired or was deleted → start a fresh one.
      if (tokenRef.current && (code === 401 || code === 404)) {
        forgetThread();
        continue;
      }
      if (code === 429) {
        setMessages((prev) => prev.filter((m) => !m.pending));
        addLocal('ai', "You're sending messages very quickly — please wait a moment and try again.");
        return true;
      }
      if (!ok) return false;

      if (typeof data.token === 'string') {
        tokenRef.current = data.token;
        persist({ token: data.token });
        setHasThread(true);
      }
      absorb(data.messages, false);
      if (data.status) setStatus(data.status);
      setAiActive(data.aiActive !== false);
      // The visitor asked the AI for a human → hand the chat straight to Zubair.
      if (data.handoff === true) switchTo('zubair', true);

      // Crisp-style: once they've written and Zubair isn't online, offer email follow-up.
      const saved = loadSaved();
      if (!saved.identified && !saved.emailDismissed && !data.status?.online) setAskEmail(true);
      return true;
    }
    return false;
  };

  /** Switch who the visitor talks to and post the matching hello. */
  const switchTo = (next: Agent, serverDone = false) => {
    if (next === agent && !serverDone) return;
    setAgent(next);
    persist({ agent: next });
    setAiActive(next === 'ai');
    addLocal(
      next,
      next === 'zubair'
        ? `Hi there, I'm ${FULL_NAME} 👋 Thanks for reaching out. Tell me what you need and I'll reply right here.`
        : "You're back with Zubair AI ✨ Ask me anything and I'll answer instantly."
    );
    setMessages((prev) => prev.map((m, i) => (i === prev.length - 1 ? { ...m, greeting: true } : m)));
    if (API_BASE && tokenRef.current && !serverDone) {
      live('/agent', { method: 'POST', body: { agent: next } })
        .then(({ ok, data }) => {
          if (ok && data.status) setStatus(data.status);
        })
        .catch(() => {});
    }
  };

  const send = async (raw: string) => {
    const text = raw.trim().slice(0, MAX_LENGTH);
    if (!text || sending) return;

    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setSending(true);
    const pendingKey = addLocal('visitor', text, true);

    try {
      let delivered = false;
      if (API_BASE && !liveDownRef.current) {
        try {
          delivered = await sendLive(text);
        } catch {
          delivered = false;
        }
        if (!delivered) setLiveDown(!tokenRef.current); // keep retrying live once a thread exists
      }
      if (!delivered) await answerLocally(text, pendingKey);
    } finally {
      setSending(false);
    }
  };

  const onType = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    event.target.style.height = 'auto';
    event.target.style.height = `${Math.min(event.target.scrollHeight, 110)}px`;
    if (API_BASE && tokenRef.current && Date.now() - lastTypingRef.current > 4000) {
      lastTypingRef.current = Date.now();
      live('/typing', { method: 'POST', body: {} }).catch(() => {});
    }
  };

  const saveEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    setEmailError('');
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return setEmailError('Please enter a valid email address.');
    try {
      const { ok, data } = await live('/identify', { method: 'POST', body: { email: value } });
      if (!ok) return setEmailError(typeof data.error === 'string' ? data.error : 'Could not save that. Try again.');
      persist({ identified: true });
      setAskEmail(false);
      addLocal('ai', `Thanks! ${PROFILE.shortName} will follow up at ${value} if you're not here when he replies.`);
    } catch {
      setEmailError('Could not save that. Try again.');
    }
  };

  const dismissEmail = () => {
    persist({ emailDismissed: true });
    setAskEmail(false);
  };

  /* -------------------------------- render ------------------------------ */

  const showQuickReplies = !sending && !messages.some((m) => m.author === 'visitor');
  const liveMode = Boolean(API_BASE) && !liveDown;
  const online = Boolean(status?.online);

  return (
    <div className={`zc${isOpen ? ' zc-open' : ''}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.section
            className="zc-panel"
            role="dialog"
            aria-label={`Chat with ${PROFILE.shortName}`}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className="zc-header">
              <div className="zc-header-row">
                <div className="zc-avatars" role="tablist" aria-label="Who do you want to talk to?">
                  <button
                    type="button"
                    role="tab"
                    className="zc-pick"
                    aria-selected={agent === 'ai'}
                    title="Zubair AI — instant answers"
                    onClick={() => switchTo('ai')}
                  >
                    <Avatar author="ai" large />
                  </button>
                  <button
                    type="button"
                    role="tab"
                    className="zc-pick"
                    aria-selected={agent === 'zubair'}
                    title={liveMode ? FULL_NAME : `${FULL_NAME} (live chat unavailable)`}
                    disabled={!liveMode}
                    onClick={() => switchTo('zubair')}
                  >
                    <Avatar author="zubair" large online={liveMode ? online : undefined} />
                  </button>
                </div>
                <div className="zc-header-text">
                  <h2>Hi there 👋</h2>
                  <p className="zc-who">{agent === 'zubair' ? `Chatting with ${FULL_NAME}` : 'Chatting with Zubair AI'}</p>
                  <p>
                    {liveMode && <span className={`zc-dot${online ? ' online' : ''}`} />}
                    {agent === 'zubair' ? lastActive(status) : liveMode ? `Instant answers · tap ${PROFILE.shortName}'s photo to talk to him` : 'Ask us anything'}
                  </p>
                </div>
                <button type="button" className="zc-close" onClick={() => setIsOpen(false)} aria-label="Close chat">
                  <X size={16} />
                </button>
              </div>
            </header>

            <div ref={scrollRef} className="zc-body" data-lenis-prevent="true" aria-live="polite">
              <span className="zc-day">Today</span>

              {messages.map((message, index) => {
                const previous = messages[index - 1];
                const next = messages[index + 1];
                const first = !previous || previous.author !== message.author;
                const last = !next || next.author !== message.author;
                const mine = message.author === 'visitor';

                return (
                  <div key={message.key} className={`zc-row${mine ? ' me' : ''}${first ? ' first' : ''}`}>
                    {!mine && (
                      <span className={last ? undefined : 'zc-avatar ghost'}>
                        {last && <Avatar author={message.author} />}
                      </span>
                    )}
                    <div className="zc-stack">
                      {!mine && first && (
                        <span className="zc-author">
                          {message.author === 'ai' ? 'Zubair AI' : PROFILE.shortName}
                          {message.author === 'ai' && <span className="zc-chip">AI</span>}
                        </span>
                      )}
                      <div className={`zc-bubble${mine ? ' me' : message.author === 'ai' ? ' ai' : ''}${message.pending ? ' pending' : ''}`}>
                        {mine ? message.text : renderRich(message.text)}
                      </div>
                      {message.greeting && message.author === 'zubair' ? (
                        <span className="zc-time">{FULL_NAME} · {lastActive(status)}</span>
                      ) : (
                        last && !message.pending && message.key !== 'welcome' && <span className="zc-time">{clock(message.at)}</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Zubair typing (live) or the AI composing its answer */}
              {(zubairTyping || (sending && aiActive && agent === 'ai')) && (
                <div className="zc-row first">
                  <Avatar author={zubairTyping ? 'zubair' : 'ai'} />
                  <div className="zc-stack">
                    <div className={`zc-bubble${zubairTyping ? '' : ' ai'}`}>
                      <span className="zc-typing" aria-label={zubairTyping ? `${PROFILE.shortName} is typing` : 'Zubair AI is typing'}>
                        <i /><i /><i />
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {askEmail && hasThread && !online && (
                <div className="zc-card">
                  <strong>Get {PROFILE.shortName}'s reply by email</strong>
                  <p>He typically replies {status?.replyTime || 'within 1 hour'}. Leave your email so you don't miss it.</p>
                  <form onSubmit={saveEmail} noValidate>
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      aria-label="Your email"
                      maxLength={160}
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                    <button type="submit" className="zc-save">Save</button>
                  </form>
                  {emailError && <p className="zc-error" role="alert">{emailError}</p>}
                  <button type="button" className="zc-skip" onClick={dismissEmail}>No thanks</button>
                </div>
              )}
            </div>

            {showQuickReplies && (
              <div className="zc-quick">
                {QUICK_REPLIES.map((label) => (
                  <button key={label} type="button" onClick={() => send(label)}>{label}</button>
                ))}
                {liveMode && (
                  <button type="button" className="human" onClick={() => switchTo('zubair')}>{HUMAN_REPLY}</button>
                )}
              </div>
            )}

            <form
              className="zc-composer"
              onSubmit={(event) => {
                event.preventDefault();
                send(input);
              }}
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                maxLength={MAX_LENGTH}
                onChange={onType}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    send(input);
                  }
                }}
                placeholder={agent === 'zubair' ? `Message ${PROFILE.shortName}…` : 'Ask Zubair AI anything…'}
                aria-label="Message"
              />
              <button type="submit" className="zc-send" disabled={!input.trim() || sending} aria-label="Send message">
                <Send size={16} />
              </button>
            </form>

            <footer className="zc-footer">
              {liveMode && <i className={`zc-dot${online ? ' online' : ''}`} />}
              <span>{footerText(liveMode ? status : null)}</span>
              <a href="https://wa.me/923708729117" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" title="WhatsApp">
                <Phone size={14} />
              </a>
              <a href={`mailto:${PROFILE.email}`} aria-label="Email" title="Email">
                <Mail size={14} />
              </a>
              <a href={PROFILE.actions.schedule.publicPath} aria-label="Book a call" title="Book a call">
                <Calendar size={14} />
              </a>
            </footer>
          </motion.section>
        )}
      </AnimatePresence>

      <button
        type="button"
        className="zc-launcher"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close chat' : unread ? `Open chat — ${unread} new message${unread > 1 ? 's' : ''}` : 'Open chat'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={26} /> : <MessageCircle size={26} />}
        {!isOpen && unread > 0 && <span className="zc-unread">{unread > 9 ? '9+' : unread}</span>}
      </button>
    </div>
  );
}
