---
'jw-library-linker': patch
---

Remove unused `convertBibleReference` util and its test. Replace duplicate private `padBook`/`padChapter` methods in `FileSystemOfflineBibleRepository` with the shared `padNumber` utils.
