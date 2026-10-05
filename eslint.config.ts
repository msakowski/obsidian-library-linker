import { defineConfig } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import obsidianmd from 'eslint-plugin-obsidianmd';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: ['node_modules/**', '.claude', '.worktrees', '*.js', '*.mjs', 'dist/**'],
  },
  ...obsidianmd.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd(),
        sourceType: 'module',
      },
    },
    rules: {
      // TypeScript already checks for undefined identifiers (incl. vitest globals)
      'no-undef': 'off',
      'no-unused-vars': ['warn', { args: 'none' }],
      '@typescript-eslint/no-unused-vars': ['warn', { args: 'none' }],
      '@typescript-eslint/ban-ts-comment': 'off',
      'no-prototype-builtins': 'off',
      '@typescript-eslint/no-empty-function': 'off',
    },
  },
  {
    // Build tooling runs in Node, not in Obsidian
    files: ['*.config.ts'],
    rules: {
      'obsidianmd/no-nodejs-modules': 'off',
    },
  },
  {
    // Tests run in Node/jsdom, not in Obsidian
    files: ['src/__tests__/**/*.ts'],
    rules: {
      'no-irregular-whitespace': 'off',
      'obsidianmd/hardcoded-config-path': 'off',
      'obsidianmd/no-global-this': 'off',
      'obsidianmd/no-nodejs-modules': 'off',
      'obsidianmd/prefer-create-el': 'off',
    },
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
