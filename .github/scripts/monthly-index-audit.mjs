import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { getGoogleAccessToken } from './google-service-account.mjs';

const [siteArg, reportPath = 'indexing-audit-report.md'] = process.argv.slice(2);
if (!siteArg) {
  throw new Error('Usage: monthly-index-audit.mjs <site-url> [report-path]');
}

const site = siteArg.replace(/\/+$/, '');
const userAgent =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const failures = [];
const crawlRows = [];
const inspectionRows = [];

function normalizeUrl(value) {
  const url = new URL(value);
  url.hash = '';
  url.pathname = url.pathname === '/' ? '/' : url.pathname.replace(/\/+$/, '');
  return url.toString();
}

function escapeCell(value) {
  return String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function readAttribute(tag, name) {
  return tag.match(new RegExp(`\\s${name}=["']([^"']*)["']`, 'i'))?.[1];
}

function metaContent(html, name) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (readAttribute(tag, 'name')?.toLowerCase() === name.toLowerCase()) {
      return readAttribute(tag, 'content');
    }
  }
}

function canonicalUrls(html) {
  return (html.match(/<link\b[^>]*>/gi) ?? [])
    .filter((tag) => readAttribute(tag, 'rel')?.toLowerCase().split(/\s+/).includes('canonical'))
    .map((tag) => readAttribute(tag, 'href'))
    .filter(Boolean);
}

function extractJsonLd(html) {
  return [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => JSON.parse(match[1]));
}

function flattenSchemas(value) {
  const schemas = [];
  const visit = (entry) => {
    if (!entry || typeof entry !== 'object') return;
    if (Array.isArray(entry)) return entry.forEach(visit);
    if (entry['@type']) schemas.push(entry);
    if (Array.isArray(entry['@graph'])) entry['@graph'].forEach(visit);
  };
  visit(value);
  return schemas;
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'user-agent': userAgent, accept: 'text/html,application/xml;q=0.9,*/*;q=0.8' },
    redirect: 'follow',
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return { response, text: await response.text() };
}

async function sitemapUrls(sitemapUrl, seen = new Set()) {
  if (seen.has(sitemapUrl)) return [];
  seen.add(sitemapUrl);
  const { text } = await fetchText(sitemapUrl);
  const locations = [...text.matchAll(/<loc>\s*(.*?)\s*<\/loc>/gis)].map((match) =>
    match[1]
      .replaceAll('&amp;', '&')
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>')
      .replaceAll('&quot;', '"')
      .replaceAll('&#39;', "'"),
  );
  if (/<sitemapindex\b/i.test(text)) {
    const nested = await Promise.all(locations.map((url) => sitemapUrls(url, seen)));
    return nested.flat();
  }
  if (!/<urlset\b/i.test(text)) throw new Error(`${sitemapUrl} is not a valid sitemap.`);
  return locations;
}

async function inspectWithGoogle(urls, credentialsJson) {
  const credentials = JSON.parse(credentialsJson);
  const accessToken = await getGoogleAccessToken(
    credentials,
    'https://www.googleapis.com/auth/webmasters.readonly',
  );
  const searchConsoleSite = process.env.SEARCH_CONSOLE_SITE_URL || `${site}/`;

  for (const url of urls) {
    const response = await fetch(
      'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ inspectionUrl: url, siteUrl: searchConsoleSite, languageCode: 'en-US' }),
        signal: AbortSignal.timeout(30_000),
      },
    );
    const body = await response.json();
    if (!response.ok) {
      throw new Error(
        `Search Console inspection failed for ${url} (${response.status}): ${body.error?.message || 'unknown error'}`,
      );
    }
    const result = body.inspectionResult?.indexStatusResult ?? {};
    const indexed =
      result.verdict === 'PASS' &&
      result.robotsTxtState !== 'DISALLOWED' &&
      result.indexingState !== 'BLOCKED_BY_META_TAG' &&
      result.indexingState !== 'BLOCKED_BY_HTTP_HEADER' &&
      result.pageFetchState !== 'SERVER_ERROR' &&
      result.pageFetchState !== 'SOFT_404' &&
      result.pageFetchState !== 'BLOCKED_ROBOTS_TXT';
    inspectionRows.push({
      url,
      indexed,
      verdict: result.verdict || 'UNKNOWN',
      coverage: result.coverageState || 'Unknown',
      lastCrawl: result.lastCrawlTime || 'Never',
      googleCanonical: result.googleCanonical || 'Unknown',
    });
    if (!indexed) failures.push(`Google does not report ${url} as indexed (${result.coverageState || result.verdict || 'unknown status'}).`);
  }
}

