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
  metaTitle: 'Video Editing Services for Creators & Brands',
  metaDescription:
    'Professional video editing for YouTube, Reels, TikTok and ads: pacing, sound design, color grading and motion graphics. Get a custom quote from Zubair Hussain.',
  keywords: [
    'video editing services',
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
    'Zubair Hussain is a freelance video editor who edits YouTube videos, Reels, TikToks, podcast clips and commercial ads. Each edit covers cutting and pacing, captions, sound design, color grading and motion graphics, with exports sized for every platform you publish on.',
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
    { q: 'What types of videos do you edit?', a: 'YouTube videos, Reels, Shorts, TikToks, podcast clips, commercial ads, corporate videos and documentary-style stories.' },
    { q: 'How much does video editing cost?', a: 'Pricing depends on footage length, complexity and turnaround. Book a call or send your brief to get a custom quote.' },
    { q: 'How do I send my footage?', a: 'Share a Google Drive, Dropbox or similar link. Raw footage, logos and any music licenses are all you need to start.' },
    { q: 'Do you include revisions?', a: 'Yes. Revision rounds are agreed in your quote before work starts.' },
  ],
  related: { href: '/graphic-design-services', label: 'See graphic design services' },
};

export const GRAPHIC_DESIGN: CreativeService = {
  path: '/graphic-design-services',
  serviceType: 'Graphic design',
  metaTitle: 'Graphic Design & UI/UX Design Services',
  metaDescription:
    'Logo design, brand identity, social media creatives, YouTube thumbnails and UI/UX design in Figma, Photoshop and Illustrator. Plans start from $5. Book a call.',
  keywords: [
    'graphic design services',
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
    'Zubair Hussain is a freelance graphic and UI/UX designer offering logo design, brand identity, social media creatives, YouTube thumbnails, marketing collateral and interface design. Projects are designed in Figma, Adobe Photoshop and Adobe Illustrator, and plans start from $5 per project.',
  hero: {
    src: '/images/projects/background-image.webp',
    alt: 'Jump to graphic design pricing plans',
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
    { q: 'What graphic design services do you offer?', a: 'Logo design, brand identity, social media creatives, YouTube thumbnails, UI/UX design, design systems, marketing collateral, ad creatives and packaging artwork.' },
    { q: 'How much does graphic design cost?', a: 'Plans start from $5 per project, from $7 for a full brand or UI/UX package, and from $20 per month for ongoing design work.' },
    { q: 'What files will I receive?', a: 'Editable source files plus final exports such as SVG, PNG and PDF, with print files in CMYK when needed.' },
    { q: 'Which design tools do you use?', a: 'Figma for UI/UX, Adobe Photoshop for raster work and Adobe Illustrator for logos and vector artwork.' },
  ],
  related: { href: '/video-editing-services', label: 'See video editing services' },
};
