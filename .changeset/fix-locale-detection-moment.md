---
'jw-library-linker': patch
---

Fix UI locale detection by reading from `window.moment.locale()` instead of `localStorage.language`, which Obsidian does not use.
