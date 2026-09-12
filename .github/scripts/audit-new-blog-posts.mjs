import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const [urlsPath, reportPath = "artifacts/new-blog-seo-report.md"] =
  process.argv.slice(2);
if (!urlsPath) {
  throw new Error("Usage: audit-new-blog-posts.mjs <urls-file> [report-path]");
}

const urls = (await readFile(urlsPath, "utf8"))
  .split(/\r?\n/)
  .map((value) => value.trim())
  .filter(Boolean);
if (!urls.length)
  throw new Error("No new blog URLs were supplied for auditing.");

function readAttribute(tag, name) {
  return tag.match(new RegExp(`\\s${name}=["']([^"']*)["']`, "i"))?.[1];
}

function metaContent(html, key, value) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (readAttribute(tag, key)?.toLowerCase() === value.toLowerCase()) {
      return readAttribute(tag, "content")?.trim();
    }
  }
}

function linkValues(html, relation) {
  return (html.match(/<link\b[^>]*>/gi) ?? [])
    .filter((tag) =>
      readAttribute(tag, "rel")?.toLowerCase().split(/\s+/).includes(relation),
    )
    .map((tag) => readAttribute(tag, "href"))
    .filter(Boolean);
}

function normalizeUrl(value) {
  const url = new URL(value);
  url.hash = "";
  url.pathname = url.pathname === "/" ? "/" : url.pathname.replace(/\/+$/, "");
  return url.toString();
}

function extractSchemas(html) {
  const schemas = [];
  const visit = (value) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) return value.forEach(visit);
    if (value["@type"]) schemas.push(value);
    if (value["@graph"]) visit(value["@graph"]);
  };
  for (const match of html.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      visit(JSON.parse(match[1]));
    } catch {
      schemas.push({ "@type": "Invalid JSON-LD" });
    }
  }
  return schemas;
}

function escapeCell(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

const results = [];
for (const url of urls) {
  const failures = [];
  const warnings = [];
  try {
    const response = await fetch(url, {
      redirect: "manual",
      headers: {
        accept: "text/html",
        "user-agent": "ZubairPortfolio-NewBlogSEOAudit/1.0",
      },
      signal: AbortSignal.timeout(30_000),
    });
    if (response.status !== 200)
      failures.push(
        `Expected HTTP 200 without a redirect; received ${response.status}.`,
      );
    if (!response.headers.get("content-type")?.includes("text/html"))
      failures.push("Response is not HTML.");

    const html = await response.text();
    const title = html
      .match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]
      .replace(/<[^>]+>/g, "")
      .trim();
    const description = metaContent(html, "name", "description");
    const canonicals = linkValues(html, "canonical");
    const robots = [
      metaContent(html, "name", "robots"),
      metaContent(html, "name", "googlebot"),
      response.headers.get("x-robots-tag"),
    ]
      .filter(Boolean)
      .join("; ");
    const h1Count = (html.match(/<h1\b/gi) ?? []).length;

    if (!title) failures.push("Missing HTML title.");
    else if (title.length < 10 || title.length > 70)
      warnings.push(
        `Title length is ${title.length}; aim for 10-70 characters.`,
      );
    if (!description) failures.push("Missing meta description.");
    else if (description.length < 50 || description.length > 160)
      warnings.push(
        `Meta description length is ${description.length}; aim for 50-160 characters.`,
      );
    if (canonicals.length !== 1)
      failures.push(
        `Expected exactly one canonical URL; found ${canonicals.length}.`,
      );
    else if (normalizeUrl(new URL(canonicals[0], url)) !== normalizeUrl(url))
      failures.push(`Canonical points to ${canonicals[0]}.`);
    if (/\bnoindex\b/i.test(robots))
      failures.push("Page contains a noindex directive.");
    if (h1Count !== 1)
      failures.push(`Expected exactly one H1; found ${h1Count}.`);

    const requiredSocialMeta = [
      ["property", "og:title"],
      ["property", "og:description"],
      ["property", "og:url"],
      ["property", "og:image"],
      ["name", "twitter:card"],
      ["name", "twitter:title"],
      ["name", "twitter:description"],
      ["name", "twitter:image"],
    ];
    for (const [attribute, value] of requiredSocialMeta) {
      if (!metaContent(html, attribute, value))
        failures.push(`Missing ${value} metadata.`);
    }
    const ogUrl = metaContent(html, "property", "og:url");
    if (ogUrl && normalizeUrl(new URL(ogUrl, url)) !== normalizeUrl(url))
      failures.push(`og:url points to ${ogUrl}.`);

    const schemas = extractSchemas(html);
    if (schemas.some((schema) => schema["@type"] === "Invalid JSON-LD"))
      failures.push("Page contains invalid JSON-LD.");
    const article = schemas.find((schema) =>
      ["BlogPosting", "Article"].includes(schema["@type"]),
    );
    if (!article)
      failures.push("Missing BlogPosting or Article structured data.");
    else {
      for (const field of [
        "headline",
        "description",
        "datePublished",
        "author",
        "image",
        "mainEntityOfPage",
      ]) {
        if (!article[field])
          failures.push(`Structured data is missing ${field}.`);
      }
    }

    const alternates = linkValues(html, "alternate");
    if (!alternates.length)
      warnings.push("No alternate-language/feed links were detected.");
  } catch (error) {
    failures.push(error.message);
  }
  results.push({ url, failures, warnings });
}

const failed = results.filter((result) => result.failures.length);
const lines = [
  "# New blog SEO readiness audit",
  "",
  `- Checked: ${new Date().toISOString()}`,
  `- New posts: ${results.length}`,
  `- Ready for manual Search Console submission: ${results.length - failed.length}`,
  `- Failed: ${failed.length}`,
  "",
  "| URL | Result | Warnings |",
  "| --- | --- | --- |",
  ...results.map(
    (result) =>
      `| ${escapeCell(result.url)} | ${result.failures.length ? "FAILED" : "READY"} | ${escapeCell(result.warnings.join(" ") || "None")} |`,
  ),
];
for (const result of failed) {
  lines.push(
    "",
    `## ${result.url}`,
    "",
    ...result.failures.map((failure) => `- ${failure}`),
  );
}
const report = `${lines.join("\n")}\n`;
await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, report, "utf8");
if (process.env.GITHUB_STEP_SUMMARY) {
  await writeFile(process.env.GITHUB_STEP_SUMMARY, `\n${report}`, {
    flag: "a",
  });
}

if (failed.length) {
  console.error(
    `${failed.length} of ${results.length} new blog post(s) failed the SEO readiness audit.`,
  );
  process.exitCode = 1;
} else {
  console.log(
    `${results.length} new blog post(s) passed and can be submitted manually in Search Console.`,
  );
}
