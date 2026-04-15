---
'jw-library-linker': minor
---

Improve Bible book name matching for Korean, Vietnamese, and other languages with spaces, hyphens, or embedded digits in book names.

- Explicit `/b` mode now matches all book name formats directly without regex pre-filtering
- Bulk convert uses data-driven regex built from actual book names for accurate detection
- Silent mode now supports hyphenated book names (e.g., Vietnamese Lê-vi, Ru-tơ)
- Book name normalization now strips hyphens for consistent matching
