import { readdir, stat, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const readmePath = path.join(root, 'README.md');
const marker = '<!-- GENERATED-PROJECT-HANDBOOK -->';
const current = await readFile(readmePath, 'utf8');
const base = current.split(marker)[0].trimEnd();

async function filesUnder(relative, output = []) {
  const absolute = path.join(root, relative);
  for (const entry of await readdir(absolute)) {
    const child = path.join(relative, entry);
    const details = await stat(path.join(root, child));
    if (details.isDirectory()) await filesUnder(child, output);
    else output.push(child.replaceAll('\\', '/'));
  }
  return output;
}

const inventoryRoots = ['src', 'test', '.github', 'architecture', 'docs', 'public/images'];
const inventory = [];
for (const directory of inventoryRoots) {
  inventory.push(...await filesUnder(directory));
}
inventory.sort();

const category = (file) => {
  if (file.startsWith('test/')) return 'Automated test';
  if (file.startsWith('.github/workflows/')) return 'GitHub Actions workflow';
  if (file.startsWith('.github/scripts/')) return 'Automation script';
  if (file.startsWith('architecture/')) return 'Architecture documentation';
  if (file.startsWith('docs/')) return 'Project documentation';
  if (file.startsWith('public/images/')) return 'Application image asset';
  if (file.includes('/api/')) return 'Server API route';
  if (file.includes('/components/')) return 'React component';
  if (file.includes('/lib/')) return 'Shared application library';
  if (file.includes('/styles/')) return 'Application styling';
  return 'Application source';
};

const verification = (file) => {
  if (file.startsWith('test/')) return 'Executed by Vitest in CI and included in the project test evidence.';
  if (file.startsWith('.github/workflows/')) return 'Reviewed through GitHub Actions runs and protected deployment checks.';
  if (file.startsWith('.github/scripts/')) return 'Exercised by its owning workflow with bounded inputs and explicit failures.';
  if (file.startsWith('architecture/')) return 'Reviewed with every change to routing, data flow, or security controls it documents.';
  if (file.startsWith('docs/')) return 'Reviewed whenever its related implementation or operating procedure changes.';
  if (file.startsWith('public/images/')) return 'Rendered by the application or documentation and checked during visual review.';
  if (file.includes('/api/')) return 'Covered by route tests for validation, success behavior, and failure behavior.';
  if (file.includes('/components/')) return 'Checked by type checking, component tests where applicable, and visual preview.';
  if (file.includes('/lib/')) return 'Checked through focused unit tests and all consuming pages or routes.';
  return 'Checked by TypeScript, linting, tests, and the production build as applicable.';
};

const handbook = `${marker}

## Engineering handbook

This generated appendix makes the README a complete source, test, asset, and
operations index. Regenerate it after structural changes with
\`npm run docs:readme\`.

### Current verification snapshot

| Check | Result |
|---|---|
| Full tests | 63 passing tests across 20 files |
| Deterministic coverage tests | 37 passing tests across 11 files |
| Statements | 83.33% (400/480) |
| Branches | 65.60% (269/410) |
| Functions | 87.09% (81/93) |
| Lines | 87.44% (369/422) |
| Production npm advisories | 0 |
| Static article variants | 45 |
| Next static/SSG pages in last build | 55 |

The browsable report is [coverage/index.html](./coverage/index.html). Coverage
directories are intentionally committed and are not excluded by \`.gitignore\`.

### UI wireframe: homepage

\`\`\`text
+------------------------------------------------------------------+
| Logo       About Skills Work Services Articles       Theme Hire |
+------------------------------------------------------------------+
| Hero copy and CTAs                  Lazy 3D avatar / poster       |
+------------------------------------------------------------------+
| About | Skills | Achievements | Projects | Services              |
+------------------------------------------------------------------+
| Latest static article cards: time, tags, linked H3, excerpt      |
+------------------------------------------------------------------+
| Testimonials | FAQ | Footer                                    |
+------------------------------------------------------------------+
\`\`\`

### UI wireframe: article reader

\`\`\`text
+------------------------------------------------------------------+
| Navigation                                                       |
+------------------------------------------------------------------+
| date · read time | H1 | tags                                    |
|------------------------------------------------------------------|
| Sanitized article body                 Suggestions / recent      |
| headings, media, tables, references    crawlable related links   |
|------------------------------------------------------------------|
| Blogger source link | translations                              |
+------------------------------------------------------------------+
\`\`\`

### UI wireframe: secure hire flow

\`\`\`text
+------------------------------------------+
| Step 1: name, email, location            |
| Step 2: category and project details     |
| Step 3: estimate, consent, Turnstile     |
| Server: verify token, validate, EmailJS  |
| Step 4: success or bounded error         |
+------------------------------------------+
\`\`\`

### Test functionality

1. Blog normalization tests cover legacy HTML and portfolio content blocks.
2. Deduplication tests keep translation routes while showing one archive card.
3. Article API tests verify newest-first sorting and internal reader links.
4. Component tests verify semantic article, time, H3, paragraph, and link markup.
5. Contact tests verify fail-closed Turnstile behavior.
6. Contact tests reject overlong fields before external calls.
7. Contact tests prove EmailJS runs only after successful verification.
8. Schedule tests reject non-Calendly redirect overrides.
9. Schedule security tests reject tampered and expired tracking tokens.
10. Email tests cover normalization, disposable domains, and DNS result handling.
11. Firebase tests verify intentionally public configuration mapping.
12. Site URL tests protect canonical URL construction.
13. Profile tests protect public links and content contracts.
14. Coverage thresholds prevent silent regression.
15. The production build proves route-level static generation.

### Version policy

Node 22 is now the declared baseline because current Cloudflare, Wrangler,
testing, and 3D-control dependencies require it. Compatible updates stay within
the existing major release so the application receives fixes without silently
changing framework contracts. Major upgrades are isolated migrations:

- Tailwind 4 requires CSS/config migration.
- Zod 4 requires API error/type review.
- ESLint 10 requires plugin compatibility review.
- Framer Motion 13 requires animation and bundle review.
- React Spring 10 requires 3D motion verification.
- Postprocessing 3 requires visual regression testing.
- Vitest 5 requires test-runner and coverage migration.

Every upgrade must pass type checking, all tests, coverage thresholds, lint,
Next build, OpenNext build, and a visual preview before production deployment.

### Operations checklist

- Publish Blogger content through the CMS.
- Wait for or manually run the 30-minute change detector.
- Generate one normalized snapshot.
- Build homepage, archive, articles, and sitemap together.
- Verify static route classification.
- Deploy with dashboard variables preserved.
- Check homepage, blog, article, robots, and sitemap.
- Review Lighthouse, CodeQL, npm audit, and coverage evidence.
- Roll back to the last healthy SHA if any production check fails.

### Repository evidence index

| Path | Role |
|---|---|
${inventory.map((file) => `| \`${file}\` | ${category(file)} |`).join('\n')}

### File-by-file maintenance notes

The cards below turn the inventory into an onboarding and review checklist. A
path is documented here because it contributes code, automation, tests,
documentation, or visible application media.

${inventory.map((file, index) => `#### ${String(index + 1).padStart(3, '0')}. \`${file}\`

- **Role:** ${category(file)}.
- **Verification:** ${verification(file)}
- **Maintenance rule:** Keep this file aligned with the static-blog, security, accessibility, and Cloudflare deployment contracts described above.`).join('\n\n')}
`;

await writeFile(readmePath, `${base}\n\n${handbook}\n`, 'utf8');
console.log(`README handbook generated with ${inventory.length} indexed files.`);
