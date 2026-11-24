# Architecture and testing

Read relevant sections when changing reference parsing, localization, settings, offline data, or tests.

## Architecture

- `src/main.ts`: plugin lifecycle, command registration, and `DEFAULT_SETTINGS`. Keep lifecycle code focused; delegate feature logic.
- `src/BibleReferenceSuggester.ts`: reference suggestions and silent detection.
- `src/ConvertSuggester.ts`: conversion selection modal.
- `src/settings/`: settings tab, sections, controls, and language suggestions.
- `src/services/`: translations, Bible text fetching, configured online/offline citation providers, EPUB import, vault offline storage, and plugin data paths.
- `src/stores/bibleBooks.ts`: book data cache.
- `src/utils/`: parsers, formatters, conversion, quote insertion, and logger.
- `src/consts/`: chapter counts and language metadata.
- `src/types.ts`: shared types and settings interfaces.
- `src/__tests__/`: existing tests, mocks, and helpers; new colocated specs are also discovered.
- `locale/*.yaml`: translated UI strings.
- `locale/bibleBooks/*.yaml`: Bible book names and aliases by JW Library language code.
- `esbuild.config.mjs` and `esbuild-yaml-plugin.mjs`: CJS bundle and bundled YAML data. Obsidian and host modules remain external.

### Languages and reference flow

- `Locale` codes such as `en` and `de` select UI strings through `TranslationService`, using Obsidian's `getLanguage()`.
- `Language` codes such as `E` and `X` select JW Library book names and link targets through plugin settings. Keep these two systems distinct.
- UI YAML is bundled as `BUNDLED_LOCALES` through `locale:all`.
- Call `loadBibleBooks()` before `getBibleBooks()`; the store uses `Map<Language, BibleBook[]>`.
- Input → `parseBibleReference()` → `BibleReference` → `formatJWLibraryLink()` → `convertBibleTextToMarkdownLink()`.
- `BibleReference` contains `book`, `chapter`, optional `endChapter`, and optional `verseRanges`. A single-verse `VerseRange` has equal `start` and `end`. Absent `verseRanges` means whole-chapter navigation (verse `000` in the link); it is not a verse-zero quotation request.
- Utility errors use translation keys as messages, for example `errors.invalidReferenceFormat`.
- Follow [Contributing a new language](../LOCALIZATION.md#contributing-a-new-language) when adding language support.

### Automatic quotes

Opt-in through `bibleQuote.autoInsertOnLinkCreation` (off by default). The quote text comes from the configured citation provider, so it follows the offline Bible settings: offline first, online fallback only when enabled.

- `BibleReferenceSuggester` calls `AutoBibleQuoteInserter.scheduleForCreatedLink()` after it writes a link. It returns at once; the lookup never runs in the typing path.
- `src/services/AutoBibleQuoteInserter.ts` skips whole-chapter links and references of more than `MAX_QUOTE_CHAPTERS` chapters, records the note of the editor, keeps one lookup per link, and checks again when the text arrives that the setting is still on, the plugin loaded, and the note unchanged. Failures show a notice and leave the note untouched; while no Bible text is available at all, that notice is shown once per session and language.
- `src/utils/createdLinkTracker.ts` (`CreatedLinkTracker`) follows the created link by document offsets through every edit made during the lookup, so the quote goes next to that very occurrence even when the same verse is cited elsewhere. The whole created reference must still be there unchanged before anything is written.
- `src/services/createdLinkTrackingExtension.ts` is the CodeMirror extension registered with `registerEditorExtension()`: it maps edits through the tracker and tells which note an `Editor` shows.
- `insertBibleQuoteForCreatedLink()` in `src/utils/insertBibleQuotes.ts` writes the quote in its own transaction origin, so undo removes the quote without the link.
- `src/services/listQuoteEnterExtension.ts` is a high-precedence Enter keymap, active only while the setting is on (read on each key press): at the end of a list item followed by its quote, it starts the next item after the quote. It returns `false` in every other case so Obsidian's own list handling runs.

## Test support

- Vitest uses `jsdom` and globals (`describe`, `test`, `expect`, `vi`); import helper types such as `Mock`, `Mocked`, or `MockInstance` from `vitest` as needed.
- Mock Obsidian through `src/__tests__/__mocks__/obsidian.ts`. Aliases in `vitest.config.ts` also provide `electron`, `locale:all`, `@/`, and `mocks/`.
- Use `initializeBibleBooksForTests()` to preload books and `createSettings()` for typed settings. Reuse the in-memory adapter helper for vault storage tests.

## Runtime and build

- `src/main.ts` is bundled by esbuild into root `main.js` as CommonJS; Obsidian and host-provided modules stay external.
- The plugin supports desktop and mobile (`manifest.json` has `isDesktopOnly: false`). Keep Node/Electron usage out of mobile paths.
- `styles.css` is a tracked stylesheet. The current esbuild configuration builds JavaScript only; there is no CSS generator, Tailwind pipeline, or `src/styles.src.css`.
- Use `logger` from `@/utils/logger`. It prefixes output with `[JWLinker]`; warnings/errors remain enabled in production, other levels require the build-time `DEBUG=true` flag.
- Keep initialization light; load large data on demand, batch storage access, and debounce repeated expensive events.
