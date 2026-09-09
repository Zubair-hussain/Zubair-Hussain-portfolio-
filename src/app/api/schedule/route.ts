import { NextResponse } from 'next/server';
import { buildScheduleRedirectUrl, createScheduleJwt } from '@/lib/schedule-security';
import { PROFILE } from '@/lib/zubair-profile';

export const dynamic = 'force-dynamic';

/**
 * Derives a deterministic 32+ char signing key from public profile metadata.
 * Used ONLY as a fallback when SCHEDULE_JWT_SECRET is not set in Cloudflare.
 * Acceptable because it signs a redirect to a public Calendly URL — not a
 * sensitive resource. Set SCHEDULE_JWT_SECRET in Cloudflare for a true secret.
 */
function getFallbackSigningKey(): string {
  // Stable public fields — combined result is always ≥ 32 chars.
  const base = [
    PROFILE.sources.githubUsername,                              // 'Zubair-Hussain'
    PROFILE.email,                                               // 'thezubairh@gmail.com'
    PROFILE.actions.schedule.privateUrl.split('/').pop() ?? '30min',
  ].join('-');
  return base; // 'Zubair-Hussain-thezubairh@gmail.com-30min' → 43 chars ✓
}

function getSigningKey(): string {
  const envKey = process.env.SCHEDULE_JWT_SECRET;
  if (envKey) return envKey;
  if (process.env.NODE_ENV !== 'production') return 'dev-only-schedule-jwt-secret-change-me';
  return getFallbackSigningKey();
}

export async function GET() {
  const configuredUrl = process.env.CALENDLY_SCHEDULE_URL?.trim();
  // The previous Calendly account/event was retired and now returns 404. An
  // old Cloudflare variable must not override the current working profile URL.
  const calendlyUrl = configuredUrl?.replace(/\/+$/, '') === 'https://calendly.com/detroonshah/30min'
    ? PROFILE.actions.schedule.privateUrl
    : configuredUrl || PROFILE.actions.schedule.privateUrl;
  const jwt = await createScheduleJwt(getSigningKey());
  const redirectUrl = buildScheduleRedirectUrl(calendlyUrl, jwt);

  const response = NextResponse.redirect(redirectUrl, 302);
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}
