---
'jw-library-linker': patch
---

Extract shared lazy Node.js module helpers into `src/utils/lazyNodeModules.ts`, removing duplicated lazy-require wrappers from `BibleEpubImportService` and `FileSystemOfflineBibleRepository`.
