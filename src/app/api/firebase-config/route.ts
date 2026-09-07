import { NextResponse } from 'next/server';
import {
  FIREBASE_PUBLIC_ENV_KEYS,
  getFirebasePublicConfig,
} from '@/lib/firebase-config';

export const dynamic = 'force-dynamic';

type RuntimeEnv = Partial<Record<(typeof FIREBASE_PUBLIC_ENV_KEYS)[number], string>>;

async function getRuntimeEnv(): Promise<RuntimeEnv> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const context = await getCloudflareContext({ async: true });
    return context.env as RuntimeEnv;
  } catch {
    // Supports next dev/test and non-Cloudflare deployments.
    return process.env as RuntimeEnv;
  }
}

export async function GET() {
  const config = getFirebasePublicConfig(await getRuntimeEnv());

  if (!config) {
    return NextResponse.json(
      { configured: false },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  return NextResponse.json(
    { configured: true, config },
    { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600' } }
  );
}
