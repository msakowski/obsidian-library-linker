---
'jw-library-linker': patch
---

Fix multi-chapter references in link name and suggestion.

Multi-chapter Bible references like "Matthew 3:1-4:11" were being incorrectly displayed as "Matthew 3:1-11" in the suggester interface. The parsing and link generation were working correctly, but the `formatBibleText` function was not handling the `endChapter` field properly for display purposes.

**Fixed:**
- Multi-chapter references now display correctly in suggestions (e.g., "Matthew 3:1-4:11" instead of "Matthew 3:1-11")
- Added proper handling of `endChapter` field in `formatBibleText` function
- Added comprehensive tests for multi-chapter reference formatting

**Examples of fixed references:**
- Matthew 3:1-4:11
- Genesis 1:1-2:3  
- John 2:3-3:6
