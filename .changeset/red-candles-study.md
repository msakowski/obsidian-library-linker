---
'jw-library-linker': patch
---

Fix "Insert Bible quote at cursor" command to handle multiple verse ranges on the same line. Previously, when using this command on a line with comma-separated verses (e.g., Genesis 2:9,15-17), only the first verse would be quoted and subsequent links would be deleted. Now all verse ranges on the cursor line are properly quoted.
