/**
 * Every public page, in one place. The sitemap, /llms.txt, /ai.json and the
 * chatbot all read this list, so a new page only needs one entry here.
 * test/site-pages.test.ts fails the build if a page exists but is missing.
 */
export interface SitePage {
  path: string;
  title: string;
  description: string;
  section: 'Main' | 'Services' | 'Writing' | 'Contact' | 'Legal';
  /** ISO date of the last meaningful content change. */
  updated: string;
  priority?: number;
}

export const SITE_PAGES: SitePage[] = [
  {
    path: '/',
    title: 'Portfolio home',
    description: 'Projects, skills, services, reviews and how to hire Zubair.',
    section: 'Main',
    updated: '2026-11-07',
    priority: 1,
  },
  {
    path: '/video-editing-services',
    title: 'Video editing services',
    description: 'YouTube, Reels, TikTok, ads and podcast clips with sound design and colour grading.',
    section: 'Services',
    updated: '2026-11-07',
    priority: 0.8,
  },
  {
    path: '/graphic-design-services',
    title: 'Graphic design and UI/UX services',
    description: 'Logos, brand identity, social creatives, thumbnails and UI/UX design. Plans start from $5.',
    section: 'Services',
    updated: '2026-11-07',
    priority: 0.8,
  },
  {
    path: '/blogs',
    title: 'Articles',
    description: 'Guides and news on Next.js, React Native, AI and developer tools.',
    section: 'Writing',
    updated: '2026-11-07',
    priority: 0.8,
  },
  {
    path: '/book',
    title: 'Book a call',
    description: 'Pick a date and time for a free 30-minute Google Meet call.',
    section: 'Contact',
    updated: '2026-11-07',
    priority: 0.6,
  },
  {
    path: '/privacy-policy',
    title: 'Privacy and cookie policy',
    description: 'How personal data and cookies are handled, including GDPR and CCPA rights.',
    section: 'Legal',
    updated: '2026-10-31',
    priority: 0.3,
  },
];

/** Routes that exist on purpose but should not be listed. */
export const UNLISTED_PATHS = ['/03-jacob-coxon-full-article.html'];
