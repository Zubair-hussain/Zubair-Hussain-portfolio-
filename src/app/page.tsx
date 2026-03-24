import { Suspense, lazy } from 'react';
import { getTranslations } from 'next-intl/server';
import Navigation from '@/components/ui/Navigation';
import Hero from '@/components/sections/Hero';
import Footer from '@/components/ui/Footer';
import ScrollProgress from '@/components/ui/ScrollProgress';
import CustomCursor from '@/components/ui/CustomCursor';
import AIChatbox from '@/components/ui/AIChatbox';
import BackToTop from '@/components/ui/BackToTop';
import CookieConsent from '@/components/ui/CookieConsent';
import LenisProvider from '@/components/ui/LenisProvider';
import ThemeProvider from '@/components/ui/ThemeProvider';

// Lazy loaded sections for performance
const About = lazy(() => import('@/components/sections/About'));
const Skills = lazy(() => import('@/components/sections/Skills'));
const Achievements = lazy(() => import('@/components/sections/Achievements'));
const Projects = lazy(() => import('@/components/sections/Projects'));
const Testimonials = lazy(() => import('@/components/sections/Testimonials'));
const ClientLogos = lazy(() => import('@/components/sections/ClientLogos'));
const Services = lazy(() => import('@/components/sections/Services'));
const FAQ = lazy(() => import('@/components/sections/FAQ'));
const Articles = lazy(() => import('@/components/sections/Articles'));

const SectionFallback = () => (
  <div className="section-padding container-custom">
    <div className="h-64 glass rounded-2xl animate-pulse" />
  </div>
);

export default async function HomePage() {
  await getTranslations('nav');

  return (
    <ThemeProvider>
      <LenisProvider>
        <CustomCursor />
        <ScrollProgress />
        <Navigation />

        <main id="main-content">
          {/* Hero: above fold, priority loaded */}
          <Hero />

          {/* Lazy sections below fold */}
          <Suspense fallback={<SectionFallback />}>
            <About />
          </Suspense>

          <Suspense fallback={<SectionFallback />}>
            <Skills />
          </Suspense>

          <Suspense fallback={<SectionFallback />}>
            <Achievements />
          </Suspense>

          <Suspense fallback={<SectionFallback />}>
            <Projects />
          </Suspense>

          <Suspense fallback={<SectionFallback />}>
            <Testimonials />
          </Suspense>

          <Suspense fallback={<SectionFallback />}>
            <ClientLogos />
          </Suspense>

          <Suspense fallback={<SectionFallback />}>
            <Services />
          </Suspense>

          <Suspense fallback={<SectionFallback />}>
            <FAQ />
          </Suspense>

          <Suspense fallback={<SectionFallback />}>
            <Articles />
          </Suspense>
        </main>

        <Footer />

        {/* Floating elements */}
        <AIChatbox />
        <BackToTop />
        <CookieConsent />
      </LenisProvider>
    </ThemeProvider>
  );
}
