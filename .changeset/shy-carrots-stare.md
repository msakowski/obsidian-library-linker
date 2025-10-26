---
"jw-library-linker": patch
---

Fix systematic bug preventing extraction of verse 1 text from all Bible chapters

Fixed a critical bug in BibleTextFetcher where the first verse of any chapter could not be extracted correctly. JW.org displays the chapter number (e.g., "3") instead of verse number ("1") for the first verse, which caused the regex pattern to fail. This affected all verse 1 references across the entire Bible (e.g., Prediger 3:1, Psalm 23:1, 1. Mose 1:1, etc.).
