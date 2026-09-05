/**
 * Lazily load Firebase (app + firestore + auth) so its ~590KB of JavaScript is
 * fetched only when the Testimonials section actually needs it — when the user
 * scrolls to it or submits the form — instead of on initial page load.
 *
 * The first call kicks off the imports; every later call reuses the same
 * promise, so Firebase is only ever downloaded and initialized once.
 */
type FirestoreModule = typeof import('firebase/firestore');
type AuthModule = typeof import('firebase/auth');
type FirebaseCore = typeof import('@/lib/firebase');

export interface LazyFirebase {
  db: FirebaseCore['db'];
  auth: FirebaseCore['auth'];
  googleProvider: FirebaseCore['googleProvider'];
  firestore: FirestoreModule;
  authMod: AuthModule;
}

let cached: Promise<LazyFirebase> | null = null;

export function loadFirebase(): Promise<LazyFirebase> {
  if (!cached) {
    cached = Promise.all([
      import('@/lib/firebase'),
      import('firebase/firestore'),
      import('firebase/auth'),
    ]).then(([core, firestore, authMod]) => ({
      db: core.db,
      auth: core.auth,
      googleProvider: core.googleProvider,
      firestore,
      authMod,
    }));
  }
  return cached;
}
