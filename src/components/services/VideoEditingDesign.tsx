'use client';

import { useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight, BarChart3, Calendar, CheckCircle2, ChevronLeft, ChevronRight,
  FileVideo, Heart, Layers, Play, Scissors, TrendingUp, Video, X,
} from 'lucide-react';

const P = 'hsl(var(--primary))';
const WHATSAPP = 'https://wa.me/923708729117';
const INTRO_VIDEO = 'https://res.cloudinary.com/dngzhdxfe/video/upload/Into-Xovato_jpzvz4.mp4';

const ROW_1 = ['YouTube Creators', 'Podcasters', 'Coaches', 'Founders', 'Beauty Brands', 'SaaS Startups', 'Agencies', 'Personal Brands'];
const ROW_2 = ['Reels', 'Shorts', 'TikTok', 'Commercial Ads', 'Docu-Series', 'Product Launches', 'Podcast Clips', 'VSLs'];

// Latest uploads from https://www.youtube.com/@detroonshah-786
const VIDEOS = [
  { id: 'G8wfFOVQMNA', title: 'Build an AI That Works While You Sleep (100 Lines of Python)' },
  { id: 'AUgWPIx5Xrg', title: 'Anthropic Just Launched Claude Duet: Is It Worth It?' },
  { id: 'Wkxbj9VmIUE', title: 'Microsoft Just Asked 60,000 Employees If They Want to Leave' },
  { id: '2qfw90L8zIc', title: 'Update PHP or Go Offline: The Warning That Shut Down Websites' },
  { id: 'mXWjT48Im7s', title: "How WhatsApp Knows You're Online the Second You Turn On Wi-Fi" },
  { id: 'xJGcAL5OVV8', title: 'Your YOLO Model Failed & You Have 4 Hours… What Do You Do?' },
  { id: 'yUgiQXw5iGc', title: 'Anthropic Built Its Own Git Alternative (Scion Explained)' },
  { id: '7r3bH0K3UVM', title: 'Meta\u2019s "Watermelon" AI Explained' },
];
type VideoItem = (typeof VIDEOS)[number];

const TRACKS = [
  { label: 'A_ROLL', w: ['40%', '70%', '40%'], o: 0.9 },
  { label: 'SFX_LAYER', w: ['60%', '30%', '60%'], o: 0.7 },
  { label: 'OVERLAYS', w: ['30%', '80%', '30%'], o: 0.55 },
  { label: 'TEXT_ANIM', w: ['50%', '20%', '50%'], o: 0.4 },
];

function Sticker({ children, className = '', rotate = 0 }: { children: ReactNode; className?: string; rotate?: number }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: 0 }}
      whileInView={{ scale: 1, rotate }}
      viewport={{ once: true }}
      transition={{ type: 'spring', bounce: 0.5 }}
      className={`absolute z-30 flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase text-white shadow-lg md:text-xs pointer-events-none select-none ${className}`}
      style={{ background: P }}
    >
      {children}
    </motion.div>
  );
}

