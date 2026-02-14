---
'jw-library-linker': patch
---

Fix trailing whitespace in template variables breaking Markdown formatting. The plugin now trims whitespace from {bibleRef}, {bibleRefLinked}, and {quote} variables before substitution, preventing issues with bold/italic formatting in custom quote templates.
