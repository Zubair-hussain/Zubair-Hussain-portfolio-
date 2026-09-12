import { spawn } from "node:child_process";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const root = process.cwd();
const records = path.join(root, "records");
const logsDirectory = path.join(records, "logs");
const coverageDirectory = path.join(records, "coverage");
const licensesDirectory = path.join(records, "licenses");
const memoryDirectory = path.join(records, "memory");
const evidenceDirectory = path.join(records, "evidence");
await Promise.all(
  [
    records,
    logsDirectory,
    coverageDirectory,
    licensesDirectory,
    memoryDirectory,
    evidenceDirectory,
  ].map((directory) => mkdir(directory, { recursive: true })),
);

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const checks = [
  { name: "lint", command: npm, args: ["run", "lint"] },
  { name: "type-check", command: npm, args: ["run", "type-check"] },
  {
    name: "unit-tests",
    command: npm,
    args: ["test", "--", "--reporter=verbose"],
  },
  {
    name: "full-source-coverage",
    command: npx,
    args: [
      "vitest",
      "run",
      "--coverage",
      "--coverage.include=src/**/*.{ts,tsx}",
      "--coverage.reporter=text",
      "--coverage.reporter=json-summary",
      "--coverage.reportsDirectory=coverage-full",
      "--maxWorkers=4",
    ],
    informational: true,
  },
  {
    name: "core-unit-coverage",
    command: npm,
    args: ["run", "test:coverage", "--", "--reporter=verbose"],
  },
  { name: "build", command: npm, args: ["run", "build"] },
  {
    name: "production-dependency-audit",
    command: npm,
    args: ["audit", "--omit=dev"],
    informational: true,
  },
];

const results = [];
for (const check of checks) {
  const result = await runCheck(check);
  results.push(result);
}

await copyCoverage("coverage", path.join(coverageDirectory, "core-unit"));
await copyCoverage(
  "coverage-full",
  path.join(coverageDirectory, "full-source"),
);

const coreSummary = await readJson(
  path.join(root, "coverage", "coverage-summary.json"),
);
const fullSummary = await readJson(
  path.join(root, "coverage-full", "coverage-summary.json"),
);
const coreTotals = coreSummary?.total;
const fullTotals = fullSummary?.total;

const licenseRows = await collectLicenses();
const flaggedLicenses = licenseRows.filter((row) => row.license !== "MIT");
await writeFile(
  path.join(licensesDirectory, "dependency-licenses.csv"),
  [
    "package,version,relationship,license,status",
    ...licenseRows.map((row) =>
      [
        row.name,
        row.version,
        row.relationship,
        row.license,
        row.license === "MIT" ? "MIT" : "FLAGGED",
      ]
        .map(csvCell)
        .join(","),
    ),
  ].join("\n") + "\n",
  "utf8",
);
await writeFile(
  path.join(licensesDirectory, "license-report.md"),
  renderLicenseReport(licenseRows, flaggedLicenses),
  "utf8",
);

const heapSamples = [];
for (const name of [
  "unit-tests",
  "core-unit-coverage",
  "full-source-coverage",
]) {
  const log = await readOptional(path.join(logsDirectory, `${name}.log`));
  for (const match of log.matchAll(/(\d+(?:\.\d+)?) MB heap used/g)) {
    heapSamples.push(Number(match[1]));
  }
}
const memoryReport = `# Memory report

Generated: ${new Date().toISOString()}

- Host: ${os.platform()} ${os.release()} (${os.arch()})
- Logical CPUs: ${os.cpus().length}
- Total system memory: ${formatBytes(os.totalmem())}
- Free system memory after collection: ${formatBytes(os.freemem())}
- Highest Vitest heap sample: ${heapSamples.length ? `${Math.max(...heapSamples)} MB` : "not reported"}
- Evidence generator RSS at report time: ${formatBytes(process.memoryUsage().rss)}
- Evidence generator heap used: ${formatBytes(process.memoryUsage().heapUsed)}

The Vitest value is the highest per-test heap sample printed by \`--logHeapUsage\`; it is not a whole-system or browser peak-memory measurement. Command durations are recorded in [the logs index](../logs/README.md).
`;
await writeFile(
  path.join(memoryDirectory, "memory-report.md"),
  memoryReport,
  "utf8",
);

