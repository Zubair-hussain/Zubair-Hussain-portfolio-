import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const [siteArg] = process.argv.slice(2);
if (!siteArg) throw new Error("Usage: detect-sitemap-change.mjs <site-url>");

const site = siteArg.replace(/\/+$/, "");
const sitemapUrl = `${site}/sitemap.xml`;
const stateDirectory = ".sitemap-monitor-cache";
const baselinePath = `${stateDirectory}/urls.txt`;
const newUrlsPath = `${stateDirectory}/new-urls.txt`;

let previousUrls = null;
try {
  previousUrls = (await readFile(baselinePath, "utf8"))
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean);
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const response = await fetch(sitemapUrl, {
  headers: {
    accept: "application/xml,text/xml;q=0.9,*/*;q=0.8",
    "cache-control": "no-cache",
    "user-agent": "ZubairPortfolio-SitemapMonitor/1.0",
  },
  signal: AbortSignal.timeout(30_000),
});
if (!response.ok)
  throw new Error(`${sitemapUrl} returned HTTP ${response.status}.`);

const xml = await response.text();
if (!/<urlset\b/i.test(xml))
  throw new Error(`${sitemapUrl} is not a URL sitemap.`);
const urls = [...xml.matchAll(/<loc>\s*(.*?)\s*<\/loc>/gis)]
  .map((match) =>
    match[1]
      .replaceAll("&amp;", "&")
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll("&quot;", '"')
      .replaceAll("&#39;", "'"),
  )
  .sort();
if (!urls.length) throw new Error("The sitemap contains no URLs.");

const expectedOrigin = new URL(site).origin;
for (const value of urls) {
  if (new URL(value).origin !== expectedOrigin) {
    throw new Error(`The sitemap contains an off-site URL: ${value}`);
  }
}

const uniqueUrls = [...new Set(urls)];
const blogUrls = uniqueUrls.filter((value) =>
  new URL(value).pathname.startsWith("/blog/"),
);
const previousBlogUrls = new Set(
  (previousUrls ?? []).filter((value) =>
    new URL(value).pathname.startsWith("/blog/"),
  ),
);
// On the first run, establish a baseline instead of reporting every existing post as new.
const newBlogUrls =
  previousUrls === null
    ? []
    : blogUrls.filter((value) => !previousBlogUrls.has(value));
const digest = createHash("sha256").update(uniqueUrls.join("\n")).digest("hex");
const previousDigest =
  previousUrls === null
    ? null
    : createHash("sha256")
        .update([...new Set(previousUrls)].sort().join("\n"))
        .digest("hex");
const changed = previousDigest !== digest;

await mkdir(stateDirectory, { recursive: true });
await Promise.all([
  writeFile(baselinePath, `${uniqueUrls.join("\n")}\n`, "utf8"),
  writeFile(
    newUrlsPath,
    newBlogUrls.length ? `${newBlogUrls.join("\n")}\n` : "",
    "utf8",
  ),
]);

if (process.env.GITHUB_OUTPUT) {
  await writeFile(
    process.env.GITHUB_OUTPUT,
    `digest=${digest}\nchanged=${changed}\nnew_count=${newBlogUrls.length}\nurl_count=${uniqueUrls.length}\nblog_count=${blogUrls.length}\nsitemap_url=${sitemapUrl}\n`,
    { flag: "a" },
  );
}
if (process.env.GITHUB_STEP_SUMMARY) {
  const status =
    previousUrls === null
      ? "Baseline created; existing posts were not treated as new."
      : newBlogUrls.length
        ? `${newBlogUrls.length} new blog post(s) found.`
        : "No new blog posts found.";
  await writeFile(
    process.env.GITHUB_STEP_SUMMARY,
    `## New blog monitor\n\n- Sitemap: ${sitemapUrl}\n- Total URLs: ${uniqueUrls.length}\n- Blog posts: ${blogUrls.length}\n- Result: ${status}\n`,
    { flag: "a" },
  );
}

console.log(
  previousUrls === null
    ? `Created a baseline containing ${blogUrls.length} blog post URL(s).`
    : `Found ${newBlogUrls.length} new blog post URL(s).`,
);
