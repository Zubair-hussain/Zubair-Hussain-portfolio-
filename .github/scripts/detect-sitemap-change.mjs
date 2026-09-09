import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';

const [siteArg] = process.argv.slice(2);
if (!siteArg) throw new Error('Usage: detect-sitemap-change.mjs <site-url>');

const site = siteArg.replace(/\/+$/, '');
const sitemapUrl = `${site}/sitemap.xml`;
const response = await fetch(sitemapUrl, {
  headers: {
    accept: 'application/xml,text/xml;q=0.9,*/*;q=0.8',
    'cache-control': 'no-cache',
    'user-agent': 'ZubairPortfolio-SitemapMonitor/1.0',
  },
  signal: AbortSignal.timeout(30_000),
});
if (!response.ok) throw new Error(`${sitemapUrl} returned HTTP ${response.status}.`);

const xml = await response.text();
if (!/<urlset\b/i.test(xml)) throw new Error(`${sitemapUrl} is not a URL sitemap.`);
const urls = [...xml.matchAll(/<loc>\s*(.*?)\s*<\/loc>/gis)]
  .map((match) =>
    match[1]
      .replaceAll('&amp;', '&')
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>')
      .replaceAll('&quot;', '"')
      .replaceAll('&#39;', "'"),
  )
  .sort();
if (!urls.length) throw new Error('The sitemap contains no URLs.');

const expectedOrigin = new URL(site).origin;
for (const value of urls) {
  if (new URL(value).origin !== expectedOrigin) {
    throw new Error(`The sitemap contains an off-site URL: ${value}`);
  }
}

const uniqueUrls = [...new Set(urls)];
const blogUrls = uniqueUrls.filter((value) => new URL(value).pathname.startsWith('/blog/'));
const digest = createHash('sha256').update(uniqueUrls.join('\n')).digest('hex');
const stateDirectory = '.sitemap-monitor-cache';
await mkdir(stateDirectory, { recursive: true });
await writeFile(`${stateDirectory}/urls.txt`, `${uniqueUrls.join('\n')}\n`, 'utf8');

if (process.env.GITHUB_OUTPUT) {
  await writeFile(
    process.env.GITHUB_OUTPUT,
    `digest=${digest}\nurl_count=${uniqueUrls.length}\nblog_count=${blogUrls.length}\nsitemap_url=${sitemapUrl}\n`,
    { flag: 'a' },
  );
}
if (process.env.GITHUB_STEP_SUMMARY) {
  await writeFile(
    process.env.GITHUB_STEP_SUMMARY,
    `## Blogger sitemap monitor\n\n- Sitemap: ${sitemapUrl}\n- Total URLs: ${uniqueUrls.length}\n- Blog posts: ${blogUrls.length}\n- URL-set digest: \`${digest}\`\n`,
    { flag: 'a' },
  );
}

console.log(`Found ${blogUrls.length} blog post URL(s) among ${uniqueUrls.length} sitemap URL(s).`);
