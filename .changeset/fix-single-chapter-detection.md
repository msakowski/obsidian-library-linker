---
'jw-library-linker': patch
---

Fix single-chapter book detection in silent mode and link unlinked references

Single-chapter books (Obadiah, Philemon, 2 John, 3 John, Jude) can now be detected
without the `chapter:verse` colon format in all modes:

- **Silent mode**: typing `Judas 3` or `3. Johannes 14` now triggers the suggestion popup
- **Link unlinked references**: plain-text references like `Jude 3` are now detected and converted
- **Command mode** (`/b`): already worked, unchanged
