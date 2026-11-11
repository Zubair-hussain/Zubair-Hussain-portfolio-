export interface CreativePlan {
  name: string;
  price: string;
  unit: string;
  summary: string;
  features: string[];
  featured?: boolean;
}

export interface CreativeService {
  path: string;
  serviceType: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  eyebrow: string;
  title: string;
  accent: string;
  intro: string;
  answer: string;
  hero: { src: string; alt: string; width: number; height: number; href: string };
  offerings: Array<{ title: string; text: string }>;
  tools: Array<{ mark: string; name: string; text: string }>;
  process: Array<{ title: string; text: string }>;
  plans?: CreativePlan[];
  plansNote?: string;
  faqs: Array<{ q: string; a: string }>;
  related: { href: string; label: string };
}

export const VIDEO_EDITING: CreativeService = {
  path: '/video-editing-services',
  serviceType: 'Video editing',
  metaTitle: 'Video Editing Services in Hyderabad, Pakistan',
  metaDescription:
    'Hire Zubair Hussain, a video editor in Hyderabad, Pakistan. YouTube, Reels, TikTok and ad editing with sound design and color grading. Get a custom quote.',
  keywords: [
    'video editing services',
    'video editor in Hyderabad',
    'video editor Hyderabad Pakistan',
    'best video editor in Hyderabad',
    'video editor for hire',
    'YouTube video editing',
    'Reels editing service',
    'TikTok video editor',
    'short-form video editing',
    'commercial ad editing',
    'podcast clip editing',
    'color grading services',
    'freelance video editor Pakistan',
  ],
  eyebrow: 'Video Editing Services',
  title: 'Edits that keep',
  accent: 'people watching.',
  intro:
    'Short-form and long-form editing for creators, founders and brands, built around pacing, clear storytelling and clean sound.',
  answer:
    'Zubair Hussain is a freelance video editor based in Hyderabad, Sindh, Pakistan, working with clients locally and worldwide. Zubair edits YouTube videos, Reels, TikToks, podcast clips and commercial ads. Each edit covers cutting and pacing, captions, sound design, color grading and motion graphics, with exports sized for every platform you publish on.',
  hero: {
    src: 'https://i.ytimg.com/vi/W3Zmlo3D49Y/hqdefault.jpg',
    alt: 'Watch the intro video by Zubair Hussain',
    width: 480,
    height: 360,
    href: 'https://youtu.be/W3Zmlo3D49Y',
  },
  offerings: [
    { title: 'YouTube Videos', text: 'Long-form edits with strong hooks, chapter pacing, B-roll and retention-focused cuts.' },
    { title: 'Reels, Shorts & TikTok', text: 'Vertical 9:16 edits with animated captions and fast, platform-native pacing.' },
    { title: 'Commercial Ads', text: 'Product and brand spots with a clear offer, call to action and cut-downs for paid social.' },
    { title: 'Podcast Clips', text: 'Multi-camera podcast edits and short highlight clips from long recordings.' },
    { title: 'Corporate Video', text: 'Explainers, testimonials and company videos with a polished, on-brand finish.' },
    { title: 'Documentary Style', text: 'Story-led edits with interviews, archival footage, music and narrative structure.' },
  ],
  tools: [
    { mark: 'Pr', name: 'Premiere Pro', text: 'Multi-track editing, captions and delivery.' },
    { mark: 'Ae', name: 'After Effects', text: 'Motion graphics, titles and compositing.' },
    { mark: 'Lc', name: 'Lumetri Color', text: 'Color correction and color grading.' },
    { mark: 'Au', name: 'Audition', text: 'Dialogue cleanup, mixing and sound design.' },
  ],
  process: [
    { title: 'Brief', text: 'Share your footage, goals, references and target platform.' },
    { title: 'Rough Cut', text: 'A first assembly locks the story, structure and pacing.' },
    { title: 'Fine Cut', text: 'Sound design, color grading, captions and motion graphics are added.' },
    { title: 'Delivery', text: 'Final exports in every aspect ratio you need, after your revisions.' },
  ],
  faqs: [
    { q: 'Where is Zubair Hussain based, and do you work with clients outside Hyderabad?', a: 'Zubair is a video editor based in Hyderabad, Sindh, Pakistan. Projects run fully online, so clients in Karachi, Lahore, Islamabad, the US, the UK and Australia work with Zubair the same way as local ones.' },
    { q: 'What types of videos do you edit?', a: 'YouTube videos, Reels, Shorts, TikToks, podcast clips, commercial ads, corporate videos and documentary-style stories.' },
    { q: 'How much does video editing cost?', a: 'Pricing depends on footage length, complexity and turnaround. Book a call or send your brief to get a custom quote.' },
    { q: 'How do I send my footage?', a: 'Share a Google Drive, Dropbox or similar link. Raw footage, logos and any music licenses are all you need to start.' },
    { q: 'Do you include revisions?', a: 'Yes. Revision rounds are agreed in your quote before work starts.' },
  ],
  related: { href: '/web-development-services', label: 'See web development services' },
};

