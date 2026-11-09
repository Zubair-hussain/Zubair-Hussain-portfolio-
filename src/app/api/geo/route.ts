import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const dynamic = 'force-dynamic';

/** Visitor location from Cloudflare's edge data. Empty outside Cloudflare. */
export async function GET() {
  let cf: { timezone?: unknown; city?: unknown; country?: unknown } | undefined;
  try {
    cf = (await getCloudflareContext({ async: true })).cf;
  } catch {
    cf = undefined;
  }
  return NextResponse.json(
    {
      timezone: typeof cf?.timezone === 'string' ? cf.timezone : '',
      city: typeof cf?.city === 'string' ? cf.city : '',
      country: typeof cf?.country === 'string' ? cf.country : '',
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
