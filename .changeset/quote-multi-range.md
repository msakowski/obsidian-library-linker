---
'jw-library-linker': patch
---

Fix Bible quotes for multi-range (`Joh 1:1,4`) and multi-chapter (`Matt 3:1-4:11`) references: the reference is now looked up part by part, since a citation provider resolves a single verse range inside a single chapter, and the parts are stitched into one quote labelled with the whole reference. A part that cannot be fetched fails the whole quote rather than writing a partial one. Offline, a part that runs to the end of a chapter stops at its last verse, verses the NWT omits (such as Matt. 17:21) are skipped, and any other missing verse or a range past the end of a chapter fails so the online fallback can take over. This applies to the quote commands and the context menu. Online quotes no longer include the chapter number of a chapter's first verse, which a multi-chapter quote showed in the middle of the text (`… approved.” 4 Then Jesus …`).