export const GRAPHIC_DESIGN: CreativeService = {
  path: '/graphic-design-services',
  serviceType: 'Graphic design',
  metaTitle: 'Graphic Design & UI/UX Services in Hyderabad',
  metaDescription:
    'Graphic designer in Hyderabad, Pakistan: logo design, brand identity, social media creatives, YouTube thumbnails and UI/UX design. Plans from $5. Book a call.',
  keywords: [
    'graphic design services',
    'graphic designer in Hyderabad',
    'graphic designer Hyderabad Pakistan',
    'logo designer in Hyderabad',
    'freelance graphic designer',
    'logo design services',
    'brand identity design',
    'social media design',
    'YouTube thumbnail design',
    'UI/UX design services',
    'Figma designer for hire',
    'marketing collateral design',
    'graphic designer Pakistan',
  ],
  eyebrow: 'Graphic Design Services',
  title: 'Design that makes your brand',
  accent: 'impossible to ignore.',
  intro:
    'Brand identity, marketing creatives and UI/UX design, delivered with print-ready and web-ready source files.',
  answer:
    'Zubair Hussain is a freelance graphic and UI/UX designer based in Hyderabad, Sindh, Pakistan, working with clients locally and worldwide. Zubair offers logo design, brand identity, social media creatives, YouTube thumbnails, marketing collateral and interface design. Projects are designed in Figma, Adobe Photoshop and Adobe Illustrator, and plans start from $5 per project.',
  hero: {
    src: '/images/projects/background-image.webp',
    alt: 'Graphic design and UI/UX work by Zubair Hussain',
    width: 1600,
    height: 900,
    href: '#plans',
  },
  offerings: [
    { title: 'Logo Design', text: 'Distinctive primary logos, secondary marks and vector files in every format.' },
    { title: 'Brand Identity', text: 'Color palette, typography, visual language and brand guidelines.' },
    { title: 'Social Media Creatives', text: 'Post templates, carousels and story sets for a consistent feed.' },
    { title: 'YouTube Thumbnails', text: 'High-contrast thumbnails with clear hierarchy, built to improve click-through rate.' },
    { title: 'UI/UX Design', text: 'Wireframes, high-fidelity screens and interactive prototypes for web and mobile.' },
    { title: 'Design Systems', text: 'Reusable components, design tokens and documentation in Figma.' },
    { title: 'Marketing Collateral', text: 'Flyers, brochures, pitch decks and print-ready layouts with correct bleed.' },
    { title: 'Ad Creatives & Packaging', text: 'Display ad sets, banners and packaging artwork for product launches.' },
  ],
  tools: [
    { mark: 'Fg', name: 'Figma', text: 'UI/UX, design systems and interactive prototypes.' },
    { mark: 'Ps', name: 'Photoshop', text: 'Thumbnails, photo manipulation and retouching.' },
    { mark: 'Ai', name: 'Illustrator', text: 'Logos, vector illustration and iconography.' },
    { mark: 'Pr', name: 'Premiere Pro', text: 'Motion graphics and social video edits.' },
  ],
  process: [
    { title: 'Discover', text: 'A quick call covers your goals, audience and visual direction.' },
    { title: 'Concept', text: 'Moodboards and first concepts give you directions to react to.' },
    { title: 'Design', text: 'The chosen concept is refined into high-fidelity artwork.' },
    { title: 'Deliver', text: 'You receive source files and final exports in RGB and CMYK as needed.' },
  ],
  plans: [
    { name: 'Starter', price: '$5', unit: '/project', summary: 'For one focused design need.', features: ['5 social media creatives or 3 thumbnails', '2 revision rounds', 'Source files', '3-day delivery'] },
    { name: 'Pro', price: '$7', unit: '/project', summary: 'A full brand or UI/UX package.', features: ['Logo and brand identity or 8 UI screens', 'Figma prototype', 'Unlimited revisions', 'Priority support'], featured: true },
    { name: 'Monthly', price: '$20', unit: '/month', summary: 'Your on-demand design partner.', features: ['Unlimited design requests', 'Motion graphics and video edits', 'Dedicated Slack channel', '48-hour turnaround'] },
  ],
  plansNote: 'Prices are starting points. Final quotes depend on scope and timeline.',
  faqs: [
    { q: 'Where is Zubair Hussain based, and do you work with clients outside Hyderabad?', a: 'Zubair is a graphic and UI/UX designer based in Hyderabad, Sindh, Pakistan. Projects run fully online, so clients across Pakistan and abroad work with Zubair the same way as local ones.' },
    { q: 'What graphic design services do you offer?', a: 'Logo design, brand identity, social media creatives, YouTube thumbnails, UI/UX design, design systems, marketing collateral, ad creatives and packaging artwork.' },
    { q: 'How much does graphic design cost?', a: 'Plans start from $5 per project, from $7 for a full brand or UI/UX package, and from $20 per month for ongoing design work.' },
    { q: 'What files will I receive?', a: 'Editable source files plus final exports such as SVG, PNG and PDF, with print files in CMYK when needed.' },
    { q: 'Which design tools do you use?', a: 'Figma for UI/UX, Adobe Photoshop for raster work and Adobe Illustrator for logos and vector artwork.' },
  ],
  related: { href: '/video-editing-services', label: 'See video editing services' },
};

