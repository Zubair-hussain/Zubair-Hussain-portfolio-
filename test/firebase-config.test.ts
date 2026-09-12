import { describe, expect, it } from "vitest";
import { getFirebasePublicConfig } from "../src/lib/firebase-config";

describe("Firebase public runtime configuration", () => {
  it("maps the public Cloudflare variables to Firebase Web SDK config", () => {
    expect(
      getFirebasePublicConfig({
        NEXT_PUBLIC_FIREBASE_API_KEY: "public-api-key",
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "portfolio.firebaseapp.com",
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "portfolio",
        NEXT_PUBLIC_FIREBASE_APP_ID: "web-app-id",
      }),
    ).toEqual({
      apiKey: "public-api-key",
      authDomain: "portfolio.firebaseapp.com",
      projectId: "portfolio",
      appId: "web-app-id",
      databaseURL: undefined,
      storageBucket: "portfolio.appspot.com",
      messagingSenderId: undefined,
      measurementId: undefined,
    });
  });

  it("does not enable Firebase when a required value is missing", () => {
    expect(
      getFirebasePublicConfig({
        NEXT_PUBLIC_FIREBASE_API_KEY: "public-api-key",
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "portfolio",
      }),
    ).toBeNull();
  });

  it("trims values and preserves every optional Firebase setting", () => {
    expect(
      getFirebasePublicConfig({
        NEXT_PUBLIC_FIREBASE_API_KEY: " key ",
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: " auth.example.com ",
        NEXT_PUBLIC_FIREBASE_DATABASE_URL: " https://db.example.com ",
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: " project ",
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: " custom-bucket ",
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: " sender ",
        NEXT_PUBLIC_FIREBASE_APP_ID: " app ",
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: " measurement ",
      }),
    ).toEqual({
      apiKey: "key",
      authDomain: "auth.example.com",
      databaseURL: "https://db.example.com",
      projectId: "project",
      storageBucket: "custom-bucket",
      messagingSenderId: "sender",
      appId: "app",
      measurementId: "measurement",
    });
  });
});
