'use client';

import { useState, useRef, useCallback, memo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ExternalLink, Github, X, ArrowUpRight, Zap } from 'lucide-react';

type Category = 'all' | 'web' | 'mobile' | 'ai';

interface Project {
  id: string;
  title: string;
  description: string;
  category: Exclude<Category, 'all'>[];
  tags: string[];
  image: string;
  liveUrl?: string;
  githubUrl?: string;
  figmaUrl?: string;
  featured?: boolean;
}

const projects: Project[] = [
  {
    id: 'tensis-agency',
    title: 'Tensis-Agency',
    description: 'A cutting-edge agency portfolio showcasing high-performance aesthetics and fluid user experiences for modern brands.',
    category: ['web'],
    tags: ['Next.js', 'Design', 'Tailwind', 'Performance'],
    image: '/images/projects/tensis.svg',
    liveUrl: 'https://tensis-agency.vercel.app/',
    githubUrl: 'https://github.com/Zubair-hussain/Tensis-Agency',
    featured: true,
  },
  {
    id: 'privacy-vault',
    title: 'PrivacyVault',
    description: 'Take Back Control of Your Digital Life. A comprehensive security suite designed to give users total control over their digital footprint.',
    category: ['web'],
    tags: ['Security', 'Next.js', 'Encryption', 'Privacy'],
    image: '/images/projects/privacy-vault.svg',
    liveUrl: 'https://privacy-vault-take-back-co-git-b9a4fd-zubair-hussain-s-projects.vercel.app/',
    githubUrl: 'https://github.com/Zubair-hussain/-PrivacyVault-Take-Back-Control-of-Your-Digital-Life',
    featured: true,
  },
  {
    id: 'xovato-ecommerce',
    title: 'Xovato-E-Commerce',
    description: 'Custom React-based E-commerce solution for high-conversion retail. Features advanced filtering, real-time inventory, and premium motion design.',
    category: ['web'],
    tags: ['React', 'Node.js', 'Stripe', 'Framer Motion'],
    image: '/images/projects/xovato-ecom.svg',
    liveUrl: 'https://xovato-e-commerce.vercel.app',
    githubUrl: 'https://github.com/Zubair-hussain/Xovato-E-Commerce',
    featured: true,
  },
  {
    id: 'organic-products',
    title: 'Organic-products',
    description: 'A premium landing page for organic products, focusing on natural aesthetics and smooth user interactions.',
    category: ['web'],
    tags: ['HTML', 'CSS', 'JavaScript', 'Design'],
    image: '/images/projects/organic.svg',
    liveUrl: 'https://zubair-hussain236.github.io/Organic-products-/',
    githubUrl: 'https://github.com/Zubair-hussain236/Organic-products-',
    featured: true,
  },
  {
    id: 'sundown-studio',
    title: 'Sundown Studio',
    description: 'A high-end web experience inspired by Sundown Studio, featuring complex animations and a unique design language.',
    category: ['web'],
    tags: ['GSAP', 'Locomotive Scroll', 'Design', 'Frontend'],
    image: '/images/projects/sundown.svg',
    liveUrl: 'https://zubair-hussain236.github.io/SunDown-Webpage-/',
    githubUrl: 'https://github.com/Zubair-hussain236/SunDown-Webpage-',
    featured: true,
  },
  {
    id: 'event-sync-mobile',
    title: 'EventSync Mobile App',
    description: 'Cross-platform event management app built with React Native. Includes real-time ticketing, QR scanning, and push notification systems.',
    category: ['mobile'],
    tags: ['React Native', 'Firebase', 'Mobile'],
    image: '/images/projects/mobile-app.svg',
    githubUrl: 'https://github.com/Zubair-hussain/event-app',
  },
  {
    id: 'backend-ai',
    title: 'AI Conversational Engine',
    description: 'The actual neural engine powering this site\'s chatbox. Includes LLM orchestration, vector search, and custom knowledge integration.',
    category: ['ai'],
    tags: ['Python', 'LLM', 'FastAPI', 'Vercel'],
    image: '/images/projects/ai-engine.svg',
    githubUrl: 'https://github.com/Zubair-hussain/Backend-Ai--Model-',
  },
];

const ProjectModal = memo(function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
        <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-black border border-white/5 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-[0_0_100px_rgba(0,0,0,1)]"
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent="true"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Image */}
          <div className="relative h-40 sm:h-64 overflow-hidden rounded-t-2xl bg-[hsl(var(--secondary))]">
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            unoptimized
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--card))] to-transparent" />
        </div>

        <div className="p-8 flex flex-col gap-6">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-mono border border-[hsl(var(--primary)/0.3)] text-[hsl(var(--primary))]"
              >
                {tag}
              </span>
            ))}
          </div>

          <h3 className="font-display text-3xl font-light">{project.title}</h3>
          <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">{project.description}</p>

          {/* Figma embed placeholder */}
          {project.figmaUrl && (
            <div className="rounded-xl overflow-hidden border border-[hsl(var(--border))] h-64">
              <iframe
                src={project.figmaUrl}
                className="w-full h-full"
                title={`${project.title} Figma design`}
                loading="lazy"
              />
            </div>
          )}

          {/* Links */}
          <div className="flex gap-4 pt-2">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs"
              >
                <ExternalLink size={12} aria-hidden="true" />
                Live Demo
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline text-xs"
              >
                <Github size={12} aria-hidden="true" />
                Source Code
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

