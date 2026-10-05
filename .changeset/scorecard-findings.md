---
'jw-library-linker': minor
---

Address Obsidian Community Scorecard findings: drop the desktop `curl` fallback for fetching Bible text (no more `child_process`), use `setDestructive()` instead of the deprecated `setWarning()`, avoid inline styles, and raise `minAppVersion` to 1.13.0. Tooling now uses `eslint-plugin-obsidianmd`, ESLint's `defineConfig()`, and `nano-staged` instead of `lint-staged`.
