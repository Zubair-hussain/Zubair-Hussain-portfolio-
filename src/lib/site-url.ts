/**
 * Single source of truth for the site's public origin.
 *
 * Production always uses the canonical custom domain below. This prevents a
 * stale dashboard variable or Cloudflare preview hostname from leaking into
 * canonical tags, structured data, robots.txt, or sitemap.xml.
 *
 * Development priority:
 *   1. NEXT_PUBLIC_SITE_URL  — optional local/preview override.
 *   2. SITE_URL              — non-public alias, if you prefer.
 *   3. CF_PAGES_URL          — Cloudflare Pages injects this automatically
 *                              (e.g. https://zubair--portfolio.pages.dev), so
 *                              robots.txt / sitemap.xml / canonical URLs are
 *                              correct on the generated URL with NO config.
 *   4. localhost fallback    — dev only.
 *
 * Keep this constant in sync only if the canonical production domain changes.
 */
export const PRODUCTION_SITE_URL = 'https://zubairhussain.xyz';

export function getSiteUrl(): string {
  if (process.env.NODE_ENV === 'production') return PRODUCTION_SITE_URL;

  const fallback = 'http://localhost:3000';
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.CF_PAGES_URL ||
    fallback;

  let candidate = raw.trim().replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(candidate)) candidate = `https://${candidate}`;

  try {
    const parsed = new URL(candidate);
    if (parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
      parsed.protocol = 'https:';
    }
    return parsed.origin;
  } catch {
    return fallback;
  }
}