const ProjectCard = memo(function ProjectCard({
  project,
  index,
  inView,
  onOpen,
}: {
  project: Project;
  index: number;
  inView: boolean;
  onOpen: (p: Project) => void;
}) {
  const [showLive, setShowLive] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="masonry-item"
    >
      <div 
        className="relative overflow-hidden group bg-[#0a0a0a] border border-white/5 rounded-lg transition-all duration-500 hover:border-red-500/30 hover:shadow-[0_20px_50px_rgba(220,20,30,0.1)]"
        onClick={() => !showLive && onOpen(project)}
      >
        {/* Window Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
          <div className="flex gap-1.5 items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            
            <div className="ml-3 text-[10px] font-mono text-white/20 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
              {project.id === 'privacy-vault' ? 'secure_vault.exe' : project.id + '.web'}
            </div>
          </div>
          
          {project.liveUrl && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowLive(!showLive); }}
              className={`text-[9px] font-mono uppercase tracking-[0.2em] px-3 py-1 rounded transition-all duration-300 ${showLive ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
            >
              {showLive ? 'Close Live' : 'Go Live'}
            </button>
          )}
        </div>

        {/* Content Area */}
          <div className="relative h-[16rem] sm:h-[22rem] md:h-[28rem] bg-[#111] overflow-hidden">
          <AnimatePresence mode="wait">
            {!showLive ? (
              <motion.div
                key="image"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative w-full h-full"
              >
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  unoptimized
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60" />

                {/* Overlay Play Button */}
                {project.liveUrl && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="bg-red-500/20 border border-red-500/50 p-6 rounded-full backdrop-blur-sm transform scale-90 group-hover:scale-100 transition-transform duration-500">
                      <Zap size={32} className="text-red-500 animate-pulse" />
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="iframe"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full h-full bg-white"
              >
                <iframe 
                  src={project.liveUrl} 
                  className="w-full h-full border-none"
                  title={project.title}
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {project.featured && !showLive && (
            <div className="absolute top-3 right-3 px-2 py-1 text-[9px] font-mono tracking-tighter bg-red-600 text-white uppercase font-bold transform rotate-3 z-10">
              Featured
            </div>
          )}
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {project.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[9px] font-mono text-white/40 border border-white/10 px-2 py-1 rounded-sm bg-white/[0.02]">
                {tag}
              </span>
            ))}
          </div>
          
          <div>
            <h3 className="font-display text-xl font-medium text-white/90 group-hover:text-red-500 transition-colors duration-300">
              {project.title}
            </h3>
            <p className="text-sm text-white/40 line-clamp-2 leading-relaxed mt-2 font-light">
              {project.description}
            </p>
          </div>

          <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
            <button 
              onClick={(e) => { e.stopPropagation(); onOpen(project); }}
              className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase text-white/30 hover:text-red-500 transition-colors"
            >
              <span>Project Details</span>
              <ArrowUpRight size={10} aria-hidden="true" />
            </button>
            
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-mono uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all duration-300"
              >
                <span>External Link</span>
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default function Projects() {
  const t = useTranslations('projects');
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [active, setActive] = useState<Category>('all');
  const [selected, setSelected] = useState<Project | null>(null);

  const filtered = active === 'all' ? projects : projects.filter((p) => p.category.includes(active));
  const filters: { key: Category; label: string }[] = [
    { key: 'all', label: t('all') },
    { key: 'web', label: t('web') },
    { key: 'mobile', label: t('mobile') },
    { key: 'ai', label: t('ai') },
  ];

  const openModal = useCallback((p: Project) => setSelected(p), []);
  const closeModal = useCallback(() => setSelected(null), []);

  return (
    <>
      <section
        id="projects"
        ref={ref}
        className="py-24 md:py-32 lg:py-40 relative overflow-hidden bg-black"
        aria-labelledby="projects-heading"
      >
        <div className="container-custom">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="h-px w-12 bg-red-500/50" />
              <p className="text-sm font-mono tracking-[0.4em] uppercase text-red-500/80 font-medium">
                {t('label')}
              </p>
            </div>
            <h2 id="projects-heading" className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 sm:mb-12 bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent uppercase italic leading-none">
              {t('heading')}
            </h2>

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Project filter">
              {filters.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActive(key)}
                  role="tab"
                  aria-selected={active === key}
                  className={`px-5 py-2 text-xs font-mono tracking-widest uppercase transition-all duration-200 ${
                    active === key
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                      : 'border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Masonry grid */}
          <div className="masonry-grid" role="tabpanel">
            <AnimatePresence mode="popLayout">
              {filtered.map((project, i) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={i}
                  inView={inView}
                  onOpen={openModal}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selected && <ProjectModal project={selected} onClose={closeModal} />}
      </AnimatePresence>
    </>
  );
}
