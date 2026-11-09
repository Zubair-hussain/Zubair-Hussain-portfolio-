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
    'Personal portfolio of Zubair Hussain, with services, articles and ways to hire or contact him.',
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
