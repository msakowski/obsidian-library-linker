---
'jw-library-linker': minor
---

Enable offline Bible EPUB import on iOS, iPadOS, and Android. Previously this feature was desktop-only because the import service used Node `fs`/`crypto`. The repository now uses Obsidian's cross-platform `DataAdapter`, hashing uses Web Crypto, and the `Platform.isDesktopApp` gates around the offline-Bible UI are removed (the desktop-only "Open folder in Finder" button stays gated). Per-chapter `.md` mirror files are no longer written; existing files are left in place and self-clean on next re-import.
