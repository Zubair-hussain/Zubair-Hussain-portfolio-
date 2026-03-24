import { getTranslations } from 'next-intl/server';
import HeroContent from './HeroContent';

export default async function Hero() {
  const t = await getTranslations('hero');

  const heroData = {
    available: t('available'),
    greeting: t('greeting'),
    title: t('title'),
    subtitle: t('subtitle'),
    ctaPrimary: t('ctaPrimary'),
    ctaSecondary: t('ctaSecondary'),
  };

  const tags = ['Full-Stack', 'MERN', 'AI', 'Next.js', 'React Native'];

  const stats = [
    { value: '4+', label: 'Years Exp' },
    { value: '50+', label: 'Projects' },
    { value: '30+', label: 'Clients' },
  ];

  return (
    <section id="hero" className="relative w-full bg-black overflow-hidden">
      <HeroContent t={heroData} tags={tags} stats={stats} />
    </section>
  );
}