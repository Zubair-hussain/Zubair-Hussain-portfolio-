'use client';

import { useRef, memo } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Globe, Smartphone, Brain, Palette, ShoppingCart, BarChart3 } from 'lucide-react';

const services = [
  {
    icon: Globe,
    title: 'Full Stack Web Development',
    description: 'End-to-end web applications with Next.js, Node.js, and modern databases. From landing pages to complex SaaS platforms.',
    price: 'From $800',
    features: ['Next.js 15 + React 19', 'REST & GraphQL APIs', 'Auth & Payments', 'CI/CD Deployment'],
    color: '#C9A84C',
  },
  {
    icon: Smartphone,
    title: 'Mobile App Development',
    description: 'Cross-platform iOS & Android apps with React Native. Native performance with code reuse.',
    price: 'From $1,200',
    features: ['React Native', 'Expo / Bare workflow', 'Push Notifications', 'App Store Deployment'],
    color: '#4ECDC4',
  },
  {
    icon: Brain,
    title: 'AI Integration & Automation',
    description: 'Embed AI into your product using OpenAI, Anthropic, LangChain, and n8n workflow automation.',
    price: 'From $600',
    features: ['ChatGPT / Claude APIs', 'LangChain Agents', 'n8n Workflows', 'Voice AI (Vapi/Retell)'],
    color: '#A8E6CF',
    featured: true,
  },
  {
    icon: Palette,
    title: 'UI/UX Design & Frontend',
    description: 'Pixel-perfect interfaces with Figma designs, Framer Motion animations, and Tailwind CSS.',
    price: 'From $400',
    features: ['Figma Design', 'Framer Motion', 'Responsive Design', 'Accessibility (WCAG)'],
    color: '#FF6B9D',
  },
  {
    icon: ShoppingCart,
    title: 'E-Commerce Solutions',
    description: 'High-converting online stores with WooCommerce, Shopify, or custom MERN stack solutions.',
    price: 'From $700',
    features: ['WooCommerce/Shopify', 'Payment Gateways', 'Inventory Management', 'SEO Optimization'],
    color: '#FFE66D',
  },
  {
    icon: BarChart3,
    title: 'SEO & Performance',
    description: 'Lighthouse 100 scores, Core Web Vitals optimization, and organic search growth strategies.',
    price: 'From $300',
    features: ['Lighthouse 100/100', 'Core Web Vitals', 'Technical SEO', 'Speed Optimization'],
    color: '#C9A84C',
  },
];

const ServiceCard = memo(function ServiceCard({
  service, index, inView,
}: {
  service: typeof services[0]; index: number; inView: boolean;
}) {
  const Icon = service.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`relative flex flex-col gap-6 py-10 border-b border-white/5 transition-colors hover:border-red-500/20 group ${service.featured ? 'lg:scale-105 z-10' : ''}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div
        className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
        style={{ background: `${service.color}10`, border: `1px solid ${service.color}20` }}
      >
        <Icon size={24} style={{ color: service.color }} aria-hidden="true" />
      </div>

      <div>
        <h3 className="text-2xl font-black tracking-tight mb-3 text-white group-hover:text-red-400 transition-colors uppercase italic">
          {service.title}
        </h3>
        <p className="text-white/50 text-base leading-relaxed max-w-sm">{service.description}</p>
      </div>

      <ul className="flex flex-col gap-2.5 my-4" aria-label={`${service.title} features`}>
        {service.features.map((f) => (
          <li key={f} className="flex items-center gap-3 text-xs font-mono tracking-widest uppercase text-white/40">
            <span className="w-1.5 h-px bg-red-500/50" aria-hidden="true" />
            {f}
          </li>
        ))}
      </ul>

      <div className="pt-6 flex items-center justify-between mt-auto">
        <span className="text-3xl font-black tracking-tighter text-white/90">{service.price}</span>
        <button
          onClick={(e) => {
            e.preventDefault();
            window.dispatchEvent(
              new CustomEvent('openHireMeModal', {
                detail: {
                  title: service.title,
                  price: service.price,
                  category: service.title.toLowerCase().includes('mobile') ? 'mobile' : 
                            service.title.toLowerCase().includes('ai') ? 'ai' : 'web'
                }
              })
            );
          }}
          className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono tracking-widest uppercase transition-all"
        >
          {service.featured ? 'Start Now' : 'Get Quote'} →
        </button>
      </div>
    </motion.div>
  );
});

export default function Services() {
  const t = useTranslations('services');
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      id="services"
      ref={ref}
      className="py-24 md:py-32 lg:py-48 relative overflow-hidden bg-black"
      aria-labelledby="services-heading"
    >
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-24"
        >
          <div className="flex items-center gap-4 mb-4">
            <span className="h-px w-12 bg-red-500/50" />
            <p className="text-sm font-mono tracking-[0.4em] uppercase text-red-500/80 font-medium">
              {t('label')}
            </p>
          </div>
          <h2 id="services-heading" className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter bg-gradient-to-br from-white to-red-500/30 bg-clip-text text-transparent uppercase italic leading-none">
            {t('heading')}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 md:gap-x-12 md:gap-y-16">
          {services.map((service, i) => (
            <ServiceCard key={service.title} service={service} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
