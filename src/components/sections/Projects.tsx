'use client';

import { useState, useRef, useCallback, memo, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  ExternalLink, Github, X, ArrowUpRight, Eye, Clock, Sparkles,
  History, PlayCircle, FileText,
} from 'lucide-react';

/* ============================================================================
 *  PROJECTS — 3-slot curated showcase
 *  ---------------------------------------------------------------------------
 *  HOW ORDERING WORKS (read this before adding a project):
 *   - Add a new object to `projects` below with today's `date` (YYYY-MM-DD).
 *   - The newest `date` automatically fills the ① LATEST card.
 *   - The oldest `date` fills the ③ LEGACY card.
 *   - The ② SPOTLIGHT card is the richest/most-viewed of the rest — it is
 *     picked by a score (views + has video + has docs + image count), or you
 *     can force it with `spotlight: true` on exactly one project.
 *  So: just add your project with a recent date and it shows up first. ✅
 * ========================================================================== */

interface Project {
  id: string;
  title: string;
  description: string;
  date: string;              // YYYY-MM-DD — drives Latest/Legacy ordering
  views?: number;            // rough popularity (for the Spotlight pick + badge)
  tags: string[];
  image: string;
  images?: string[];         // optional gallery (shown in modal)
  videoUrl?: string;         // optional demo video (YouTube URL → embedded)
  docsUrl?: string;          // optional documentation link
  liveUrl?: string;
  githubUrl?: string;
  figmaUrl?: string;
  spotlight?: boolean;       // force this into the Spotlight slot
}

const projects: Project[] = [
  {
    id: 'tensis-agency',
    title: 'Tensis-Agency',
    description:
      'A cutting-edge agency portfolio showcasing high-performance aesthetics and fluid user experiences for modern brands.',
    date: '2025-11-02',
    views: 1200,
    tags: ['Next.js', 'Design', 'Tailwind', 'Performance'],
    image: '/images/projects/tensis.svg',
    liveUrl: 'https://tensis-agency.vercel.app/',
    githubUrl: 'https://github.com/Zubair-hussain/Tensis-Agency',
  },
  {
    id: 'backend-ai',
    title: 'AI Conversational Engine',
    description:
      "The neural engine powering this site's chatbox. LLM orchestration, vector search, and custom knowledge integration.",
    date: '2025-09-18',
    views: 1500,
    tags: ['Python', 'LLM', 'FastAPI', 'Vercel'],
    image: '/images/projects/ai-engine.svg',
    githubUrl: 'https://github.com/Zubair-hussain/Backend-Ai--Model-',
  },
  {
    id: 'privacy-vault',
    title: 'PrivacyVault',
    description:
      'Take back control of your digital life — a comprehensive security suite giving users total control over their digital footprint. Fully documented, with a walkthrough video and screens.',
    date: '2025-08-10',
    views: 2400,
    spotlight: true,
    tags: ['Security', 'Next.js', 'Encryption', 'Privacy'],
    image: '/images/projects/privacy-vault.svg',
    liveUrl:
      'https://privacy-vault-take-back-co-git-b9a4fd-zubair-hussain-s-projects.vercel.app/',
    githubUrl:
      'https://github.com/Zubair-hussain/-PrivacyVault-Take-Back-Control-of-Your-Digital-Life',
    docsUrl:
      'https://github.com/Zubair-hussain/-PrivacyVault-Take-Back-Control-of-Your-Digital-Life#readme',
  },
  {
    id: 'xovato-ecommerce',
    title: 'Xovato E-Commerce',
    description:
      'Custom React e-commerce for high-conversion retail — advanced filtering, real-time inventory, and premium motion design.',
    date: '2025-06-05',
    views: 1800,
    tags: ['React', 'Node.js', 'Stripe', 'Framer Motion'],
    image: '/images/projects/xovato-ecom.svg',
    liveUrl: 'https://xovato-e-commerce.vercel.app',
    githubUrl: 'https://github.com/Zubair-hussain/Xovato-E-Commerce',
  },
  {
    id: 'event-sync-mobile',
    title: 'EventSync Mobile App',
    description:
      'Cross-platform event management app in React Native — real-time ticketing, QR scanning, and push notifications.',
    date: '2025-02-20',
    views: 500,
    tags: ['React Native', 'Firebase', 'Mobile'],
    image: '/images/projects/mobile-app.svg',
    githubUrl: 'https://github.com/Zubair-hussain/event-app',
  },
  {
    id: 'organic-products',
    title: 'Organic Products',
    description:
      'A premium landing page for organic products, focused on natural aesthetics and smooth interactions.',
    date: '2024-09-12',
    views: 600,
    tags: ['HTML', 'CSS', 'JavaScript', 'Design'],
    image: '/images/projects/organic.svg',
    liveUrl: 'https://zubair-hussain236.github.io/Organic-products-/',
    githubUrl: 'https://github.com/Zubair-hussain236/Organic-products-',
  },
  {
    id: 'sundown-studio',
    title: 'Sundown Studio',
    description:
      'A high-end web experience inspired by Sundown Studio — complex animation and a distinct design language.',
    date: '2024-05-03',
    views: 900,
    tags: ['GSAP', 'Locomotive', 'Design', 'Frontend'],
    image: '/images/projects/sundown.svg',
    liveUrl: 'https://zubair-hussain236.github.io/SunDown-Webpage-/',
    githubUrl: 'https://github.com/Zubair-hussain236/SunDown-Webpage-',
  },
];

