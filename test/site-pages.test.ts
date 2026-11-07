import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SITE_PAGES, UNLISTED_PATHS } from '../src/lib/site-pages';

const APP = join(__dirname, '..', 'src', 'app');
const PUBLIC = join(__dirname, '..', 'public');

/** Static page routes under src/app, ignoring dynamic segments and route groups. */
function appPages(dir = APP): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name.startsWith('[') || name.startsWith('_') || name === 'api') return [];
      return appPages(full);
    }
    if (name !== 'page.tsx') return [];
    const route = relative(APP, dir).split(sep).filter((s) => !s.startsWith('(')).join('/');
    return [`/${route}`];
  });
}

describe('site page registry', () => {
  const listed = new Set(SITE_PAGES.map((p) => p.path));
  const allowed = new Set([...listed, ...UNLISTED_PATHS]);

  it('lists every app page so search engines and AI agents can find it', () => {
    const missing = appPages().filter((p) => !allowed.has(p));
    expect(missing, 'Add these to src/lib/site-pages.ts').toEqual([]);
  });

  it('lists every public HTML page, served without .html when rewritten', () => {
    const html = readdirSync(PUBLIC).filter((f) => f.endsWith('.html'));
    const missing = html.filter((f) => {
      const path = `/${f}`;
      return !allowed.has(path) && !allowed.has(path.replace(/\.html$/, ''));
    });
    expect(missing, 'Add these to src/lib/site-pages.ts').toEqual([]);
  });

  it('has no duplicate paths and only real dates', () => {
    expect(listed.size).toBe(SITE_PAGES.length);
    for (const page of SITE_PAGES) {
      expect(page.path.startsWith('/')).toBe(true);
      expect(Number.isNaN(Date.parse(page.updated))).toBe(false);
      expect(page.description.length).toBeGreaterThan(20);
    }
  });
});

describe('page titles', () => {
  it('gives every page its own title instead of the layout fallback', () => {
    const files = [
      ...appPages().map((p) => join(APP, ...p.split('/').filter(Boolean), 'page.tsx')),
      join(APP, 'not-found.tsx'),
    ];
    const untitled = files.filter((file) => {
      const source = readFileSync(file, 'utf8');
      return !/export (async )?function generateMetadata|export const metadata|<title>|creativeServiceMetadata/.test(source);
    });
    // The home page uses the layout's default title on purpose.
    expect(untitled.map((f) => relative(APP, f))).toEqual(['page.tsx']);
  });
});
