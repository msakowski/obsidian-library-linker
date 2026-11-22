# Chapter-reference navigation

Source: [issue #152](https://github.com/msakowski/obsidian-library-linker/issues/152).

## Accepted scope

- A chapter-only reference such as `1 Kings 1` opens the whole chapter. JW Library controls highlighting; forced highlighting is not required.
- Preserve verse shorthand for single-chapter books (`Jude 5`). Use explicit `Jude 1:*` for the whole chapter; `:*` also works with other books.
- Represent a chapter reference with absent `verseRanges`, serialize it with verse `000`, and display its chapter without a fabricated verse range.
- Support suggestions, bulk linking, and reconversion. Keep chapter links intact during quote insertion; whole-chapter quotations are outside this request.
- Preserve language and link styling settings, desktop/mobile support, and offline link creation.

## Implementation and review

- [x] Verify current parser rejects chapter-only references.
- [x] Test reference-to-Markdown conversion, detection/suggestions, and quote handling (interfaces confirmed by maintainer).
- [x] Implement one failing behavioral test at a time.
- [x] Run full repository validation and independent standards/spec reviews (616 tests pass; review punctuation finding fixed).
  Implementation complete; deliver as a focused PR with the manual checks below.

Manual verification in Obsidian on desktop and mobile: type `John 3`, `/b John 3`, and `Jude 1:*`; select and open suggestions; bulk-link chapter and verse references; reconvert styled chapter links; insert quotes alongside chapter links without losing them. Confirm the link opens the intended chapter in installed JW Library.
