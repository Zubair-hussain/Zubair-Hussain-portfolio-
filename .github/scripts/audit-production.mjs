import { readFile } from 'node:fs/promises';

const [siteArg, sitemapPath, homepagePath] = process.argv.slice(2);
if (!siteArg || !sitemapPath || !homepagePath) {
  throw new Error('Usage: audit-production.mjs <site-url> <sitemap-file> <homepage-file>');
}

const site = siteArg.replace(/\/+$/, '');
const [sitemap, homepage] = await Promise.all([
  readFile(sitemapPath, 'utf8'),
  readFile(homepagePath, 'utf8'),
]);

const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/gi)].map((match) => match[1].trim());
if (sitemapUrls.length < 2) throw new Error('Sitemap must include at least the homepage and blog index.');

const description = homepage.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1];
if (!description) throw new Error('Homepage meta description is missing.');
if (description.length > 160) throw new Error(`Homepage meta description is ${description.length} characters (maximum 160).`);

const canonical = homepage.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1];
if (!canonical) throw new Error('Homepage canonical URL is missing.');
if (!canonical.startsWith('https://')) throw new Error(`Canonical URL is not HTTPS: ${canonical}`);

const siteOrigin = new URL(site).origin;
for (const value of sitemapUrls) {
  const url = new URL(value);
  if (url.protocol !== 'https:') throw new Error(`Non-HTTPS sitemap URL: ${value}`);
  if (url.origin !== siteOrigin) throw new Error(`Off-site sitemap URL: ${value}`);

  const response = await fetch(value, { redirect: 'manual', signal: AbortSignal.timeout(20_000) });
  if (response.status !== 200) throw new Error(`${value} returned HTTP ${response.status}.`);
}

console.log(`Verified ${sitemapUrls.length} sitemap URLs, canonical HTTPS, and metadata.`);
