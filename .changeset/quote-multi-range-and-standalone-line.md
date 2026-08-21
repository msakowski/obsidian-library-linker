---
'jw-library-linker': patch
---

Fix Bible quotes for multi-range (`Joh 1:1,4`) and multi-chapter (`Matt 3:1-4:11`) references: the reference is now looked up part by part, since a citation provider resolves a single verse range inside a single chapter, and the parts are stitched into one quote labelled with the whole reference. This applies to the quote commands and the context menu.

Fix a line holding nothing but a reference not being recognised as such when the link is wrapped in the configured prefix and suffix (for example `(Matthew 24:14)`) or written as several comma-joined links: the quote was appended below instead of replacing the line, repeating the reference.

The online fetcher now reports a failure instead of returning the placeholder text `Unable to extract Bible text`, which could end up written into a note, and the offline Bible clamps a verse range that runs past the end of a chapter.

The "Expanded Callout" preset now uses `> [!quote]+`, which is expanded and foldable, instead of `> [!quote]`, which cannot be folded at all.
