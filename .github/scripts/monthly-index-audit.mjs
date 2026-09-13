import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const [siteArg, reportPath = "portfolio-audit-report.md"] =
  process.argv.slice(2);

if (!siteArg) {
  throw new Error(
    "Usage: monthly-index-audit.mjs <site-url> [report-path]",
  );
}

const site = siteArg.replace(/\/+$/, "");

const userAgent = "ZubairPortfolio-SEOAudit/1.0";

const failures = [];
const warnings = [];
const crawlRows = [];

function normalizeUrl(value) {
  const url = new URL(value);
  url.hash = "";

  url.pathname =
    url.pathname === "/" ? "/" : url.pathname.replace(/\/+$/, "");

  return url.toString();
}

function escapeCell(value) {
  return String(value ?? "")
    .replaceAll("|", "\\|")
    .replaceAll("\n", " ");
}

function readAttribute(tag, name) {
  return tag.match(
    new RegExp(`\\s${name}=["']([^"']*)["']`, "i"),
  )?.[1];
}

function metaContent(html, name) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (
      readAttribute(tag, "name")?.toLowerCase() ===
      name.toLowerCase()
    ) {
      return readAttribute(tag, "content");
    }
  }

  return undefined;
}

function canonicalUrls(html) {
  return (html.match(/<link\b[^>]*>/gi) ?? [])
    .filter((tag) =>
      readAttribute(tag, "rel")
        ?.toLowerCase()
        .split(/\s+/)
        .includes("canonical"),
    )
    .map((tag) => readAttribute(tag, "href"))
    .filter(Boolean);
}

function extractJsonLd(html) {
  const values = [];

  for (const match of html.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      values.push(JSON.parse(match[1]));
    } catch {
      warnings.push("A page contains invalid JSON-LD.");
    }
  }

  return values;
}

function flattenSchemas(value) {
  const schemas = [];

  function visit(entry) {
    if (!entry || typeof entry !== "object") return;

    if (Array.isArray(entry)) {
      entry.forEach(visit);
      return;
    }

    if (entry["@type"]) {
      schemas.push(entry);
    }

    if (Array.isArray(entry["@graph"])) {
      entry["@graph"].forEach(visit);
    }
  }

  visit(value);

  return schemas;
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": userAgent,
      accept: "text/html,application/xml;q=0.9,*/*;q=0.8",
    },

    redirect: "follow",

    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(
      `${url} returned HTTP ${response.status}`,
    );
  }

  return {
    response,
    text: await response.text(),
  };
}

async function sitemapUrls(sitemapUrl, seen = new Set()) {
  if (seen.has(sitemapUrl)) {
    return [];
  }

  seen.add(sitemapUrl);

  const { text } = await fetchText(sitemapUrl);

  const locations = [
    ...text.matchAll(
      /<loc>\s*(.*?)\s*<\/loc>/gis,
    ),
  ].map((match) =>
    match[1]
      .replaceAll("&amp;", "&")
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll("&quot;", '"')
      .replaceAll("&#39;", "'"),
  );

  if (/<sitemapindex\b/i.test(text)) {
    const nested = await Promise.all(
      locations.map((url) =>
        sitemapUrls(url, seen),
      ),
    );

    return nested.flat();
  }

  if (!/<urlset\b/i.test(text)) {
    throw new Error(
      `${sitemapUrl} is not a valid sitemap.`,
    );
  }

  return locations;
}

