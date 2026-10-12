import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../src/app/api/contact/route';

const validBody = {
  name: 'Example Client',
  email: 'client@example.com',
  location: 'London',
  category: 'web',
  details: 'A sufficiently detailed project request.',
  suggestedTimeline: '2-4 weeks',
  selectedService: 'Web application',
  selectedPrice: '$1,000',
  turnstileToken: 'verified-token',
};

function request(body: unknown) {
  return new Request('https://portfolio.example/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '192.0.2.1' },
    body: JSON.stringify(body),
  });
}

describe('contact route', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('fails closed when Turnstile is not configured', async () => {
    const response = await POST(request(validBody));
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Human verification failed.' });
  });

  it('rejects overlong form fields before external calls', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'test-secret');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const response = await POST(request({ ...validBody, name: 'x'.repeat(81) }));
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('verifies Turnstile before sending a bounded EmailJS request', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'test-secret');
    vi.stubEnv('EMAILJS_SERVICE_ID', 'service-id');
    vi.stubEnv('EMAILJS_TEMPLATE_ID', 'template-id');
    vi.stubEnv('EMAILJS_PUBLIC_KEY', 'public-key');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response('OK', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const response = await POST(request(validBody));

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[0][0])).toContain('siteverify');
    expect(String(fetchMock.mock.calls[1][0])).toBe('https://api.emailjs.com/api/v1.0/email/send');
  });
});