export const WEB_DEVELOPMENT: CreativeService = {
  path: '/web-development-services',
  serviceType: 'Web development',
  metaTitle: 'Web Development Services in Hyderabad, Pakistan',
  metaDescription:
    'Hire Zubair Hussain, a web developer in Hyderabad, Pakistan. Fast Next.js websites, web apps, mobile apps and AI chatbots, built for SEO. Book a free call.',
  keywords: [
    'web development services',
    'web developer in Hyderabad',
    'web developer Hyderabad Pakistan',
    'website developer in Hyderabad',
    'website development Pakistan',
    'Next.js developer for hire',
    'React developer Pakistan',
    'React Native app developer',
    'AI chatbot developer',
    'freelance full stack developer',
    'business website design and development',
  ],
  eyebrow: 'Web Development Services',
  title: 'Websites that load fast',
  accent: 'and bring in clients.',
  intro:
    'Business websites, web apps, mobile apps and AI chatbots, built with Next.js and React and set up for search from day one.',
  answer:
    'Zubair Hussain is a freelance full-stack web developer based in Hyderabad, Sindh, Pakistan, working with clients locally and worldwide. Zubair builds business websites, landing pages, web apps and dashboards with Next.js, React and Node.js, mobile apps with React Native, and AI chatbots. Each project includes responsive design, on-page SEO, structured data and full source code ownership.',
  hero: {
    src: '/images/projects/background-image.webp',
    alt: 'Web development work by Zubair Hussain',
    width: 1600,
    height: 900,
    href: '/#projects',
  },
  offerings: [
    { title: 'Business Websites', text: 'Fast, responsive company and portfolio sites that explain what you do and turn visitors into enquiries.' },
    { title: 'Landing Pages', text: 'Single-goal pages for ads and launches, with clear copy structure, forms and analytics.' },
    { title: 'Web Apps & Dashboards', text: 'Full-stack apps with logins, databases, admin panels and reporting, built on Next.js and Node.js.' },
    { title: 'Mobile Apps', text: 'iOS and Android apps from one React Native codebase, connected to your existing backend.' },
    { title: 'AI Chatbots & Integrations', text: 'Chatbots, document search and content tools using OpenAI, Claude or open models, on your own API keys.' },
    { title: 'SEO & Speed Fixes', text: 'Core Web Vitals, metadata, structured data and sitemap work for existing sites that load slowly or rank poorly.' },
  ],
  tools: [
    { mark: 'Nx', name: 'Next.js & React', text: 'Server-rendered pages that load fast and index well.' },
    { mark: 'Ts', name: 'TypeScript', text: 'Typed code that is safer to change later.' },
    { mark: 'Nd', name: 'Node.js & Firebase', text: 'APIs, authentication and databases.' },
    { mark: 'Rn', name: 'React Native', text: 'One codebase for iOS and Android.' },
    { mark: 'Tw', name: 'Tailwind CSS', text: 'Consistent, responsive interfaces.' },
    { mark: 'Cf', name: 'Cloudflare & Vercel', text: 'Global hosting, caching and deployment.' },
  ],
  process: [
    { title: 'Discover', text: 'A free call covers your goals, audience, pages and budget.' },
    { title: 'Plan', text: 'You get a written scope, timeline and fixed quote before work starts.' },
    { title: 'Build', text: 'Design and development happen in stages, with a live preview link to review.' },
    { title: 'Launch', text: 'The site goes live with SEO, analytics and source code handed over to you.' },
  ],
  faqs: [
    { q: 'Where is Zubair Hussain based, and do you work with clients outside Hyderabad?', a: 'Zubair is a web developer based in Hyderabad, Sindh, Pakistan. Projects run fully online, so clients across Pakistan, the US, the UK and Australia work with Zubair the same way as local ones.' },
    { q: 'What kind of websites do you build?', a: 'Business websites, landing pages, portfolios, web apps, dashboards and online stores, plus React Native mobile apps and AI chatbots.' },
    { q: 'How long does a website take?', a: 'A landing page or small site usually takes 1 to 2 weeks. Most projects take 2 to 6 weeks, and a full web app can take 4 to 8 weeks.' },
    { q: 'How much does a website cost?', a: 'Pricing depends on the number of pages, features and timeline. Book a free call or send your brief to get a fixed quote.' },
    { q: 'Will my website be SEO-friendly?', a: 'Yes. Every build includes server-side rendering, meta titles and descriptions, structured data, a sitemap and Core Web Vitals work.' },
    { q: 'Do I own the source code?', a: 'Yes. Full source code ownership transfers to you on final payment, and projects include 2 weeks of free bug fixes after launch.' },
  ],
  related: { href: '/video-editing-services', label: 'See video editing services' },
};
