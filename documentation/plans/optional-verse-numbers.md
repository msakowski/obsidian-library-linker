# Optional verse numbers

Source: [issue #373](https://github.com/msakowski/obsidian-library-linker/issues/373).

## Problem

Requested in [discussion #353](https://github.com/msakowski/obsidian-library-linker/discussions/353). Plain quotes intentionally omit verse numbers, but multi-verse quotes can benefit from identifying each verse.

## Specification

- Add **Include verse numbers** in Bible quote formatting, off by default for new and existing installations.
- When enabled, prefix every verse in a multi-verse quote with its actual number and a space, including the first verse. Keep single-verse quotes unnumbered.
- Support contiguous and noncontiguous ranges within one chapter. Preserve gaps and add numbers only once per verse, even for split HTML segments.
- Apply equally to imported offline EPUB Bibles and the configured online fallback (WOL and jw\.org). Reuse existing imported data; no reimport needed.
- Keep templates, source marker/footnote removal, reference links, offline-first lookup and the online fallback control intact. Do not add network requests.
- Reject missing verses and unsupported cross-chapter quotations rather than inserting partial text.

## Acceptance and validation

Regression tests: setting off/on, single and multiple verses, gaps, verse 1/chapter markers, split segments, missing verses, cached HTML after toggling, offline-first behavior and enabled/disabled fallback. Run lint, type checks, full Vitest suite and production build.

Manual Obsidian desktop/mobile: persist the setting across reloads; insert quotes from an imported EPUB with networking unavailable; test missing offline data with online fallback enabled/disabled; check templates and reference links.

Include a minor Changeset for the next release. Publishing the release is a separate action.

## Implementation status

Implemented on `feat/optional-verse-numbers`: persisted toggle and multi-verse preview, localized controls, shared formatter, offline repository formatting, and online extraction across all selected ranges. Existing imported chapter data and settings remain compatible. Online extraction now rejects incomplete selections instead of returning partial quotes.

Automated coverage includes an EPUB import-to-quote test, actual offline/configured/online provider flows with mocked HTTP, cache reuse after toggling, missing verses, source marker cleanup and settings persistence. Desktop/mobile Obsidian verification above remains a manual release check; automated tests do not validate live upstream HTML or the host UI.
