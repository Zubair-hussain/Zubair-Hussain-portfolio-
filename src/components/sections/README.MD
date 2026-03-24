# Src/Components/Sections - Main Page Sections

This folder contains all the major sections used on the homepage of **Zubair Hussain Portfolio**.

## Folder Structure

```bash
src/components/sections/
├── About.tsx
├── Achievements.tsx
├── Articles.tsx
├── ClientLogos.tsx
├── FAQ.tsx
├── Hero.tsx
├── HeroContent.tsx
├── HeroCTA.tsx
├── Projects.tsx
├── Services.tsx
├── Skills.tsx
├── Testimonials.tsx
└── README.md
```

Component Details
```bash
Hero.tsx           → Main hero section wrapper
HeroContent.tsx    → Hero text, headings, subtitle and animations
HeroCTA.tsx        → Call-to-action buttons in the hero section
About.tsx          → About me and personal introduction section
Skills.tsx         → Skills showcase section
Services.tsx       → Services I offer section
Projects.tsx       → Projects portfolio showcase (largest file)
Achievements.tsx   → Achievements, awards and milestones
Testimonials.tsx   → Client and colleague testimonials
Articles.tsx       → Latest articles or blog previews
ClientLogos.tsx    → Company and client logos
FAQ.tsx            → Frequently Asked Questions section

```

Key Highlights

All sections are modular and reusable
Hero section is intelligently split into 3 separate components for better maintainability
Fully responsive with smooth animations
Easy to add, remove or reorder sections on the homepage

```bash

How to Use
tsx// Example usage in src/app/page.tsx
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Projects } from '@/components/sections/Projects';
import { Skills } from '@/components/sections/Skills';
import { Testimonials } from '@/components/sections/Testimonials';

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Testimonials />
      {/* Add more sections as needed */}
    </>
  );
}

```

Part of: Zubair Hussain Portfolio
Made with ❤️ by Syed Zubair Hussain
