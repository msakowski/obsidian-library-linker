---
'jw-library-linker': patch
---

Fix a line holding nothing but a reference not being recognised as such when the link is wrapped in the configured prefix and suffix (for example `(Matthew 24:14)`) or written as several comma-joined links: the quote was appended below instead of replacing the line, repeating the reference. The quotes of every link on such a line now replace it together in a single edit, and the line is kept when one of them cannot be fetched, so no reference is lost. A blank line is kept between the quote and any text that follows, so that text is not pulled into the blockquote.
