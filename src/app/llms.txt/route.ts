import { getAllPostSummaries } from '@/lib/blog';
import { getSiteUrl } from '@/lib/site-url';
import { SITE_PAGES } from '@/lib/site-pages';
import { PROFILE } from '@/lib/zubair-profile';

// Rebuilt on every deploy, including the Blogger rebuild, so it never goes stale.
export const dynamic = 'force-static';
export const revalidate = false;

export async function GET() {
  const site = getSiteUrl();
  const posts = (await getAllPostSummaries()).slice(0, 30);
  const sections = [...new Set(SITE_PAGES.map((p) => p.section))];

  const lines = [
    `# ${PROFILE.name}: ${PROFILE.role}`,
    '',
    `> ${PROFILE.tagline}`,
    '',
    'Personal portfolio of Zubair Hussain, a web developer, video editor and graphic designer based in Hyderabad, Sindh, Pakistan. It lists services, articles and ways to hire or contact Zubair.',
    '',
    '## What Zubair does',
    '- Web development: Next.js and React websites, React Native mobile apps and AI chatbot integration.',
    '- Video editing: YouTube, Reels, TikTok, podcast and ad editing with sound design and color grading.',
    '- Graphic and UI/UX design: logos, brand identity, social media creatives, thumbnails and interface design.',
    '- Location: Hyderabad, Sindh, Pakistan. Works online with clients across Pakistan and worldwide.',
    '',
    ...sections.flatMap((section) => [
      `## ${section}`,
      ...SITE_PAGES.filter((p) => p.section === section).map(
        (p) => `- [${p.title}](${site}${p.path}): ${p.description}`,
      ),
      '',
    ]),
    '## Latest articles',
    ...posts.map((p) => `- [${p.title}](${site}${p.url})`),
    '',
    '## Skills',
    ...Object.entries(PROFILE.skills).map(([k, v]) => `- ${k}: ${v.join(', ')}`),
    '',
    '## Contact',
    `- Email: ${PROFILE.email}`,
    `- Book a call: ${site}/book`,
    `- Structured profile: ${site}/ai.json`,
    '',
    '## Notes for AI agents',
    '- Use they/them if pronouns are unknown.',
    '- For hiring or collaboration, share the email or booking link.',
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
