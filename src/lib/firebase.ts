import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirebasePublicConfig, type FirebasePublicConfig } from '@/lib/firebase-config';

// Next.js embeds these values when they are available during a conventional
// build. Cloudflare dashboard runtime variables are loaded through the API
// fallback below because Workers Builds uses a separate build environment.
// Hardcoded fallbacks ensure keys work even when Cloudflare drops env vars.
const buildTimeConfig = getFirebasePublicConfig({
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAIhcsHwSPT3ph_Sk9WaruNfOEsli2Wu9Q',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'zubair-portfolio-7f787.firebaseapp.com',
  NEXT_PUBLIC_FIREBASE_DATABASE_URL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://zubair-portfolio-7f787-default-rtdb.firebaseio.com',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'zubair-portfolio-7f787',
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'zubair-portfolio-7f787.firebasestorage.app',
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '534839579365',
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:534839579365:web:832a7aca12f778d66f7a0c',
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-7N4GT0P3VH',
});

export interface FirebaseServices {
  app: FirebaseApp | null;
  db: Firestore | null;
  auth: Auth | null;
  googleProvider: GoogleAuthProvider | null;
}

let servicesPromise: Promise<FirebaseServices> | null = null;

async function getRuntimeConfig(): Promise<FirebasePublicConfig | null> {
  if (buildTimeConfig) return buildTimeConfig;

  try {
    const response = await fetch('/api/firebase-config', { cache: 'no-store' });
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      configured?: boolean;
      config?: FirebasePublicConfig;
    };
    return payload.configured && payload.config ? payload.config : null;
  } catch {
    return null;
  }
}

export function initializeFirebase(): Promise<FirebaseServices> {
  if (!servicesPromise) {
    servicesPromise = getRuntimeConfig().then((config) => {
      if (!config) {
        console.warn(
          '[firebase] Not configured - Testimonials live features are disabled. ' +
            'Configure NEXT_PUBLIC_FIREBASE_* as Cloudflare runtime variables.'
        );
        return { app: null, db: null, auth: null, googleProvider: null };
      }

      const app = getApps().length ? getApps()[0] : initializeApp(config);
      return {
        app,
        db: getFirestore(app),
        auth: getAuth(app),
        googleProvider: new GoogleAuthProvider(),
      };
    });
  }

  return servicesPromise;
}
