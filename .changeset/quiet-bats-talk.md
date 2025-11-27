---
"jw-library-linker": minor
---

Add support for multi-chapter Bible references

Implements support for parsing Bible references that span multiple chapters, such as "Matt. 3:1–4:11" (Matthew chapter 3 verse 1 through chapter 4 verse 11).

- Extended BibleReference type with optional endChapter field
- Updated parseBibleReference to detect and parse multi-chapter format
- Updated formatJWLibraryLink to generate correct JW Library URLs for multi-chapter references
- Updated parseBibleReferenceFromUrl to handle multi-chapter URLs
- Updated bibleReferenceRegex to match multi-chapter patterns
- Added comprehensive tests for multi-chapter references
- Added error messages in all supported languages (en, de, es, fi, nl, ko)
