import { afterEach, describe, expect, it, vi } from 'vitest';
import { getSiteUrl } from '../src/lib/site-url';

describe('public site URL', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('never emits localhost when a production build variable is missing', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    vi.stubEnv('SITE_URL', '');
    vi.stubEnv('CF_PAGES_URL', '');

    expect(getSiteUrl()).toBe('https://zubair-hussain-portfolio.detroonshah.workers.dev');
  });

  it('keeps localhost as the development-only fallback', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    vi.stubEnv('SITE_URL', '');
    vi.stubEnv('CF_PAGES_URL', '');

    expect(getSiteUrl()).toBe('http://localhost:3000');
  });
});
