import { describe, expect, it } from 'vitest';
import { getFirebasePublicConfig } from '../src/lib/firebase-config';

describe('Firebase public runtime configuration', () => {
  it('maps the public Cloudflare variables to Firebase Web SDK config', () => {
    expect(
      getFirebasePublicConfig({
        NEXT_PUBLIC_FIREBASE_API_KEY: 'public-api-key',
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'portfolio.firebaseapp.com',
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'portfolio',
        NEXT_PUBLIC_FIREBASE_APP_ID: 'web-app-id',
      })
    ).toEqual({
      apiKey: 'public-api-key',
      authDomain: 'portfolio.firebaseapp.com',
      projectId: 'portfolio',
      appId: 'web-app-id',
      databaseURL: undefined,
      storageBucket: 'portfolio.appspot.com',
      messagingSenderId: undefined,
      measurementId: undefined,
    });
  });

  it('does not enable Firebase when a required value is missing', () => {
    expect(
      getFirebasePublicConfig({
        NEXT_PUBLIC_FIREBASE_API_KEY: 'public-api-key',
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'portfolio',
      })
    ).toBeNull();
  });
});
