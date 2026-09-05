/**
 * Single source of truth for the site's public origin.
 *
 * Priority:
 *   1. NEXT_PUBLIC_SITE_URL  — set this once you have a custom domain.
 *   2. SITE_URL              — non-public alias, if you prefer.
 *   3. CF_PAGES_URL          — Cloudflare Pages injects this automatically
 *                              (e.g. https://zubair--portfolio.pages.dev), so
 *                              robots.txt / sitemap.xml / canonical URLs are
 *                              correct on the generated URL with NO config.
 *   4. localhost fallback    — dev only.
 *
 * Set NEXT_PUBLIC_SITE_URL in Cloudflare Pages → Settings → Environment
 * variables when you attach a custom domain; everything updates on redeploy.
 */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.CF_PAGES_URL ||
    'http://localhost:3000';

  let candidate = raw.trim().replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(candidate)) candidate = `https://${candidate}`;

  try {
    const parsed = new URL(candidate);
    if (parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
      parsed.protocol = 'https:';
    }
    return parsed.origin;
  } catch {
    return 'http://localhost:3000';
  }
}
