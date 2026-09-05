/**
 * ============================================================================
 *  ZUBAIR AI — Single Source of Truth
 * ============================================================================
 *  This is the ONLY file that describes who Zubair is. The AI bot knows about
 *  Zubair and nothing/nobody else. Edit values here to update the bot instantly.
 *
 *  Live data (GitHub repos + blog posts) is fetched automatically at runtime,
 *  so when you add a new repo or publish a new blog, the bot picks it up with
 *  no code changes and no redeploy. See: src/app/api/chat/route.ts
 * ============================================================================
 */

export const PROFILE = {
  name: 'Syed Zubair Hussain Shah',
  shortName: 'Zubair',
  role: 'Junior Full Stack Developer',

  // One-line elevator pitch used in the bot's intro + system prompt.
  tagline:
    'Junior Full Stack Developer who also builds & trains AI bots/models, designs UI/UX, and edits video.',

  // A tight bio. Keep it factual — the bot answers strictly from this.
  bio: `I'm Zubair — a Junior Full Stack Developer based in Pakistan. Beyond web
development, I build and train AI bots and models, design clean UI/UX, and do
video editing. I like shipping polished, production-ready products end to end:
from design, to frontend, to backend, to deployment on modern platforms like
Cloudflare and Vercel.`,

  // Capabilities the bot is allowed to speak to.
  skills: {
    'Full Stack Development': [
      'React', 'Next.js', 'TypeScript', 'Node.js', 'TailwindCSS', 'REST APIs', 'Firebase',
    ],
    'AI / ML': [
      'Building AI chatbots & agents', 'Training / fine-tuning models',
      'LLM integration', 'Hugging Face', 'Cloudflare Workers AI',
    ],
    'Design': ['UI/UX Design', 'Figma', 'Design systems', 'Prototyping'],
    'Media': ['Video editing', 'Motion / short-form content'],
  } as Record<string, string[]>,

  // Contact + booking. These are the actions the bot will offer.
  email: 'thezubairh@gmail.com',

  actions: {
    schedule: {
      label: 'Schedule a Call',
      publicPath: '/api/schedule',
      privateUrl: 'https://calendly.com/detroonshah/30min',
      envKey: 'CALENDLY_SCHEDULE_URL',
    },
    introVideo: {
      label: 'My Intro',
      title: 'Full Stack Developer | React • Next.js • Node.js • MongoDB | AI-Powered Web Apps & Dashboards',
      url: 'https://youtu.be/W3Zmlo3D49Y',
      embedUrl: 'https://www.youtube.com/embed/W3Zmlo3D49Y',
      thumbnailUrl: 'https://i.ytimg.com/vi/W3Zmlo3D49Y/hqdefault.jpg',
      uploadedAt: '2026-03-16T08:56:28-07:00',
      uploadedDate: '2026-03-16',
      author: 'Detroon Shah',
      authorUrl: 'https://www.youtube.com/@DetroonShah-786',
    },
  },

  socials: {
    github: 'https://github.com/Zubair-Hussain',
    linkedin:
      'https://www.linkedin.com/in/syed-zubair-hussain-shah-491294376',
    blog: 'https://zubair-xovato.blogspot.com/',
    fiverr: 'https://www.fiverr.com/zubair_8223/develop-a-fast-responsive-nextjs-website-for-your-business',
    upwork: 'https://www.upwork.com/services/product/development-it-syed-zubair-2030587661487129538?ref=project_share',
    figma:
      'https://www.figma.com/make/bHNbUpphvzQi6x8qaG12gV/Zubair-Portfolio-design',
  },

  // Independent freelance marketplace links. These are not tied to projects,
  // article cards, or hardcoded package plans, so you can add/remove items safely.
  freelanceProfiles: [
    {
      id: 'fiverr',
      label: 'Fiverr Gigs',
      eyebrow: 'Fixed-scope packages',
      description:
        'Order published service gigs through Fiverr, including website builds, platform pricing, delivery timelines, and secure checkout.',
      href: 'https://www.fiverr.com/zubair_8223/develop-a-fast-responsive-nextjs-website-for-your-business',
      cta: 'View Fiverr Gig',
      highlights: ['Published gigs', 'Platform pricing', 'Secure order flow'],
    },
    {
      id: 'upwork',
      label: 'Upwork Service',
      eyebrow: 'Published Upwork service',
      description:
        'View Zubair\'s published development service, discuss the scope, and hire securely through Upwork.',
      href: 'https://www.upwork.com/services/product/development-it-syed-zubair-2030587661487129538?ref=project_share',
      cta: 'View Upwork Service',
      highlights: ['Published service', 'Scope discussion', 'Secure contract'],
    },
    {
      id: 'direct',
      label: 'Direct Consultation',
      eyebrow: 'Best for quick project fit',
      description:
        'Book a direct call when the work needs a custom quote, a technical discussion, or a faster decision before using a marketplace.',
      href: '/api/schedule',
      cta: 'Book a Call',
      highlights: ['Custom quote', 'Scope review', 'Fast response'],
    },
  ],

  links: [
    { label: 'Schedule a Call', href: '/api/schedule', tag: 'booking' },
    { label: 'My Intro', href: 'https://youtu.be/W3Zmlo3D49Y', tag: 'video' },
    { label: 'Email', href: 'mailto:thezubairh@gmail.com', tag: 'contact' },
    { label: 'GitHub', href: 'https://github.com/Zubair-Hussain', tag: 'code' },
    {
      label: 'Fiverr Gigs',
      href: 'https://www.fiverr.com/zubair_8223/develop-a-fast-responsive-nextjs-website-for-your-business',
      tag: 'freelance',
    },
    {
      label: 'Upwork Service',
      href: 'https://www.upwork.com/services/product/development-it-syed-zubair-2030587661487129538?ref=project_share',
      tag: 'freelance',
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/syed-zubair-hussain-shah-491294376',
      tag: 'professional',
    },
    { label: 'Blog', href: 'https://zubair-xovato.blogspot.com/', tag: 'writing' },
    {
      label: 'Figma',
      href: 'https://www.figma.com/make/bHNbUpphvzQi6x8qaG12gV/Zubair-Portfolio-design',
      tag: 'design',
    },
  ],

  // Live-data source identifiers (used by the API to auto-fetch).
  sources: {
    githubUsername: 'Zubair-Hussain',
    // Blogger JSON feed base — posts are pulled from here automatically.
    blogFeed: 'https://zubair-xovato.blogspot.com/feeds/posts/default?alt=json',
  },
} as const;

export type Profile = typeof PROFILE;
