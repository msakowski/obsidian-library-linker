---
'jw-library-linker': patch
---

Update tsconfig for TypeScript 6 compatibility: switch `moduleResolution` to `"bundler"`, drop the deprecated `baseUrl`, and explicitly declare `types: ["jest", "node"]` so tests type-check and lint cleanly.
