# Offline web-link conversion

Source: [issue #347](https://github.com/msakowski/obsidian-library-linker/issues/347).

## Evaluation and accepted constraint

The maintainer requires conversion to remain entirely offline. The example WOL `/bc/` and `/pc/` URLs identify a citation in a source document, not its target. Their target IDs and paragraph cannot be inferred reliably from those URLs alone. Keep those links unchanged; do not guess from visible labels or send requests. This portion of the original issue remains unresolved.

## Supported implementation

- Convert HTTPS `jw.org` and `www.jw.org` finder links with an explicit Bible or document target.
- Convert direct WOL document links without fragments and WOL Bible links with explicit `#v=book:chapter:verse` targets/ranges.
- Preserve Markdown labels, target language, publication, and paragraph parameters. Respect the selected Bible/publication/all filter.
- Drop only finder routing/share metadata (`srcid`, `prefer`). Leave unknown parameters, duplicate parameters, ambiguous targets, unsupported fragments, and malformed URLs unchanged. Leave titled Markdown web links unchanged to preserve their titles.
- Do not broaden runtime networking, change existing settings, or introduce dependencies.

## Validation and delivery

- [x] Reproduce that existing conversion leaves direct finder URLs unchanged.
- [x] Implement through the conversion interface with red/green behavioral tests.
- [x] Full validation (614 tests pass) and independent standards/spec reviews. Fixed empty-parameter and Markdown-title findings with regression tests.
  Implementation complete; deliver as a focused PR referencing rather than closing #347. Manual verification remains below.

Manual verification on Obsidian desktop/mobile: convert selected Markdown using each filter; follow the resulting links in JW Library; check the source language, publication and paragraph. Confirm the original issue's cross-reference URLs stay unchanged offline.
