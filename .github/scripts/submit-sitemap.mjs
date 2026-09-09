import { getGoogleAccessToken } from './google-service-account.mjs';

const [siteArg] = process.argv.slice(2);
if (!siteArg) throw new Error('Usage: submit-sitemap.mjs <site-url>');

const credentialsJson = process.env.GOOGLE_SEARCH_CONSOLE_CREDENTIALS?.trim();
if (!credentialsJson) {
  throw new Error(
    'GOOGLE_SEARCH_CONSOLE_CREDENTIALS is required to submit sitemap changes to Search Console.',
  );
}

const site = siteArg.replace(/\/+$/, '');
const sitemapUrl = `${site}/sitemap.xml`;
const searchConsoleSite = process.env.SEARCH_CONSOLE_SITE_URL || `${site}/`;
const credentials = JSON.parse(credentialsJson);
const accessToken = await getGoogleAccessToken(
  credentials,
  'https://www.googleapis.com/auth/webmasters',
);
const endpoint =
  `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(searchConsoleSite)}` +
  `/sitemaps/${encodeURIComponent(sitemapUrl)}`;
const response = await fetch(endpoint, {
  method: 'PUT',
  headers: { authorization: `Bearer ${accessToken}` },
  signal: AbortSignal.timeout(30_000),
});
if (!response.ok) {
  const body = await response.text();
  throw new Error(
    `Search Console sitemap submission failed (${response.status}): ${body || response.statusText}`,
  );
}

console.log(`Submitted ${sitemapUrl} to Search Console property ${searchConsoleSite}.`);
if (process.env.GITHUB_STEP_SUMMARY) {
  const { appendFile } = await import('node:fs/promises');
  await appendFile(
    process.env.GITHUB_STEP_SUMMARY,
    `\nThe sitemap URL set changed, so **${sitemapUrl}** was resubmitted to Search Console.\n`,
    'utf8',
  );
}
