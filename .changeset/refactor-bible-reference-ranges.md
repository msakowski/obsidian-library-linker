---
'jw-library-linker': patch
---

Internal refactor: BibleReference now uses a unified `ranges` array of `ReferenceRange` (with optional `chapterEnd`/`verseEnd`) instead of separate `chapter`, `endChapter`, and `verseRanges` fields. No user-facing behavior change.
