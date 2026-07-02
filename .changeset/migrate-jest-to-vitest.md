---
'jw-library-linker': patch
---

Migrate the test runner from Jest to Vitest. This removes `jest`, `jest-environment-jsdom`, `@swc/jest`, and `@swc/core` from the dependency tree, which in turn drops transitive packages flagged by Snyk (`@babel/core`, `ws@8.20.1`, `inflight`). The `BibleTextFetcher` desktop curl fallback now loads `child_process`/`util` via lazy dynamic `import()` instead of runtime `require()` (behaviour unchanged — still desktop-only and lazily loaded). Test wall-clock time is unchanged (~3.6s for the full suite).