type SlotKey = 'latest' | 'spotlight' | 'legacy';
interface Slot {
  key: SlotKey;
  label: string;
  hint: string;
  Icon: typeof Clock;
  project: Project;
}

/** Pick exactly three distinct projects for the three roles. */
function useShowcase(): Slot[] {
  return useMemo(() => {
    if (projects.length === 0) return [];
    const byNewest = [...projects].sort(
      (a, b) => +new Date(b.date) - +new Date(a.date)
    );
    const latest = byNewest[0];
    const legacy = byNewest[byNewest.length - 1];

    const richness = (p: Project) =>
      (p.views ?? 0) +
      (p.videoUrl ? 800 : 0) +
      (p.docsUrl ? 500 : 0) +
      (p.images?.length ?? 0) * 200;

    const forced = projects.find((p) => p.spotlight && p.id !== latest.id && p.id !== legacy.id);
    const spotlight =
      forced ??
      [...projects]
        .filter((p) => p.id !== latest.id && p.id !== legacy.id)
        .sort((a, b) => richness(b) - richness(a))[0] ??
      byNewest[1] ??
      latest;

    const slots: Slot[] = [
      { key: 'latest', label: 'Latest', hint: 'Freshly shipped', Icon: Clock, project: latest },
      { key: 'spotlight', label: 'Spotlight', hint: 'Most viewed · fully documented', Icon: Sparkles, project: spotlight },
      { key: 'legacy', label: 'Legacy', hint: 'Where it started', Icon: History, project: legacy },
    ];
    // De-duplicate if there are fewer than 3 unique projects.
    const seen = new Set<string>();
    return slots.filter((s) => (seen.has(s.project.id) ? false : seen.add(s.project.id)));
  }, []);
}

const year = (d: string) => new Date(d).getFullYear();
const fmtViews = (n?: number) =>
  n == null ? null : n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : `${n}`;
const ytEmbed = (url: string) => {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : url;
};

