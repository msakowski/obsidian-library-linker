---
'jw-library-linker': minor
---

Add an opt-in "Insert quote automatically" setting, off by default, that inserts the Bible quote right after a link is created from the suggestions — silent mode, `/b` and "create link and open".

The citation is fetched in the background, so typing is never blocked, and the link is located again before anything is written, in case it moved meanwhile. A failed lookup shows a notice and leaves the note untouched. When the quote replaces a reference the cursor lands on a fresh line below it, and a collapsed callout template is inserted open so the quote can be read straight away — it stays foldable by hand.