await writeFile(
  path.join(logsDirectory, "README.md"),
  renderLogsReadme(results),
  "utf8",
);
await writeFile(
  path.join(coverageDirectory, "README.md"),
  renderCoverageReadme(coreTotals, fullTotals),
  "utf8",
);
await writeFile(
  path.join(evidenceDirectory, "coverage-summary.svg"),
  coverageSvg(coreTotals, fullTotals),
  "utf8",
);
await writeFile(
  path.join(evidenceDirectory, "verification-summary.svg"),
  verificationSvg(results, licenseRows.length, flaggedLicenses.length),
  "utf8",
);
try {
  const { default: sharp } = await import("sharp");
  for (const name of ["coverage-summary", "verification-summary"]) {
    const svg = await readFile(path.join(evidenceDirectory, `${name}.svg`));
    await sharp(svg)
      .png()
      .toFile(path.join(evidenceDirectory, `${name}.png`));
  }
} catch (error) {
  console.warn(`PNG evidence rendering skipped: ${error.message}`);
}
await writeFile(
  path.join(evidenceDirectory, "README.md"),
  "# Evidence images\n\n- `coverage-summary.svg` visualizes the measured core-unit and full-source coverage totals.\n- `verification-summary.svg` visualizes command outcomes and the dependency-license inventory.\n\nBoth images are generated from the machine-readable reports in this records package; they are evidence summaries, not screenshots.\n",
  "utf8",
);
await writeFile(
  path.join(records, "README.md"),
  renderRootReadme(
    results,
    coreTotals,
    fullTotals,
    licenseRows.length,
    flaggedLicenses.length,
  ),
  "utf8",
);

const requiredFailures = results.filter(
  (result) => !result.informational && result.exitCode !== 0,
);
console.log(`Records generated at ${records}`);
if (requiredFailures.length) {
  console.error(
    `Required checks failed: ${requiredFailures.map((result) => result.name).join(", ")}`,
  );
  process.exitCode = 1;
}

async function runCheck(check) {
  const commandLine = [check.command, ...check.args].join(" ");
  console.log(`\n>>> ${check.name}: ${commandLine}`);
  const start = Date.now();
  let stdout = "";
  let stderr = "";
  const exitCode = await new Promise((resolve) => {
    const child = spawn(check.command, check.args, {
      cwd: root,
      env: { ...process.env, CI: "1", FORCE_COLOR: "0" },
      shell: process.platform === "win32",
      windowsHide: true,
    });
    child.stdout.on("data", (chunk) => {
      const value = chunk.toString();
      stdout += value;
      process.stdout.write(value);
    });
    child.stderr.on("data", (chunk) => {
      const value = chunk.toString();
      stderr += value;
      process.stderr.write(value);
    });
    child.on("error", (error) => {
      stderr += `${error.stack || error.message}\n`;
      resolve(1);
    });
    child.on("close", (code) => resolve(code ?? 1));
  });
  const durationMs = Date.now() - start;
  const header = [
    `check: ${check.name}`,
    `started: ${new Date(start).toISOString()}`,
    `command: ${commandLine}`,
    `exit_code: ${exitCode}`,
    `duration_ms: ${durationMs}`,
    "",
  ].join("\n");
  await writeFile(
    path.join(logsDirectory, `${check.name}.log`),
    header + stdout + stderr,
    "utf8",
  );
  return { ...check, commandLine, exitCode, durationMs };
}

