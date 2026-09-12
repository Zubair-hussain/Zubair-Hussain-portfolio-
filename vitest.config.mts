import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "src"),
    },
  },
  test: {
    css: false,
    environment: "jsdom",
    globals: true,
    include: ["test/**/*.{test,spec}.{ts,tsx}"],
    restoreMocks: true,
    setupFiles: ["./test/setup.ts"],
    // jsdom + async component renders can exceed the 5s default on slower
    // machines/CI; give them headroom so passing tests don't flake on timeout.
    testTimeout: 20000,
    hookTimeout: 20000,
    coverage: {
      provider: "v8",
      // This gate covers deterministic application logic and API adapters.
      // The records package separately reports full-source coverage so that
      // visual/browser integration code is never hidden from the evidence.
      include: [
        "src/lib/blog.ts",
        "src/lib/email-verification.ts",
        "src/lib/firebase-config.ts",
        "src/lib/schedule-security.ts",
        "src/lib/site-url.ts",
        "src/lib/utils.ts",
        "src/lib/zubair-profile.ts",
        "src/app/api/articles/route.ts",
        "src/app/api/schedule/route.ts",
        "src/app/api/verify-email/route.ts",
      ],
      reporter: ["text", "json-summary", "html"],
      reportsDirectory: "coverage",
      thresholds: {
        statements: 80,
        functions: 80,
        lines: 80,
        branches: 60,
      },
    },
  },
});
