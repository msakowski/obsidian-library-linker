---
'jw-library-linker': patch
---

Remove unnecessary spoofed User-Agent headers from BibleTextFetcher. Obsidian's requestUrl runs in Electron without CORS restrictions.
