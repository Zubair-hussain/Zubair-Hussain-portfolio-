import { NextResponse } from 'next/server';
import {
  FIREBASE_PUBLIC_ENV_KEYS,
  getFirebasePublicConfig,
} from '@/lib/firebase-config';

export const dynamic = 'force-dynamic';

type RuntimeEnv = Partial<Record<(typeof FIREBASE_PUBLIC_ENV_KEYS)[number], string>>;

// Hardcoded fallbacks — these are public-safe identifiers (protected by Firestore rules)
const FIREBASE_FALLBACK: RuntimeEnv = {
  NEXT_PUBLIC_FIREBASE_API_KEY: 'AIzaSyAIhcsHwSPT3ph_Sk9WaruNfOEsli2Wu9Q',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'zubair-portfolio-7f787.firebaseapp.com',
  NEXT_PUBLIC_FIREBASE_DATABASE_URL: 'https://zubair-portfolio-7f787-default-rtdb.firebaseio.com',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'zubair-portfolio-7f787',
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'zubair-portfolio-7f787.firebasestorage.app',
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '534839579365',
  NEXT_PUBLIC_FIREBASE_APP_ID: '1:534839579365:web:832a7aca12f778d66f7a0c',
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: 'G-7N4GT0P3VH',
};

async function getRuntimeEnv(): Promise<RuntimeEnv> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const context = await getCloudflareContext({ async: true });
    const cfEnv = context.env as RuntimeEnv;
    // Merge: Cloudflare env takes priority, fallback fills any missing keys
    return { ...FIREBASE_FALLBACK, ...cfEnv };
  } catch {
    // Supports next dev/test and non-Cloudflare deployments.
    return { ...FIREBASE_FALLBACK, ...(process.env as RuntimeEnv) };
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
