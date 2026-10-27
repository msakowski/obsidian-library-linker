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
- `BibleReference` contains `book`, `chapter`, optional `endChapter`, and optional `verseRanges`. A single-verse `VerseRange` has equal `start` and `end`.
- Utility errors use translation keys as messages, for example `errors.invalidReferenceFormat`.
- Follow [Contributing a new language](../LOCALIZATION.md#contributing-a-new-language) when adding language support.

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
