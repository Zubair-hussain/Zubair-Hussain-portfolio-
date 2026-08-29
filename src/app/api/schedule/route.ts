import { NextResponse } from 'next/server';
import { buildScheduleRedirectUrl, createScheduleJwt } from '@/lib/schedule-security';
import { PROFILE } from '@/lib/zubair-profile';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

function getRequiredSecret() {
  const secret = process.env.SCHEDULE_JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV !== 'production') return 'dev-only-schedule-jwt-secret-change-me';
  throw new Error('Missing SCHEDULE_JWT_SECRET');
}

export async function GET() {
  const calendlyUrl = process.env.CALENDLY_SCHEDULE_URL || PROFILE.actions.schedule.privateUrl;
  const jwt = await createScheduleJwt(getRequiredSecret());
  const redirectUrl = buildScheduleRedirectUrl(calendlyUrl, jwt);

  const response = NextResponse.redirect(redirectUrl, 302);
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}