async function copyCoverage(sourceName, destination) {
  try {
    await cp(path.join(root, sourceName), destination, {
      recursive: true,
      force: true,
    });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

async function collectLicenses() {
  const manifest = JSON.parse(
    await readFile(path.join(root, "package.json"), "utf8"),
  );
  const lock = JSON.parse(
    await readFile(path.join(root, "package-lock.json"), "utf8"),
  );
  const directProduction = new Set(Object.keys(manifest.dependencies ?? {}));
  const directDevelopment = new Set(
    Object.keys(manifest.devDependencies ?? {}),
  );
  const rows = [];
  for (const [location, metadata] of Object.entries(lock.packages ?? {})) {
    if (!location.startsWith("node_modules/")) continue;
    const fallbackName = location.slice(
      location.lastIndexOf("node_modules/") + "node_modules/".length,
    );
    const name = metadata.name || fallbackName;
    let license = normalizeLicense(metadata.license);
    if (license === "UNKNOWN") {
      try {
        const installed = JSON.parse(
          await readFile(path.join(root, location, "package.json"), "utf8"),
        );
        license = normalizeLicense(installed.license ?? installed.licenses);
      } catch {
        // Keep UNKNOWN and flag it for manual review.
      }
    }
    const relationship = directProduction.has(name)
      ? "direct-production"
      : directDevelopment.has(name)
        ? "direct-development"
        : "transitive";
    rows.push({
      name,
      version: metadata.version || "UNKNOWN",
      relationship,
      license,
    });
  }
  return rows.sort(
    (a, b) =>
      a.name.localeCompare(b.name) || a.version.localeCompare(b.version),
  );
}

function normalizeLicense(value) {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    const values = value
      .map((entry) => normalizeLicense(entry?.type ?? entry))
      .filter(Boolean);
    return values.length ? values.join(" OR ") : "UNKNOWN";
  }
  if (value && typeof value === "object") return normalizeLicense(value.type);
  return "UNKNOWN";
}

function renderLicenseReport(rows, flagged) {
  const counts = new Map();
  for (const row of rows)
    counts.set(row.license, (counts.get(row.license) ?? 0) + 1);
  const directFlagged = flagged.filter(
    (row) => row.relationship !== "transitive",
  );
  return `# Dependency license report

Generated: ${new Date().toISOString()}

The portfolio source is MIT licensed. Third-party packages retain their own licenses; they do not become MIT merely because this repository is MIT. This inventory flags every installed package whose declared license is not exactly \`MIT\`, including dual-license expressions and unknown declarations. A flag is a review item, not a claim of incompatibility or legal advice.

- Installed package records: ${rows.length}
- Exactly MIT: ${rows.length - flagged.length}
- Non-MIT, mixed, or unknown: ${flagged.length}
- Flagged direct dependencies: ${directFlagged.length}

## License counts

| Declared license | Packages |
| --- | ---: |
${[...counts.entries()]
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .map(([license, count]) => `| ${escapeMarkdown(license)} | ${count} |`)
  .join("\n")}

## Flagged direct dependencies

${directFlagged.length ? "| Package | Version | Relationship | License |\n| --- | --- | --- | --- |\n" + directFlagged.map((row) => `| ${escapeMarkdown(row.name)} | ${row.version} | ${row.relationship} | ${escapeMarkdown(row.license)} |`).join("\n") : "None."}

See \`dependency-licenses.csv\` for the complete package-by-package evidence, including every transitive flag.
`;
}

function renderLogsReadme(results) {
  return `# Verification logs

Generated: ${new Date().toISOString()}

| Check | Exit | Duration | Required |
| --- | ---: | ---: | --- |
${results.map((result) => `| ${result.name} | ${result.exitCode} | ${(result.durationMs / 1000).toFixed(2)}s | ${result.informational ? "no" : "yes"} |`).join("\n")}

Each adjacent \`.log\` file contains the command, timestamps, exit code, duration, stdout, and stderr. The full-source coverage and npm audit are informational: their findings remain visible without hiding the pass/fail state of the enforced checks.
`;
}

function renderCoverageReadme(core, full) {
  return `# Coverage evidence

Generated: ${new Date().toISOString()}

| Scope | Statements | Branches | Functions | Lines |
| --- | ---: | ---: | ---: | ---: |
| Core unit gate | ${pct(core, "statements")} | ${pct(core, "branches")} | ${pct(core, "functions")} | ${pct(core, "lines")} |
| Full source | ${pct(full, "statements")} | ${pct(full, "branches")} | ${pct(full, "functions")} | ${pct(full, "lines")} |

The enforced core scope is explicitly listed in \`vitest.config.mts\` and covers deterministic business logic and API adapters. Thresholds are 80% statements, 80% functions, 80% lines, and 60% branches. Full-source coverage includes UI, 3D, browser integration, and untested API modules and is reported separately to prevent the focused gate from being mistaken for whole-application coverage.

- \`core-unit/\`: machine-readable summary plus browsable HTML report.
- \`full-source/\`: informational whole-source summary generated by the records command.
`;
}

function renderRootReadme(results, core, full, licenseCount, flaggedCount) {
  const requiredPassed = results
    .filter((result) => !result.informational)
    .every((result) => result.exitCode === 0);
  return `# Engineering evidence record

Generated: ${new Date().toISOString()}

This directory is a reproducible evidence package created by \`npm run records:generate\`. It records the state of the working tree at execution time; it is not a cryptographic attestation.

## Snapshot

- Required checks: ${requiredPassed ? "PASS" : "FAIL"}
- Tests: ${resultStatus(results, "unit-tests")}
- Core coverage: ${pct(core, "statements")} statements, ${pct(core, "functions")} functions, ${pct(core, "lines")} lines, ${pct(core, "branches")} branches
- Full-source coverage: ${pct(full, "statements")} statements and ${pct(full, "lines")} lines
- Dependency license records: ${licenseCount}; non-MIT/mixed/unknown flags: ${flaggedCount}

## Folders

- [logs](logs/README.md): raw lint, type-check, test, coverage, build, and npm-audit output.
- [coverage](coverage/README.md): core gate and full-source coverage evidence.
- [licenses](licenses/license-report.md): complete dependency-license inventory and review flags.
- [memory](memory/memory-report.md): environment and Vitest heap-use evidence.
- [evidence](evidence/README.md): generated SVG summaries suitable for review in GitHub.

## Reproduce

Use the Node version supported by the dependency tree, install with \`npm ci\`, then run:

\`\`\`bash
npm run records:generate
\`\`\`

Do not place environment files, credentials, or application secrets in this folder.
`;
}

function coverageSvg(core, full) {
  const coreStatements = numberPct(core, "statements");
  const fullStatements = numberPct(full, "statements");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="360" viewBox="0 0 900 360" role="img" aria-labelledby="title desc">
  <title id="title">Test coverage evidence</title><desc id="desc">Core unit and full source coverage percentages.</desc>
  <rect width="900" height="360" rx="24" fill="#0f172a"/><text x="48" y="62" fill="#f8fafc" font-family="Arial,sans-serif" font-size="30" font-weight="700">Coverage evidence</text>
  ${barSvg(48, 110, "Core statements", coreStatements, "#22c55e")}
  ${barSvg(48, 205, "Full-source statements", fullStatements, "#38bdf8")}
  <text x="48" y="325" fill="#94a3b8" font-family="Arial,sans-serif" font-size="16">Generated from Vitest V8 coverage-summary.json</text>
</svg>\n`;
}

function barSvg(x, y, label, value, color) {
  const width = 760;
  const filled = Math.max(0, Math.min(width, (width * value) / 100));
  return `<text x="${x}" y="${y}" fill="#e2e8f0" font-family="Arial,sans-serif" font-size="19">${label}: ${value.toFixed(2)}%</text><rect x="${x}" y="${y + 18}" width="${width}" height="28" rx="14" fill="#334155"/><rect x="${x}" y="${y + 18}" width="${filled.toFixed(1)}" height="28" rx="14" fill="${color}"/>`;
}

function verificationSvg(results, licenseCount, flaggedCount) {
  const required = results.filter((result) => !result.informational);
  const passed = required.filter((result) => result.exitCode === 0).length;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="360" viewBox="0 0 900 360" role="img" aria-labelledby="title desc">
  <title id="title">Verification evidence summary</title><desc id="desc">Required checks and dependency license inventory.</desc>
  <rect width="900" height="360" rx="24" fill="#111827"/><text x="48" y="62" fill="#f9fafb" font-family="Arial,sans-serif" font-size="30" font-weight="700">Verification snapshot</text>
  <rect x="48" y="100" width="380" height="180" rx="18" fill="#1f2937"/><text x="76" y="146" fill="#9ca3af" font-family="Arial,sans-serif" font-size="18">Required checks passed</text><text x="76" y="225" fill="#22c55e" font-family="Arial,sans-serif" font-size="64" font-weight="700">${passed}/${required.length}</text>
  <rect x="472" y="100" width="380" height="180" rx="18" fill="#1f2937"/><text x="500" y="146" fill="#9ca3af" font-family="Arial,sans-serif" font-size="18">Dependency license flags</text><text x="500" y="225" fill="#f59e0b" font-family="Arial,sans-serif" font-size="64" font-weight="700">${flaggedCount}</text><text x="500" y="255" fill="#9ca3af" font-family="Arial,sans-serif" font-size="16">of ${licenseCount} installed records</text>
  <text x="48" y="325" fill="#9ca3af" font-family="Arial,sans-serif" font-size="16">Non-MIT, mixed, and unknown declarations are flagged for review.</text>
</svg>\n`;
}

function pct(total, metric) {
  const value = total?.[metric]?.pct;
  return Number.isFinite(value) ? `${value.toFixed(2)}%` : "not produced";
}

function numberPct(total, metric) {
  const value = total?.[metric]?.pct;
  return Number.isFinite(value) ? value : 0;
}

function resultStatus(results, name) {
  const result = results.find((entry) => entry.name === name);
  return result
    ? result.exitCode === 0
      ? "PASS"
      : `FAIL (${result.exitCode})`
    : "not run";
}

function escapeMarkdown(value) {
  return String(value).replaceAll("|", "\\|");
}

function csvCell(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function formatBytes(value) {
  return `${(value / 1024 / 1024).toFixed(1)} MiB`;
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return null;
  }
}

async function readOptional(file) {
  try {
    return await readFile(file, "utf8");
  } catch {
    return "";
  }
}
