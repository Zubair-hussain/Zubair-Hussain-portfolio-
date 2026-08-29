import { describe, expect, it, vi } from 'vitest';
import {
  buildScheduleRedirectUrl,
  createScheduleJwt,
  verifyScheduleJwt,
} from '../src/lib/schedule-security';

const secret = 'test-schedule-secret-at-least-32-chars';
const now = Date.UTC(2026, 2, 16, 15, 56, 28);

describe('schedule security', () => {
  it('creates a short-lived JWT that verifies with the expected schedule claims', async () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('schedule-token-id');

    const token = await createScheduleJwt(secret, now, 300);

    await expect(verifyScheduleJwt(token, secret, now)).resolves.toBe(true);
    await expect(verifyScheduleJwt(token, secret, now + 301_000)).resolves.toBe(false);
  });

  it('rejects tampered schedule JWTs', async () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('schedule-token-id');

    const token = await createScheduleJwt(secret, now, 300);
    const tampered = token.replace(/.$/, token.endsWith('a') ? 'b' : 'a');

    await expect(verifyScheduleJwt(tampered, secret, now)).resolves.toBe(false);
  });

  it('builds a Calendly redirect without caching the private URL in client code', () => {
    const redirect = buildScheduleRedirectUrl('https://calendly.com/detroonshah/30min', 'jwt-value');

    expect(redirect.origin).toBe('https://calendly.com');
    expect(redirect.pathname).toBe('/detroonshah/30min');
    expect(redirect.searchParams.get('utm_source')).toBe('portfolio');
    expect(redirect.searchParams.get('utm_medium')).toBe('secure_redirect');
    expect(redirect.searchParams.get('utm_content')).toBe('jwt-value');
  });
});
