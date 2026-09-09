import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from '../src/app/api/schedule/route';

describe('schedule route', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('redirects retired Calendly configuration to the current live event', async () => {
    vi.stubEnv('CALENDLY_SCHEDULE_URL', 'https://calendly.com/detroonshah/30min');

    const response = await GET();
    const location = new URL(response.headers.get('location')!);

    expect(response.status).toBe(302);
    expect(location.origin).toBe('https://calendly.com');
    expect(location.pathname).toBe('/zubai-hussain/30min');
    expect(location.searchParams.get('utm_source')).toBe('portfolio');
  });

  it('keeps a future configured Calendly override', async () => {
    vi.stubEnv('CALENDLY_SCHEDULE_URL', 'https://calendly.com/example/new-event');

    const response = await GET();
    const location = new URL(response.headers.get('location')!);

    expect(location.pathname).toBe('/example/new-event');
  });
});