async function auditUrl(url) {
  try {
    const { response, text: html } =
      await fetchText(url);

    const requestedUrl = normalizeUrl(url);
    const finalUrl = normalizeUrl(response.url);

    if (finalUrl !== requestedUrl) {
      failures.push(
        `${url} redirects to ${response.url}.`,
      );
    }

    const canonicals =
      canonicalUrls(html);

    const robotsMeta =
      metaContent(html, "robots");

    const googlebotMeta =
      metaContent(html, "googlebot");

    const xRobots =
      response.headers.get("x-robots-tag") || "";

    const robotValues =
      [
        robotsMeta,
        googlebotMeta,
        xRobots,
      ]
        .filter(Boolean)
        .join("; ") ||
      "indexable by default";

    if (canonicals.length !== 1) {
      failures.push(
        `${url} has ${canonicals.length} canonical tags; expected exactly one.`,
      );
    } else {
      const canonical =
        normalizeUrl(
          new URL(
            canonicals[0],
            url,
          ),
        );

      if (
        canonical !==
        requestedUrl
      ) {
        failures.push(
          `${url} canonical points to ${canonicals[0]}.`,
        );
      }
    }

    if (
      /\bnoindex\b/i.test(
        robotValues,
      )
    ) {
      failures.push(
        `${url} contains a noindex directive.`,
      );
    }

    const title =
      html
        .match(
          /<title\b[^>]*>([\s\S]*?)<\/title>/i,
        )?.[1]
        ?.replace(/<[^>]+>/g, "")
        ?.trim() || "";

    const description =
      metaContent(
        html,
        "description",
      );

    const h1Count =
      (
        html.match(
          /<h1\b/gi,
        ) ?? []
      ).length;

    if (!title) {
      failures.push(
        `${url} is missing a title.`,
      );
    }

    if (!description) {
      warnings.push(
        `${url} is missing a meta description.`,
      );
    }

    if (h1Count !== 1) {
      warnings.push(
        `${url} contains ${h1Count} H1 tags.`,
      );
    }

    const schemas =
      extractJsonLd(html)
        .flatMap(
          flattenSchemas,
        );

    const schemaTypes =
      schemas
        .map(
          (schema) =>
            schema["@type"],
        )
        .flat()
        .filter(Boolean);

    if (
      new URL(url).pathname.startsWith(
        "/blog/",
      )
    ) {
      const hasArticleSchema =
        schemas.some(
          (schema) =>
            [
              "Article",
              "BlogPosting",
            ].includes(
              schema["@type"],
            ),
        );

      if (!hasArticleSchema) {
        warnings.push(
          `${url} has no BlogPosting or Article structured data.`,
        );
      }
    }

    crawlRows.push({
      url,
      status:
        response.status,
      canonical:
        canonicals[0] ||
        "missing",
      robots:
        robotValues,
      title:
        title ||
        "missing",
      schema:
        schemaTypes.join(", ") ||
        "none",
    });
  } catch (error) {
    failures.push(
      error.message,
    );

    crawlRows.push({
      url,
      status: "ERROR",
      canonical: "unknown",
      robots: "unknown",
      title: "unknown",
      schema: "unknown",
    });
  }
}

async function writeReport(urls) {
  const lines = [
    "# Portfolio SEO and crawler audit",
    "",
    `- Site: ${site}`,
    `- Checked: ${new Date().toISOString()}`,
    `- Sitemap URLs: ${urls.length}`,
    `- Google Search Console API: disabled`,
    `- External indexing requests: none`,
    `- Result: ${
      failures.length
        ? `FAILED (${failures.length} issue(s))`
        : "PASSED"
    }`,
    "",
    "## Portfolio crawler checks",
    "",
    "| URL | HTTP | Canonical | Robots | Title | Schema |",
    "| --- | ---: | --- | --- | --- | --- |",

    ...crawlRows.map(
      (row) =>
        `| ${escapeCell(row.url)} | ${row.status} | ${escapeCell(row.canonical)} | ${escapeCell(row.robots)} | ${escapeCell(row.title)} | ${escapeCell(row.schema)} |`,
    ),
  ];

  if (warnings.length) {
    lines.push(
      "",
      "## Warnings",
      "",
      ...warnings.map(
        (warning) =>
          `- ${warning}`,
      ),
    );
  }

  if (failures.length) {
    lines.push(
      "",
      "## Failures",
      "",
      ...failures.map(
        (failure) =>
          `- ${failure}`,
      ),
    );
  }

  const report =
    `${lines.join("\n")}\n`;

  await mkdir(
    dirname(reportPath),
    {
      recursive: true,
    },
  );

  await writeFile(
    reportPath,
    report,
    "utf8",
  );

  if (
    process.env
      .GITHUB_STEP_SUMMARY
  ) {
    await writeFile(
      process.env
        .GITHUB_STEP_SUMMARY,
      report,
      { flag: "a" },
    );
  }
}

let urls = [];

try {
  const robotsUrl =
    `${site}/robots.txt`;

  const [
    { text: robots },
    discoveredUrls,
  ] =
    await Promise.all([
      fetchText(
        robotsUrl,
      ),
      sitemapUrls(
        `${site}/sitemap.xml`,
      ),
    ]);

  urls = [
    ...new Set(
      discoveredUrls.map(
        normalizeUrl,
      ),
    ),
  ];

  if (!urls.length) {
    failures.push(
      "The sitemap contains no URLs.",
    );
  }

  if (
    !/user-agent:\s*\*/i.test(
      robots,
    )
  ) {
    failures.push(
      "robots.txt has no wildcard user-agent rule.",
    );
  }

  if (
    /disallow:\s*\/\s*(?:\r?\n|$)/i.test(
      robots,
    )
  ) {
    failures.push(
      "robots.txt disallows the entire site.",
    );
  }

  if (
    !robots.includes(
      `${site}/sitemap.xml`,
    )
  ) {
    warnings.push(
      "robots.txt does not reference the production sitemap.",
    );
  }

  for (const url of urls) {
    await auditUrl(url);
  }
} catch (error) {
  failures.push(
    error.stack ||
      error.message,
  );
} finally {
  await writeReport(urls);
}

if (failures.length) {
  console.error(
    failures.join("\n"),
  );

  process.exitCode = 1;
} else {
  console.log(
    `Audited ${urls.length} portfolio URL(s). No Google Search Console API requests were made.`,
  );
}
