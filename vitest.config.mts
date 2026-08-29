import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
  test: {
    css: false,
    environment: 'jsdom',
    globals: true,
    include: ['test/**/*.{test,spec}.{ts,tsx}'],
    restoreMocks: true,
    setupFiles: ['./test/setup.ts'],
    // jsdom + async component renders can exceed the 5s default on slower
    // machines/CI; give them headroom so passing tests don't flake on timeout.
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});
