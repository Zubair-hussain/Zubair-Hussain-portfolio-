import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const [kind, sourcePath, outputDirectory = "artifacts/branded-audit"] =
  process.argv.slice(2);

if (!kind || !sourcePath || !["blog", "lighthouse"].includes(kind)) {
  throw new Error(
    "Usage: generate-branded-audit-report.mjs <blog|lighthouse> <source> [output-directory]",
  );
}

const repository = process.env.GITHUB_REPOSITORY || "Zubair-hussain/Zubair-Hussain-portfolio-";
const repositoryUrl = `https://github.com/${repository}`;
const runUrl = process.env.RUN_URL || repositoryUrl;
const auditUrl = process.env.AUDIT_URL || "Portfolio production deployment";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}

function markSvg(size = 42) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Zubair Hussain"><rect width="32" height="32" rx="8" fill="#c8141e"/><text x="50%" y="55%" font-family="Arial,sans-serif" font-size="20" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="middle">Z</text></svg>`;
}

function githubSvg(size = 18) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="GitHub"><path fill="currentColor" d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.27 3.38.97.1-.75.4-1.27.74-1.56-2.57-.29-5.27-1.28-5.27-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.16 1.18A10.98 10.98 0 0 1 12 6.12c.98 0 1.95.13 2.86.39 2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.71 5.38-5.29 5.67.42.36.79 1.07.79 2.16v3.25c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .7Z"/></svg>`;
}