/* ------------------------------- Modal ---------------------------------- */
const ProjectModal = memo(function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const gallery = project.images && project.images.length ? project.images : [project.image];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Project details: ${project.title}`}
    >
      <div className="absolute inset-0 bg-[hsl(var(--foreground)/0.55)] backdrop-blur-sm" aria-hidden="true" />
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 12 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[0_30px_80px_-20px_hsl(var(--foreground)/0.35)]"
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-[hsl(var(--foreground)/0.06)] hover:bg-[hsl(var(--foreground)/0.12)] text-[hsl(var(--foreground)/0.7)] transition-colors"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Media: video if present, else image gallery */}
        {project.videoUrl ? (
          <div className="aspect-video w-full overflow-hidden rounded-t-2xl bg-black">
            <iframe
              src={ytEmbed(project.videoUrl)}
              className="h-full w-full border-0"
              title={`${project.title} demo video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        ) : (
          <div className="relative h-52 sm:h-64 overflow-hidden rounded-t-2xl bg-[hsl(var(--secondary))]">
            <Image
              src={gallery[0]}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              unoptimized
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--card))] to-transparent" />
          </div>
        )}

        <div className="flex flex-col gap-5 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            {project.views != null && (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[hsl(var(--muted-foreground))]">
                <Eye size={13} /> {fmtViews(project.views)} views
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[hsl(var(--muted-foreground))]">
              <Clock size={13} /> {year(project.date)}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-mono border border-[hsl(var(--primary)/0.3)] text-[hsl(var(--primary))] rounded"
              >
                {tag}
              </span>
            ))}
          </div>

          <h3 className="font-display text-3xl font-light text-[hsl(var(--foreground))]">{project.title}</h3>
          <p className="leading-relaxed text-[hsl(var(--muted-foreground))]">{project.description}</p>

          {/* Extra gallery images */}
          {gallery.length > 1 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {gallery.slice(1).map((src) => (
                <div key={src} className="relative aspect-video overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))]">
                  <Image src={src} alt={project.title} fill className="object-cover" sizes="200px" unoptimized />
                </div>
              ))}
            </div>
          )}

          {project.figmaUrl && (
            <div className="h-64 overflow-hidden rounded-xl border border-[hsl(var(--border))]">
              <iframe src={project.figmaUrl} className="h-full w-full" title={`${project.title} Figma design`} loading="lazy" />
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-1">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs">
                <ExternalLink size={12} aria-hidden="true" /> Live Demo
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-outline text-xs">
                <Github size={12} aria-hidden="true" /> Source Code
              </a>
            )}
            {project.docsUrl && (
              <a href={project.docsUrl} target="_blank" rel="noopener noreferrer" className="btn-outline text-xs">
                <FileText size={12} aria-hidden="true" /> Docs
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

/* ------------------------------- Card ----------------------------------- */
const SlotCard = memo(function SlotCard({
  slot,
  index,
  inView,
  onOpen,
}: {
  slot: Slot;
  index: number;
  inView: boolean;
  onOpen: (p: Project) => void;
}) {
  const { project, Icon, label, hint } = slot;
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onOpen(project)}
      className="group flex flex-col text-left rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:border-[hsl(var(--primary)/0.5)] hover:shadow-[0_24px_60px_-24px_hsl(var(--primary)/0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
    >
      {/* Slot ribbon */}
      <div className="flex items-center justify-between px-5 pt-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.08)] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-[hsl(var(--primary))]">
          <Icon size={12} /> {label}
        </span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <p className="px-5 pt-1.5 text-[11px] text-[hsl(var(--muted-foreground))]">{hint}</p>

      {/* Media */}
      <div className="relative mx-5 mt-4 aspect-[16/10] overflow-hidden rounded-xl bg-[hsl(var(--secondary))]">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          sizes="(max-width: 768px) 100vw, 33vw"
          unoptimized
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--card)/0.65)] to-transparent" />
        {project.videoUrl && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--foreground)/0.55)] px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-white backdrop-blur-sm">
            <PlayCircle size={12} /> Video
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap gap-1.5">
          {project.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-sm border border-[hsl(var(--border))] px-2 py-0.5 text-[9px] font-mono text-[hsl(var(--muted-foreground))]">
              {tag}
            </span>
          ))}
        </div>

        <h3 className="font-display text-xl font-medium text-[hsl(var(--foreground))] transition-colors group-hover:text-[hsl(var(--primary))]">
          {project.title}
        </h3>
        <p className="line-clamp-2 text-sm font-light leading-relaxed text-[hsl(var(--muted-foreground))]">
          {project.description}
        </p>

        {/* Footer meta */}
        <div className="mt-auto flex items-center justify-between border-t border-[hsl(var(--border))] pt-3 text-[hsl(var(--muted-foreground))]">
          <span className="inline-flex items-center gap-3 text-[11px] font-mono">
            {project.views != null && (
              <span className="inline-flex items-center gap-1"><Eye size={12} /> {fmtViews(project.views)}</span>
            )}
            <span className="inline-flex items-center gap-1"><Clock size={12} /> {year(project.date)}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[hsl(var(--primary))]">
            View <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </motion.button>
  );
});

/* ------------------------------ Section --------------------------------- */
export default function Projects() {
  const t = useTranslations('projects');
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [selected, setSelected] = useState<Project | null>(null);
  const showcase = useShowcase();

  const openModal = useCallback((p: Project) => setSelected(p), []);
  const closeModal = useCallback(() => setSelected(null), []);

  return (
    <>
      <section
        id="projects"
        ref={ref}
        className="py-24 md:py-32 lg:py-40 relative overflow-hidden bg-[hsl(var(--background))]"
        aria-labelledby="projects-heading"
      >
        <div className="container-custom">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="mb-12 md:mb-16"
          >
            <div className="mb-4 flex items-center gap-4">
              <span className="h-px w-12 bg-[hsl(var(--primary)/0.5)]" />
              <p className="text-sm font-mono uppercase tracking-[0.4em] text-[hsl(var(--primary))]">
                {t('label')}
              </p>
            </div>
            <h2
              id="projects-heading"
              className="mb-5 bg-gradient-to-br from-[hsl(var(--foreground))] to-[hsl(var(--foreground)/0.5)] bg-clip-text text-5xl font-black uppercase italic leading-none tracking-tighter text-transparent sm:text-6xl md:text-7xl lg:text-8xl"
            >
              {t('heading')}
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
              A focused pick — the newest build, the flagship, and where it began.
              Tap any card for the full story: video, docs, images and links.
            </p>
          </motion.div>

          {/* 3-card showcase */}
          <div className="grid gap-6 md:grid-cols-3">
            {showcase.map((slot, i) => (
              <SlotCard key={slot.key} slot={slot} index={i} inView={inView} onOpen={openModal} />
            ))}
          </div>

          {/* View all */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-12 flex justify-center"
          >
            <a
              href="https://github.com/Zubair-hussain?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] px-6 py-3 text-xs font-mono uppercase tracking-widest text-[hsl(var(--muted-foreground))] transition-all hover:border-[hsl(var(--primary)/0.5)] hover:text-[hsl(var(--primary))]"
            >
              <Github size={14} /> All projects on GitHub
              <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {selected && <ProjectModal project={selected} onClose={closeModal} />}
      </AnimatePresence>
    </>
  );
}
