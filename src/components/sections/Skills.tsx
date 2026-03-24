'use client';

import { useRef, useState, useCallback, memo, useEffect } from 'react';
import { motion, useInView, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { 
  Code2, Database, Cpu, Globe, Layout, Smartphone, 
  Layers, Zap, Terminal, Box, Palette, Sparkles,
  Search, Server, Workflow
} from 'lucide-react';

const skillCategories = [
  {
    label: 'Frontend',
    icon: Layout,
    skills: [
      { name: 'React / Next.js', level: 95, icon: Globe },
      { name: 'TypeScript', level: 88, icon: Code2 },
      { name: 'Tailwind CSS', level: 92, icon: Palette },
      { name: 'React Native', level: 82, icon: Smartphone },
      { name: 'Framer Motion', level: 80, icon: Zap },
    ],
  },
  {
    label: 'Backend',
    icon: Database,
    skills: [
      { name: 'Node.js / Express', level: 90, icon: Server },
      { name: 'Python / FastAPI', level: 78, icon: Terminal },
      { name: 'MongoDB', level: 88, icon: Database },
      { name: 'PostgreSQL', level: 75, icon: Database },
      { name: 'GraphQL', level: 72, icon: Workflow },
    ],
  },
  {
    label: 'AI & Tools',
    icon: Cpu,
    skills: [
      { name: 'OpenAI / Anthropic', level: 85, icon: Sparkles },
      { name: 'LangChain / n8n', level: 80, icon: Layers },
      { name: 'WordPress', level: 95, highlight: true, icon: Globe },
      { name: 'Docker / CI-CD', level: 70, icon: Box },
      { name: 'Figma / UI-UX', level: 82, icon: Palette },
    ],
  },
];

const techStack = [
  'React', 'Next.js', 'TypeScript', 'Node.js', 'MongoDB', 'PostgreSQL',
  'Python', 'FastAPI', 'OpenAI', 'LangChain', 'React Native', 'Docker',
  'AWS', 'Vercel', 'WordPress', 'Tailwind', 'GraphQL', 'Redis',
];

const SkillOrbit = memo(function SkillOrbit({
  category, inView
}: {
  category: typeof skillCategories[0]; inView: boolean;
}) {
  const Icon = category.icon;
  
  return (
    <div className="relative w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center scale-[0.6] xs:scale-75 sm:scale-100">
      {/* Fixed Central Category Icon */}
      <motion.div 
        animate={{ 
          boxShadow: [
            "0 0 20px rgba(220,20,30,0.2)",
            "0 0 50px rgba(220,20,30,0.5)",
            "0 0 20px rgba(220,20,30,0.2)"
          ]
        }}
        transition={{ 
          boxShadow: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
        className="relative z-10 w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-black border border-red-500/40 flex items-center justify-center"
      >
        <Icon size={48} className="text-red-500" />
        <div className="absolute inset-0 rounded-full bg-red-500/10 blur-2xl" />
      </motion.div>

      {/* Orbiting Skill Icons (2D Rotation) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        {category.skills.map((skill, i) => {
          const angle = (i / category.skills.length) * 2 * Math.PI;
          
          // Use a fixed scale in JS, and handles mobile sizing through CSS if needed
          // To prevent hydration mismatch, we avoid window checks here.
          const radius = 150; 
          const x = (Math.cos(angle) * radius).toFixed(3);
          const y = (Math.sin(angle) * radius).toFixed(3);

          return (
            <div
              key={skill.name}
              className="absolute"
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
            >
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="group relative flex flex-col items-center pointer-events-auto"
              >
                <div 
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black border ${skill.highlight ? 'border-red-500/60 shadow-[0_0_15px_rgba(220,20,30,0.3)]' : 'border-white/10'} flex items-center justify-center hover:border-red-500 hover:bg-red-500/10 transition-all duration-300 transform hover:scale-125 cursor-default`}
                >
                  <skill.icon size={24} className={`${skill.highlight ? 'text-red-400' : 'text-white/50'} group-hover:text-red-400`} />
                </div>
                
                <div className="absolute -bottom-8 whitespace-nowrap pointer-events-none">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/80 px-2 py-1 rounded">
                    {skill.name}
                  </span>
                </div>
              </motion.div>
            </div>
          );
        })}
      </motion.div>

      {/* Orbit Rings */}
      <div className="absolute w-[220px] h-[220px] sm:w-[300px] sm:h-[300px] rounded-full border border-white/5 pointer-events-none" />
      <div className="absolute w-[220px] h-[220px] sm:w-[300px] sm:h-[300px] rounded-full border border-red-500/5 animate-pulse pointer-events-none" />
    </div>
  );
});

export default function Skills() {
  const t = useTranslations('skills');
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section
      id="skills"
      ref={ref}
      className="py-24 md:py-32 lg:py-40 relative overflow-hidden bg-black"
      aria-labelledby="skills-heading"
    >
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-900/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-950/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-custom relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-16 text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="h-px w-12 bg-red-500/50" />
            <p className="text-sm font-mono tracking-[0.4em] uppercase text-red-500/80 font-medium">
              {t('label')}
            </p>
            <span className="h-px w-12 bg-red-500/50" />
          </div>
          <h2 id="skills-heading" className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent uppercase italic leading-none mb-8">
            {t('heading')}
          </h2>
          
          {/* Category Selector */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-8 sm:mt-12 mb-12 sm:mb-20">
            {skillCategories.map((cat, i) => (
              <button
                key={cat.label}
                onClick={() => setActiveTab(i)}
                className={`relative px-4 py-2 sm:px-8 sm:py-3 font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] transition-all duration-500 overflow-hidden ${activeTab === i ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
              >
                <span className="relative z-10">{cat.label}</span>
                {activeTab === i && (
                  <motion.div 
                    layoutId="activeTabGlow"
                    className="absolute inset-0 bg-red-500/10 border border-red-500/30 rounded-sm"
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Central Display */}
        <div className="flex flex-col items-center justify-center min-h-[350px] sm:min-h-[500px] py-10 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <SkillOrbit category={skillCategories[activeTab]} inView={inView} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Tech Stack Bar */}
        <div className="mt-32 pt-16 border-t border-white/5">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 opacity-30 hover:opacity-100 transition-opacity duration-700">
            {techStack.slice(0, 10).map((tech, i) => (
              <span key={tech} className="text-[10px] font-mono tracking-[0.4em] uppercase text-white hover:text-red-500 transition-colors pointer-events-none">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
