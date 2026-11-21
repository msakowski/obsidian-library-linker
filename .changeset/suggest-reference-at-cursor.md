---
'jw-library-linker': patch
---

Suggest the reference or `/b` command at the cursor: a reference typed after a link on the same line (e.g. in a list item) is suggested again, and a suggestion closed with Escape no longer reopens while typing goes on. `/b` only counts as the command at the start of a line or after a space, and the command shows its typing hint again until the text is a reference.
