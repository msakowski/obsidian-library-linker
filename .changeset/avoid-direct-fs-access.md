---
'jw-library-linker': patch
---

Stop using Node's `fs` and `path` modules directly. The offline Bible folder is now created via Obsidian's vault adapter API, addressing the community plugin review warning about direct filesystem access.
