---
'jw-library-linker': minor
---

Add support for linking entire Bible chapters

- Support chapter-only references like "1 Kings 1", "John 3", "Psalm 23"
- Support single-chapter book references like "Jude", "Philemon", "Obadiah"
- Generate optimized JW Library URLs using 000-99 verse range for proper chapter highlighting
- Clean text formatting: "1 Kings 1" for multi-chapter books, "Jude" for single-chapter books
- Comprehensive verse count database for all 66 Bible books
- 26 new test cases covering all chapter-level functionality
- Backward compatible: all existing functionality preserved
- Conservative automatic detection prevents false positives while supporting manual chapter references
