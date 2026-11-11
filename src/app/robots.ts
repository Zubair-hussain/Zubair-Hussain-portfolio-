import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-url';

export const dynamic = 'force-static';

// Search and AI crawlers named explicitly, so the site stays open to them even
// if a broader rule is tightened later. A named group replaces the '*' group
// for that bot, so each one repeats the /api/ exclusion.
const NAMED_CRAWLERS = [
  'Googlebot',
  'Bingbot',
  'DuckDuckBot',
  'Applebot',
  'Google-Extended',
  'Applebot-Extended',
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Meta-ExternalAgent',
  'Amazonbot',
  'CCBot',
];

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  return {
    rules: [
      { userAgent: NAMED_CRAWLERS, allow: '/', disallow: '/api/' },
      {
        // All crawlers (Google, Bing, and AI crawlers) may index the site,
        // but not the API endpoints (JSON/redirects shouldn't appear in search).
        userAgent: '*',
        allow: '/',
        disallow: '/api/',
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