function parseBlogReport(markdown) {
  const number = (label) =>
    Number(markdown.match(new RegExp(`- ${label}: (\\d+)`, "i"))?.[1] || 0);
  const checked = markdown.match(/- Checked: (.+)/i)?.[1] || new Date().toISOString();
  const rows = markdown
    .split(/\r?\n/)
    .filter((line) => /^\| https?:\/\//.test(line))
    .map((line) => {
      const cells = line
        .slice(1, -1)
        .split(/(?<!\\)\|/)
        .map((cell) => cell.trim().replaceAll("\\|", "|"));
      return { url: cells[0], result: cells[1], detail: cells[2] || "None" };
    });
  const failedSections = [...markdown.matchAll(/^## (https?:\/\/[^\n]+)\n\n([\s\S]*?)(?=\n## |$)/gm)];
  const failureMap = new Map(
    failedSections.map((match) => [
      match[1].trim(),
      [...match[2].matchAll(/^- (.+)$/gm)].map((item) => item[1]),
    ]),
  );
  const total = number("New posts") || rows.length;
  const passed = number("Passed SEO readiness checks");
  const failed = number("Failed");
  const warnings = rows.filter((row) => row.detail !== "None").length;
  return {
    title: "New Blog SEO Readiness",
    eyebrow: "AUTOMATED PORTFOLIO INTELLIGENCE",
    subtitle: "New portfolio articles checked for crawlability, metadata and structured data.",
    target: auditUrl,
    checked,
    status: failed ? "Needs attention" : "Ready",
    statusTone: failed ? "danger" : "success",
    score: total ? Math.round((passed / total) * 100) : 100,
    metrics: [
      { label: "Posts checked", value: total },
      { label: "Ready", value: passed },
      { label: "Failed", value: failed },
      { label: "With guidance", value: warnings },
    ],
    rows: rows.map((row) => ({
      label: row.url.replace(/^https?:\/\//, ""),
      status: row.result,
      tone: row.result === "READY" ? "success" : "danger",
      detail: failureMap.get(row.url)?.join(" ") || row.detail,
    })),
    note: "This is a read-only portfolio audit. It does not submit URLs or request indexing from Google Search Console.",
  };
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(fullPath)));
    else files.push(fullPath);
  }
  return files;
}

async function parseLighthouseReports(directory) {
  let files = [];
  try {
    files = (await walk(directory)).filter((file) => file.endsWith(".json"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  const reports = [];
  for (const file of files) {
    try {
      const value = JSON.parse(await readFile(file, "utf8"));
      if (value?.categories && value?.audits) reports.push(value);
    } catch {
      // Ignore non-Lighthouse JSON such as manifests.
    }
  }

  const grouped = new Map();
  for (const report of reports) {
    const url = report.finalDisplayedUrl || report.finalUrl || report.requestedUrl || auditUrl;
    if (!grouped.has(url)) grouped.set(url, []);
    grouped.get(url).push(report);
  }

  const categoryIds = ["performance", "accessibility", "best-practices", "seo"];
  const pages = [...grouped.entries()].map(([url, values]) => ({
    url,
    scores: Object.fromEntries(
      categoryIds.map((id) => [
        id,
        clampScore(
          (values.reduce((sum, item) => sum + (item.categories[id]?.score || 0), 0) /
            values.length) *
            100,
        ),
      ]),
    ),
    report: values.at(-1),
  }));

  const averages = Object.fromEntries(
    categoryIds.map((id) => [
      id,
      pages.length
        ? Math.round(pages.reduce((sum, page) => sum + page.scores[id], 0) / pages.length)
        : 0,
    ]),
  );
  const issues = [];
  for (const page of pages) {
    for (const audit of Object.values(page.report.audits)) {
      if (
        audit.score == null ||
        audit.score >= 1 ||
        ["notApplicable", "manual", "informative"].includes(audit.scoreDisplayMode)
      ) {
        continue;
      }
      issues.push({
        label: audit.title,
        status: audit.score === 0 ? "Issue" : "Opportunity",
        tone: audit.score === 0 ? "danger" : "warning",
        detail: `${page.url.replace(/^https?:\/\//, "")} · ${String(audit.description || "Review this Lighthouse finding.").replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")}`,
        weight: audit.score === 0 ? 0 : audit.score,
      });
    }
  }
  issues.sort((a, b) => a.weight - b.weight);
  const overall = pages.length
    ? Math.round(categoryIds.reduce((sum, id) => sum + averages[id], 0) / categoryIds.length)
    : 0;
  const statusOverride = process.env.AUDIT_STATUS;
  const failed = statusOverride === "failure" || !pages.length;
  return {
    title: "Portfolio Quality Audit",
    eyebrow: "LIGHTHOUSE · SECURITY & PRODUCTION",
    subtitle: "A clear, executive overview of performance, accessibility, best practices and SEO.",
    target: auditUrl,
    checked: new Date().toISOString(),
    status: failed ? "Needs attention" : "Audit passed",
    statusTone: failed ? "danger" : "success",
    score: overall,
    metrics: [
      { label: "Performance", value: averages.performance || "—" },
      { label: "Accessibility", value: averages.accessibility || "—" },
      { label: "Best practices", value: averages["best-practices"] || "—" },
      { label: "SEO", value: averages.seo || "—" },
    ],
    // Keep the executive PDF to two pages; the artifact retains every raw finding.
    rows: issues.slice(0, 5),
    pages: pages.map(({ url, scores }) => ({ url, scores })),
    note: "Scores are generated by Lighthouse against the deployed portfolio. This workflow does not connect to Google Search Console or request indexing.",
  };
}

const data =
  kind === "blog"
    ? parseBlogReport(await readFile(sourcePath, "utf8"))
    : await parseLighthouseReports(sourcePath);

const scoreTone = data.score >= 90 ? "#22c55e" : data.score >= 70 ? "#daa520" : "#ef4444";
const generatedDate = new Intl.DateTimeFormat("en", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "UTC",
}).format(new Date(data.checked));

const badge = (status, tone) =>
  `<span class="badge ${tone}">${escapeHtml(status)}</span>`;

const emailBadge = (status, tone) => {
  const colors = {
    success: ["#137a43", "#dcfce7"],
    warning: ["#9a5a00", "#fef3c7"],
    danger: ["#b4232c", "#fee2e2"],
  }[tone] || ["#555", "#eee"];
  return `<span style="display:inline-block;padding:7px 11px;border-radius:999px;color:${colors[0]};background:${colors[1]};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em">${escapeHtml(status)}</span>`;
};

const reportHtml = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(data.title)} · Zubair Hussain</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #efebe4; color: #171717; font-family: Inter, Arial, sans-serif; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page { width: 210mm; min-height: 297mm; padding: 17mm 16mm 15mm; position: relative; background: #f6f1e9; page-break-after: always; overflow: hidden; }
  .page:last-child { page-break-after: auto; }
  .cover { color: #f2f2f2; background: #050505; display: flex; flex-direction: column; }
  .cover:before { content: ""; position: absolute; width: 150mm; height: 150mm; left: -55mm; top: 70mm; background: radial-gradient(circle, rgba(200,20,30,.32), transparent 66%); }
  .topbar, .footer { position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; }
  .brand { display: flex; align-items: center; gap: 11px; }
  .brand-name { font-size: 10px; font-weight: 700; letter-spacing: .28em; text-transform: uppercase; }
  .micro { color: #817c75; font: 600 7px/1.5 "Courier New", monospace; letter-spacing: .22em; text-transform: uppercase; }
  .hero { position: relative; z-index: 2; margin-top: 65mm; max-width: 165mm; }
  .eyebrow { color: #ef4444; font: 700 8px/1.4 "Courier New", monospace; letter-spacing: .34em; text-transform: uppercase; }
  h1 { margin: 8mm 0 5mm; font: italic 700 33pt/1.02 Georgia, serif; letter-spacing: -.03em; }
  .hero p { margin: 0; max-width: 135mm; color: #aaa5a2; font-size: 11pt; line-height: 1.7; }
  .cover-meta { position: relative; z-index: 2; margin-top: auto; padding-top: 8mm; border-top: 1px solid #292929; display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 8mm; }
  .cover-meta b { display: block; margin-top: 2mm; color: #f2f2f2; font-size: 9pt; overflow-wrap: anywhere; }
  .page-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 6mm; border-bottom: 1px solid #ded5c8; }
  .section-kicker { color: #c8141e; font: 700 7px "Courier New", monospace; letter-spacing: .32em; }
  h2 { margin: 7mm 0 2mm; font: 500 23pt Georgia, serif; }
  .lede { margin: 0 0 6mm; color: #67626a; font-size: 9pt; line-height: 1.55; }
  .overview { display: grid; grid-template-columns: 50mm 1fr; gap: 8mm; align-items: center; margin: 5mm 0 7mm; }
  .score-ring { width: 46mm; height: 46mm; border-radius: 50%; display: grid; place-items: center; background: conic-gradient(${scoreTone} ${data.score}%, #ded8cf 0); position: relative; }
  .score-ring:after { content: ""; position: absolute; inset: 7mm; border-radius: 50%; background: #f6f1e9; }
  .score-value { position: relative; z-index: 1; text-align: center; font: 700 27pt/1 Arial, sans-serif; }
  .score-value small { display: block; margin-top: 2mm; color: #77716b; font: 700 6pt "Courier New", monospace; letter-spacing: .18em; }
  .summary h3 { margin: 0 0 3mm; font: 600 17pt Georgia, serif; }
  .summary p { margin: 0; color: #67626a; font-size: 9pt; line-height: 1.6; overflow-wrap: anywhere; }
  .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4mm; margin-bottom: 7mm; }
  .metric { min-height: 23mm; padding: 4mm; background: #fffdfa; border: 1px solid #ded5c8; border-radius: 3mm; }
  .metric b { display: block; margin-bottom: 2mm; color: #c8141e; font-size: 20pt; }
  .metric span { color: #68626a; font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
  .section-title { display: flex; align-items: end; justify-content: space-between; margin: 0 0 4mm; }
  .section-title h3 { margin: 0; font: 600 14pt Georgia, serif; }
  .section-title span { color: #817c75; font-size: 7pt; }
  table { width: 100%; border-collapse: collapse; background: #fffdfa; border: 1px solid #ded5c8; }
  th { padding: 3.5mm; color: #716b65; background: #eee8df; font-size: 7pt; text-align: left; text-transform: uppercase; letter-spacing: .08em; }
  td { padding: 3mm 3.5mm; border-top: 1px solid #e5ddd2; font-size: 7.4pt; vertical-align: top; }
  td:first-child { width: 42%; font-weight: 700; overflow-wrap: anywhere; }
  td:last-child { color: #68626a; line-height: 1.45; }
  .badge { display: inline-block; padding: 1.2mm 2.4mm; border-radius: 99px; font-size: 6.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; white-space: nowrap; }
  .badge.success { color: #137a43; background: #dcfce7; }
  .badge.warning { color: #9a5a00; background: #fef3c7; }
  .badge.danger { color: #b4232c; background: #fee2e2; }
  .note { position: absolute; left: 16mm; right: 16mm; bottom: 18mm; padding: 3mm 5mm; color: #e7e2dc; background: #0a0a0a; border-left: 2mm solid #c8141e; font-size: 7pt; line-height: 1.35; }
  .footer { position: absolute; left: 16mm; right: 16mm; bottom: 9mm; padding-top: 3mm; border-top: 1px solid #ded5c8; color: #817c75; font: 600 6.5pt "Courier New", monospace; letter-spacing: .1em; }
  .github { display: inline-flex; align-items: center; gap: 2mm; color: inherit; }
</style>
</head>
<body>
<section class="page cover">
  <header class="topbar"><div class="brand">${markSvg()}<span class="brand-name">Zubair Hussain</span></div><span class="micro">Independent portfolio audit</span></header>
  <main class="hero"><div class="eyebrow">${escapeHtml(data.eyebrow)}</div><h1>${escapeHtml(data.title)}</h1><p>${escapeHtml(data.subtitle)}</p></main>
  <div class="cover-meta"><div><span class="micro">Audit target</span><b>${escapeHtml(data.target)}</b></div><div><span class="micro">Result</span><b>${escapeHtml(data.status)}</b></div><div><span class="micro">Generated</span><b>${escapeHtml(generatedDate)} UTC</b></div></div>
</section>
<section class="page">
  <header class="page-header"><div class="brand">${markSvg(30)}<span class="brand-name">Zubair Hussain</span></div><span class="section-kicker">AUDIT OVERVIEW</span></header>
  <h2>Signal, not noise.</h2><p class="lede">A concise view of the checks that matter, presented with the same visual discipline as the portfolio itself.</p>
  <div class="overview"><div class="score-ring"><div class="score-value">${data.score}%<small>OVERALL SCORE</small></div></div><div class="summary"><h3>${escapeHtml(data.status)}</h3><p>${escapeHtml(data.subtitle)}</p><p style="margin-top:3mm">${escapeHtml(data.target)}</p></div></div>
  <div class="metrics">${data.metrics.map((metric) => `<div class="metric"><b>${escapeHtml(metric.value)}</b><span>${escapeHtml(metric.label)}</span></div>`).join("")}</div>
  <div class="section-title"><h3>${data.rows.length ? "Priority findings" : "No priority findings"}</h3><span>${data.rows.length} item${data.rows.length === 1 ? "" : "s"}</span></div>
  ${data.rows.length ? `<table><thead><tr><th>Page / check</th><th>Status</th><th>Guidance</th></tr></thead><tbody>${data.rows.map((row) => `<tr><td>${escapeHtml(row.label)}</td><td>${badge(row.status, row.tone)}</td><td>${escapeHtml(row.detail)}</td></tr>`).join("")}</tbody></table>` : `<div class="metric"><b style="color:#22c55e">✓</b><span>All tracked checks completed without a priority finding.</span></div>`}
  <div class="note">${escapeHtml(data.note)}</div>
  <footer class="footer"><span>ZUBAIR HUSSAIN · PORTFOLIO QUALITY</span><span class="github">${githubSvg(13)} ${escapeHtml(repository)}</span></footer>
</section>
</body>
</html>`;

const emailMetrics = data.metrics
  .map(
    (metric) => `<td style="width:25%;padding:12px 6px;text-align:center;border:1px solid #302c2c;background:#111"><div style="font-size:24px;font-weight:800;color:#ef4444">${escapeHtml(metric.value)}</div><div style="margin-top:5px;font-size:10px;line-height:1.3;color:#aaa;text-transform:uppercase;letter-spacing:.08em">${escapeHtml(metric.label)}</div></td>`,
  )
  .join("");

const emailHtml = `<!doctype html><html><body style="margin:0;padding:0;background:#ece8e1;font-family:Arial,sans-serif;color:#202020"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ece8e1"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:100%;max-width:640px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 12px 35px rgba(0,0,0,.12)"><tr><td style="padding:28px 34px;background:#050505;color:#fff"><table role="presentation" width="100%"><tr><td><table role="presentation"><tr><td style="padding-right:12px"><div style="width:40px;height:40px;line-height:40px;text-align:center;border-radius:10px;background:#c8141e;color:#fff;font-size:22px;font-weight:800">Z</div></td><td style="font-size:12px;font-weight:700;letter-spacing:.22em;text-transform:uppercase">Zubair Hussain</td></tr></table></td><td align="right" style="font-size:11px;color:#777">PORTFOLIO AUDIT</td></tr></table><div style="margin-top:42px;color:#ef4444;font-size:10px;font-weight:700;letter-spacing:.25em">${escapeHtml(data.eyebrow)}</div><h1 style="margin:10px 0 10px;font-family:Georgia,serif;font-size:36px;line-height:1.08;font-style:italic">${escapeHtml(data.title)}</h1><p style="margin:0;color:#aaa;line-height:1.6">${escapeHtml(data.subtitle)}</p></td></tr><tr><td style="padding:28px 34px"><table role="presentation" width="100%"><tr><td><div style="font-size:12px;color:#777;text-transform:uppercase;letter-spacing:.12em">Overall score</div><div style="margin-top:4px;font-size:44px;font-weight:800;color:${scoreTone}">${data.score}%</div></td><td align="right">${emailBadge(data.status, data.statusTone)}</td></tr></table><table role="presentation" width="100%" cellspacing="7" cellpadding="0" style="margin:20px -7px 0;width:calc(100% + 14px)"><tr>${emailMetrics}</tr></table><div style="margin-top:22px;padding:16px 18px;background:#f5f0e8;border-left:4px solid #c8141e;border-radius:7px"><div style="font-weight:700">Audited target</div><div style="margin-top:5px;color:#666;overflow-wrap:anywhere">${escapeHtml(data.target)}</div></div><p style="margin:20px 0 0;color:#666;line-height:1.55">Your premium PDF overview is attached. The complete technical evidence remains available in the GitHub Actions artifact.</p><table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:22px"><tr><td style="border-radius:8px;background:#c8141e"><a href="${escapeHtml(runUrl)}" style="display:inline-block;padding:13px 18px;color:#fff;text-decoration:none;font-weight:700">View workflow run</a></td><td style="padding-left:12px"><a href="${escapeHtml(repositoryUrl)}" style="display:inline-block;padding:12px 0;color:#202020;text-decoration:none;font-weight:700">GitHub repository ↗</a></td></tr></table></td></tr><tr><td style="padding:18px 34px;background:#0a0a0a;color:#777;font-size:11px;line-height:1.5">${escapeHtml(data.note)}<br><br>Generated ${escapeHtml(generatedDate)} UTC · ${escapeHtml(repository)}</td></tr></table></td></tr></table></body></html>`;

const emailText = `${data.title}\n${"=".repeat(data.title.length)}\n\nResult: ${data.status}\nOverall score: ${data.score}%\nAudited target: ${data.target}\nGenerated: ${generatedDate} UTC\n\n${data.metrics.map((metric) => `${metric.label}: ${metric.value}`).join("\n")}\n\nYour premium PDF overview is attached. Complete technical evidence is available in the GitHub Actions artifact.\n\nWorkflow: ${runUrl}\nRepository: ${repositoryUrl}\n\n${data.note}\n`;

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(path.join(outputDirectory, "portfolio-audit-report.html"), reportHtml, "utf8"),
  writeFile(path.join(outputDirectory, "portfolio-audit-email.html"), emailHtml, "utf8"),
  writeFile(path.join(outputDirectory, "portfolio-audit-email.txt"), emailText, "utf8"),
  writeFile(
    path.join(outputDirectory, "portfolio-audit-summary.json"),
    `${JSON.stringify(data, null, 2)}\n`,
    "utf8",
  ),
]);

console.log(`Generated branded ${kind} audit package in ${outputDirectory}.`);
