---
'jw-library-linker': minor
---

Add an opt-in "Insert quote automatically" setting, off by default, that inserts the Bible quote right after a link is created from the suggestions — silent mode, `/b` and "create link and open".

The citation is fetched in the background, so typing is never blocked. Nothing is written if, by the time the text arrives, the link has left its line or another note has been opened in the tab. A failed lookup shows a notice and leaves the note untouched. A blockquote or callout below the link only counts as its quote when it contains the same link, and a link inside a callout gets its quote after the callout. When the quote replaces a reference the cursor lands on a blank line below it, before any text that follows, and a collapsed callout template is inserted open so the quote can be read straight away — it stays foldable by hand.
