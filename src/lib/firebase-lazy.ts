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

export interface LazyFirebase {
  db: import('firebase/firestore').Firestore | null;
  auth: import('firebase/auth').Auth | null;
  googleProvider: import('firebase/auth').GoogleAuthProvider | null;
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
    ]).then(async ([core, firestore, authMod]) => {
      const services = await core.initializeFirebase();
      return {
        db: services.db,
        auth: services.auth,
        googleProvider: services.googleProvider,
        firestore,
        authMod,
      };
    });
  }
  return cached;
}