function Marquee({ items, reverse }: { items: string[]; reverse?: boolean }) {
  return (
    <div className="relative mb-6 flex w-full overflow-hidden">
      <div className="ve-marquee flex" style={{ animationDirection: reverse ? 'reverse' : 'normal' }}>
        {[...items, ...items].map((name, i) => (
          <div key={i} className="glass mx-2 flex min-w-[200px] items-center gap-3 whitespace-nowrap rounded-full px-8 py-4">
            <span className="h-2 w-2 rounded-full" style={{ background: P }} />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 hidden select-none overflow-hidden opacity-30 md:block">
      <div className="ve-timeline absolute left-0 right-0 top-[20%] space-y-4">
        <div className="flex gap-2">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="relative h-16 shrink-0 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]" style={{ width: ((i * 37) % 150) + 80 }}>
              <span className="absolute bottom-2 left-2 font-mono text-[8px] text-[hsl(var(--muted-foreground))]">C00{i}_RAW.mp4</span>
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 15 }, (_, i) => (
            <div key={i} className="flex h-12 w-32 shrink-0 items-center justify-center gap-[2px] rounded-md border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.08)]">
              {[30, 70, 45, 85, 40].map((h, j) => (
                <span key={j} className="w-1 rounded-full bg-[hsl(var(--primary)/0.5)]" style={{ height: `${h}%` }} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <svg className="absolute left-0 top-[30%] h-64 w-full opacity-30" viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,150 Q100,150 150,100 T300,50 T450,120 T600,30 T800,100 T1000,80" fill="none" stroke={P} strokeWidth="2" />
      </svg>
      <div className="absolute bottom-0 left-1/2 top-0 z-10 w-[2px]" style={{ background: P }}>
        <div className="absolute top-20 -translate-x-1/2 rounded-sm px-1 text-[9px] font-bold text-white" style={{ background: P }}>00:00:14:22</div>
      </div>
    </div>
  );
}

export default function VideoEditingDesign() {
  const scroller = useRef<HTMLDivElement>(null);
  const drag = useRef({ on: false, moved: false, x: 0, left: 0 });
  const [selected, setSelected] = useState<VideoItem | null>(null);

  const openHire = () => {
    window.dispatchEvent(new CustomEvent('openHireMeModal', {
      detail: { title: 'Video Editing', price: 'Custom quote', category: 'Video Editing' },
    }));
  };
  const scrollBy = (left: number) => scroller.current?.scrollBy({ left, behavior: 'smooth' });
  const onDown = (e: MouseEvent) => {
    if (!scroller.current) return;
    drag.current = { on: true, moved: false, x: e.pageX, left: scroller.current.scrollLeft };
  };
  const onMove = (e: MouseEvent) => {
    if (!drag.current.on || !scroller.current) return;
    const walk = (e.pageX - drag.current.x) * 2;
    if (Math.abs(walk) > 6) drag.current.moved = true;
    scroller.current.scrollLeft = drag.current.left - walk;
  };
  const onUp = () => { drag.current.on = false; };

  return (
    <div className="overflow-x-hidden">
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setSelected(null)} aria-label="Close preview" className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white">
                <X size={20} />
              </button>
              <iframe
                className="aspect-video w-full bg-black"
                src={`https://www.youtube-nocookie.com/embed/${selected.id}?autoplay=1`}
                title={selected.title}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
              <div className="p-6">
                <h3 className="font-display text-2xl">{selected.title}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HERO */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden border-b border-[hsl(var(--border))] pb-40 pt-28">
        <TimelineBackground />
        <Sticker className="left-4 top-24 md:left-12"><span className="h-2 w-2 animate-pulse rounded-full bg-white" /> REC 00:04:12</Sticker>
        <Sticker className="bottom-40 right-4 md:right-12" rotate={-5}><FileVideo size={14} aria-hidden="true" /> RENDER: 99%</Sticker>
        <Sticker className="bottom-20 left-10 hidden lg:flex" rotate={15}><Scissors size={14} aria-hidden="true" /> RAZOR_TOOL_V2</Sticker>

        <div className="relative z-10 mx-auto mt-10 max-w-4xl px-6 text-center">
          <p className="glass mx-auto mb-8 w-fit rounded-full px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--primary))]">Available for New Projects</p>
          <h1 className="mb-8 font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl md:text-8xl">
            VIDEO EDITING THAT<br />
            <em style={{ color: P }}>SCALES YOUR INFLUENCE.</em>
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-sm font-light leading-relaxed text-[hsl(var(--muted-foreground))] md:text-lg">
            I don&apos;t just edit videos. I engineer attention for creators and brands using data-driven pacing, sound design and world-class VFX.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">START PROJECT <ArrowUpRight size={16} aria-hidden="true" /></a>
            <button onClick={openHire} className="btn-outline text-sm"><Calendar size={16} aria-hidden="true" /> SCHEDULE CALL</button>
          </div>
        </div>
      </section>

      {/* 2. MARQUEE */}
      <section className="overflow-hidden border-b border-[hsl(var(--border))] py-20" aria-label="Who and what I edit for">
        <Marquee items={ROW_1} />
        <Marquee items={ROW_2} reverse />
      </section>

      {/* 3. VELOCITY GRAPH */}
      <section id="process" className="cv-auto border-b border-[hsl(var(--border))] px-4 py-20 md:px-6">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <div className="glass relative order-2 flex aspect-square items-end rounded-3xl p-8 md:aspect-video lg:order-1">
            <div className="absolute left-6 top-6 flex items-center gap-2">
              <BarChart3 size={20} style={{ color: P }} aria-hidden="true" />
              <span className="font-mono text-xs uppercase text-[hsl(var(--muted-foreground))]">Algorithmic_Spike.v2</span>
            </div>
            <svg className="absolute inset-0 h-full w-full overflow-visible p-8" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <motion.path
                d="M0,90 Q30,90 40,70 T60,50 T80,20 T100,0" fill="none" stroke={P} strokeWidth="0.6"
                initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 2 }}
              />
              <path d="M0,90 Q30,90 40,70 T60,50 T80,20 T100,0 V100 H0 Z" fill={P} opacity="0.12" />
            </svg>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="mb-6 font-display text-4xl font-bold">Proven Growth <br /><span style={{ color: P }}>Methodology.</span></h2>
            <p className="mb-6 leading-relaxed text-[hsl(var(--muted-foreground))]">
              I don&apos;t guess. I study what makes viral clips work and build every edit so each second gives the viewer a reason to stay.
            </p>
          </div>
        </div>
      </section>

      {/* 4. EDITING ENGINE */}
      <section id="editing" className="cv-auto border-b border-[hsl(var(--border))] px-4 py-20 md:px-6">
        <div className="mx-auto grid max-w-7xl items-center gap-20 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: P }}><Layers size={14} aria-hidden="true" /> Complex VFX</p>
            <h2 className="mb-6 font-display text-4xl font-bold leading-tight md:text-6xl">Editing at the <br /><span style={{ color: P }}>Speed of Culture.</span></h2>
            <p className="mb-8 text-lg leading-relaxed text-[hsl(var(--muted-foreground))]">My timeline is a retention engine: sound design, color grading and viewer psychology working together to keep people hooked.</p>
            <ul className="space-y-4">
              {['Retention Optimization', 'Sound Design', 'Color Grading', 'Format Adaptation'].map((tag) => (
                <li key={tag} className="flex items-center gap-3 font-mono text-sm"><CheckCircle2 size={16} style={{ color: P }} aria-hidden="true" />{tag}</li>
              ))}
            </ul>
          </div>
          <div className="glass flex aspect-[4/3] flex-col overflow-hidden rounded-3xl p-6">
            <div className="mb-8 flex items-center justify-between border-b border-[hsl(var(--border))] pb-4">
              <div className="flex gap-2"><span className="h-3 w-3 rounded-full bg-[#FF5F57]" /><span className="h-3 w-3 rounded-full bg-[#FEBC2E]" /><span className="h-3 w-3 rounded-full bg-[#28C840]" /></div>
              <span className="font-mono text-[10px] text-[hsl(var(--muted-foreground))]">PREMIERE_PRO_TIMELINE</span>
            </div>
            <div className="relative flex-1 space-y-3">
              <div className="ve-playhead absolute bottom-0 top-0 z-20 w-px" style={{ background: P }}><TrendingUp size={12} className="absolute -top-3 -translate-x-1/2" style={{ color: P }} aria-hidden="true" /></div>
              {TRACKS.map((track, i) => (
                <div key={track.label} className="relative flex h-10 w-full items-center overflow-hidden rounded border border-[hsl(var(--border))]">
                  <motion.div className="flex h-full items-center border-l-2 px-2" style={{ borderColor: P, background: `hsl(var(--primary) / ${track.o * 0.3})` }} animate={{ width: track.w }} transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}>
                    <span className="font-mono text-[8px]">{track.label}</span>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. GALLERY */}
      <section id="work" className="relative py-16 md:py-24">
        <div className="mx-auto mb-12 flex max-w-7xl items-end justify-between px-6">
          <div>
            <p className="mb-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: P }}><Video size={12} aria-hidden="true" /> YOUTUBE</p>
            <h2 className="font-display text-4xl font-bold">Latest Videos</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scrollBy(-350)} aria-label="Previous" className="glass flex h-12 w-12 items-center justify-center rounded-full"><ChevronLeft size={24} /></button>
            <button onClick={() => scrollBy(350)} aria-label="Next" className="glass flex h-12 w-12 items-center justify-center rounded-full"><ChevronRight size={24} /></button>
          </div>
        </div>
        <div ref={scroller} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} className="flex cursor-grab snap-x gap-6 overflow-x-auto px-6 pb-12 [scrollbar-width:none] active:cursor-grabbing">
          {VIDEOS.map((video) => (
            <button
              key={video.id}
              onClick={() => { if (!drag.current.moved) setSelected(video); }}
              className="group relative w-[300px] shrink-0 snap-center select-none overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-left transition-transform hover:-translate-y-2 md:w-[400px]"
            >
              <span className="relative block aspect-video overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="" width={480} height={360} loading="lazy" decoding="async" draggable={false} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/25"><span className="flex h-14 w-14 items-center justify-center rounded-full text-white" style={{ background: P }}><Play fill="currentColor" size={22} className="ml-1" aria-hidden="true" /></span></span>
              </span>
              <span className="block p-5 font-medium leading-snug">{video.title}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="relative flex items-center justify-center overflow-hidden border-t border-[hsl(var(--border))] py-40 [perspective:1200px]">
        <motion.div
          initial={{ rotateX: 25, scale: 0.85, opacity: 0, y: 50 }}
          whileInView={{ rotateX: 15, scale: 1, opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="pointer-events-none absolute left-[2.5%] right-[2.5%] top-1/2 z-0 mx-auto aspect-video max-w-5xl -translate-y-1/2"
        >
          <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-[hsl(var(--border))]">
            <video className="h-full w-full object-cover opacity-60" autoPlay muted loop playsInline preload="none">
              <source src={INTRO_VIDEO} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--background))] via-transparent to-[hsl(var(--background))]" />
          </div>
        </motion.div>
        <div className="relative z-10 mx-auto max-w-4xl px-6 pt-20 text-center">
          <p className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-xs font-black uppercase text-white" style={{ background: P }}><Heart size={14} fill="currentColor" aria-hidden="true" /> High Retention</p>
          <h2 className="mb-8 font-display text-5xl font-bold tracking-tight lg:text-8xl">Ready to dominate?</h2>
          <p className="mx-auto mb-12 max-w-2xl text-lg font-light leading-relaxed text-[hsl(var(--muted-foreground))]">Turn your raw footage into content that builds massive organic authority.</p>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="btn-primary text-base">GET STARTED</a>
        </div>
      </section>
    </div>
  );
}
