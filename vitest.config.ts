import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/__tests__/**/*.{test,spec}.{ts,tsx,js,jsx}'],
  },
  resolve: {
    alias: [
      // Order matters: more specific virtual/module ids before the `@/` prefix.
      { find: 'locale:all', replacement: r('./src/__tests__/__mocks__/locale-all.ts') },
      { find: 'electron', replacement: r('./src/__tests__/__mocks__/electron.ts') },
      { find: 'obsidian', replacement: r('./src/__tests__/__mocks__/obsidian.ts') },
      { find: /^mocks\/(.*)$/, replacement: r('./src/__tests__/__mocks__/$1') },
      { find: /^@\/(.*)$/, replacement: r('./src/$1') },
    ],
  },
});
