import { describe, expect, it } from 'vitest';
import { contentSecurityPolicy, securityHeaders } from '../next.config.mjs';

describe('Next security headers', () => {
  const headers = Object.fromEntries(securityHeaders.map(({ key, value }) => [key, value]));

  it('ships browser hardening headers for every route', () => {
    expect(headers['Content-Security-Policy']).toBe(contentSecurityPolicy);
    expect(headers['Strict-Transport-Security']).toContain('max-age=31536000');
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['Permissions-Policy']).toContain('camera=()');
  });

  it('keeps the CSP restrictive while allowing required integrations', () => {
    expect(contentSecurityPolicy).toContain("default-src 'self'");
    expect(contentSecurityPolicy).toContain("object-src 'none'");
    expect(contentSecurityPolicy).toContain("frame-ancestors 'none'");
    expect(contentSecurityPolicy).toContain('upgrade-insecure-requests');
    expect(contentSecurityPolicy).toContain('https://challenges.cloudflare.com');
    expect(contentSecurityPolicy).toContain('https://api.github.com');
    expect(contentSecurityPolicy).toContain('https://calendly.com');
    expect(contentSecurityPolicy).toContain('https://api.emailjs.com');
    expect(contentSecurityPolicy).toContain('https://www.googletagmanager.com');
    expect(contentSecurityPolicy).toContain('https://www.google-analytics.com');
    expect(contentSecurityPolicy).toContain('https://analytics.google.com');
    expect(contentSecurityPolicy).toContain('https://stats.g.doubleclick.net');
  });
});