async function writeReport(urls, searchConsoleConfigured) {
  const lines = [
    '# Monthly crawler and indexing audit',
    '',
    `- Site: ${site}`,
    `- Checked: ${new Date().toISOString()}`,
    `- Sitemap URLs: ${urls.length}`,
    `- Search Console inspection: ${searchConsoleConfigured ? 'enabled' : 'not configured'}`,
    `- Result: ${failures.length ? `FAILED (${failures.length} issue(s))` : 'PASSED'}`,
    '',
    '## Crawler checks',
    '',
    '| URL | HTTP | Canonical | Robots |',
    '| --- | ---: | --- | --- |',
    ...crawlRows.map(
      (row) => `| ${escapeCell(row.url)} | ${row.status} | ${escapeCell(row.canonical)} | ${escapeCell(row.robots)} |`,
    ),
  ];
  if (searchConsoleConfigured) {
    lines.push(
      '',
      '## Google Search Console',
      '',
      '| URL | Indexed | Verdict | Coverage | Last crawl | Google canonical |',
      '| --- | --- | --- | --- | --- | --- |',
      ...inspectionRows.map(
        (row) =>
          `| ${escapeCell(row.url)} | ${row.indexed ? 'yes' : 'no'} | ${escapeCell(row.verdict)} | ${escapeCell(row.coverage)} | ${escapeCell(row.lastCrawl)} | ${escapeCell(row.googleCanonical)} |`,
      ),
    );
  } else {
    lines.push(
      '',
      '> Google index verification was skipped. Configure `GOOGLE_SEARCH_CONSOLE_CREDENTIALS` to enable it.',
    );
  }
  if (failures.length) lines.push('', '## Failures', '', ...failures.map((failure) => `- ${failure}`));
  const report = `${lines.join('\n')}\n`;
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, report, 'utf8');
  if (process.env.GITHUB_STEP_SUMMARY) await writeFile(process.env.GITHUB_STEP_SUMMARY, report, { flag: 'a' });
}

let urls = [];
const credentialsJson = process.env.GOOGLE_SEARCH_CONSOLE_CREDENTIALS?.trim();
try {
  const robotsUrl = `${site}/robots.txt`;
  const [{ text: robots }, discoveredUrls] = await Promise.all([
    fetchText(robotsUrl),
    sitemapUrls(`${site}/sitemap.xml`),
  ]);
  urls = [...new Set(discoveredUrls.map(normalizeUrl))];
  if (!urls.length) failures.push('The sitemap contains no URLs.');
  if (!/user-agent:\s*\*/i.test(robots)) failures.push('robots.txt has no wildcard user-agent rule.');
  if (/disallow:\s*\/\s*(?:\r?\n|$)/i.test(robots)) failures.push('robots.txt disallows the entire site.');
  if (!robots.includes(`${site}/sitemap.xml`)) failures.push('robots.txt does not reference the production sitemap.');

  let homepageHtml = '';
  for (const url of urls) {
    try {
      const { response, text: html } = await fetchText(url);
      if (normalizeUrl(response.url) !== normalizeUrl(url)) failures.push(`${url} redirects to ${response.url}.`);
      const canonicals = canonicalUrls(html);
      const robotsMeta = metaContent(html, 'robots');
      const googlebotMeta = metaContent(html, 'googlebot');
      const xRobots = response.headers.get('x-robots-tag') || '';
      const robotValues = [robotsMeta, googlebotMeta, xRobots].filter(Boolean).join('; ') || 'indexable by default';
      if (canonicals.length !== 1) failures.push(`${url} has ${canonicals.length} canonical tags; expected exactly one.`);
      else if (normalizeUrl(new URL(canonicals[0], url)) !== normalizeUrl(url)) failures.push(`${url} canonical points to ${canonicals[0]}.`);
      if (/\bnoindex\b/i.test(robotValues)) failures.push(`${url} contains a noindex directive.`);
      crawlRows.push({ url, status: response.status, canonical: canonicals[0] || 'missing', robots: robotValues });
      if (normalizeUrl(url) === normalizeUrl(`${site}/`)) homepageHtml = html;
    } catch (error) {
      failures.push(error.message);
      crawlRows.push({ url, status: 'ERROR', canonical: 'unknown', robots: 'unknown' });
    }
  }

  if (!homepageHtml) failures.push('The sitemap does not contain the homepage URL.');
  else {
    const schemas = extractJsonLd(homepageHtml).flatMap(flattenSchemas);
    const profilePages = schemas.filter((schema) => schema['@type'] === 'ProfilePage');
    const people = schemas.filter((schema) => schema['@type'] === 'Person');
    const expectedPersonId = `${site}/#person`;
    if (profilePages.length !== 1) failures.push(`Homepage has ${profilePages.length} ProfilePage schemas; expected one.`);
    if (people.length !== 1) failures.push(`Homepage has ${people.length} Person schemas; expected one.`);
    if (profilePages[0]?.mainEntity?.['@id'] !== expectedPersonId) failures.push(`ProfilePage mainEntity must reference ${expectedPersonId}.`);
    if (people[0]?.['@id'] !== expectedPersonId) failures.push(`Person @id must be ${expectedPersonId}.`);
  }

  if (credentialsJson) await inspectWithGoogle(urls, credentialsJson);
} catch (error) {
  failures.push(error.stack || error.message);
} finally {
  await writeReport(urls, Boolean(credentialsJson));
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Verified crawler access for ${urls.length} URL(s)${credentialsJson ? ' and Google index status' : ''}.`);
}
