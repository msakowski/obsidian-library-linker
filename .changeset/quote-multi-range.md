---
'jw-library-linker': patch
---

Fix Bible quotes for multi-range (`Joh 1:1,4`) and multi-chapter (`Matt 3:1-4:11`) references: the reference is now looked up part by part, since a citation provider resolves a single verse range inside a single chapter, and the parts are stitched into one quote labelled with the whole reference. A part that cannot be fetched fails the whole quote rather than writing a partial one. The offline Bible clamps a verse range that runs past the end of a chapter. This applies to the quote commands and the context menu.
