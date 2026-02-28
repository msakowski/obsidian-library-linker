# CLAUDE.md

## Pre-commit checklist

Before every commit, you MUST:

1. **Lint** — Run `pnpm test:lint` and fix any issues
2. **Test** — Run `pnpm test:jest` and ensure all tests pass
3. **Changeset** — Add a changeset file in `.changeset/` describing the change (use `patch` for fixes/improvements, `minor` for new features)

## Project overview

Obsidian plugin that converts Bible references to JW Library deep links (`jwlibrary:///finder?bible=...`). Users type Bible references (e.g. "Matt 24:14") and the plugin converts them to clickable markdown links that open in JW Library.

Key features:
- `/b` trigger for inline Bible reference suggestions
- Automatic detection of Bible references in text
- Batch conversion of `jwpub://` links to `jwlibrary://` links
- Bible quote insertion (fetches text from jw.org)
- Multi-language support (9 languages)

## Tech stack

- **TypeScript** (strict mode) with `@/*` path aliases mapping to `./src/*`
- **esbuild** for bundling (CJS output, `main.js`)
- **Jest** + **SWC** for testing (`jsdom` environment)
- **ESLint** (type-checked rules) + **Prettier**
- **pnpm** as package manager (not npm)
- **Changesets** for versioning

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Watch mode with `DEBUG=true` |
| `pnpm build` | Type-check + production build |
| `pnpm test` | Lint + type-check + jest (full CI check) |
| `pnpm test:lint` | ESLint only |
| `pnpm test:lint-fix` | ESLint with auto-fix |
| `pnpm test:jest` | Jest only |
| `pnpm test:types` | TypeScript type-check only |

## Project structure

```
src/
├── __tests__/                # Tests mirror src/ structure
│   ├── __helpers__/          # createSettings(), initializeBibleBooksForTests()
│   └── __mocks__/            # obsidian.ts (mock Obsidian API), plugin.ts
├── consts/                   # chapterCounts, SINGLE_CHAPTER_BOOKS
├── services/                 # BibleTextFetcher, TranslationService
├── stores/                   # bibleBooks (in-memory cache with loadBibleBooks/getBibleBooks)
├── utils/                    # Pure functions: parsers, formatters, regex, logger
├── BibleReferenceSuggester.ts  # EditorSuggest for /b command + silent mode
├── ConvertSuggester.ts         # FuzzySuggestModal for link conversion type
├── JWLibraryLinkerSettings.ts  # PluginSettingTab with live preview
├── main.ts                     # Plugin entry point, DEFAULT_SETTINGS
└── types.ts                    # All shared types (Language, BibleReference, etc.)
locale/
├── *.yaml                    # UI translations (en, de, fi, es, nl, ko, pt, fr, hr)
└── bibleBooks/*.yaml         # Bible book names per language (E, X, FI, O, S, F, KO, TPO, CR)
```

## Key architecture concepts

### Two language systems
- **Locale** (`en`, `de`, `fi`, ...): Controls UI strings via `TranslationService`. Detected from Obsidian's `localStorage.language`.
- **Language** (`E`, `X`, `FI`, ...): JW Library language codes used for Bible book names and link generation. Set in plugin settings.

### Bible reference flow
1. User input → `parseBibleReference()` → `BibleReference` object
2. `BibleReference` → `formatJWLibraryLink()` → `jwlibrary:///finder?bible=...` URL
3. `BibleReference` + URL → `convertBibleTextToMarkdownLink()` → `[Book Ch:V](jwlibrary://...)` markdown

### Data loading
- Locale YAML files are bundled at build time via `esbuild-yaml-plugin.mjs` and accessed as `BUNDLED_LOCALES`
- Bible books are loaded into an in-memory `Map<Language, BibleBook[]>` via `loadBibleBooks()` — must be called before `getBibleBooks()`

### Error convention
Errors thrown in utils use translation keys as messages (e.g. `throw new Error('errors.invalidReferenceFormat')`). These keys map to locale YAML entries.

## Coding conventions

### Imports
- Always use `@/` path aliases for src imports: `import { foo } from '@/utils/foo'`
- Use `import type` for type-only imports
- Obsidian API is an external dependency — mock it in tests via `src/__tests__/__mocks__/obsidian.ts`

### Logging
- Use `import { logger } from '@/utils/logger'` — never `console.*` directly
- Logger prefixes all output with `[JWLinker]`
- `logger.error` and `logger.warn` always show in production; other levels only when `DEBUG=true`

### Tests
- Test files live in `src/__tests__/*.test.ts`
- Use `@jest-environment jsdom` directive when DOM APIs are needed
- Use `initializeBibleBooksForTests()` helper to pre-load Bible book data
- Use `createSettings()` helper for properly typed test settings
- Tests run with SWC for speed (`@swc/jest` transform)

### Types
- `BibleReference` is the core data type: `{ book, chapter, endChapter?, verseRanges? }`
- `VerseRange`: `{ start, end }` — for single verses, `start === end`
- `Language` type is a union of JW Library language codes
- `Locale` type is a union of Obsidian UI language codes

### Changesets
Format: `.changeset/<descriptive-name>.md`
```
---
'jw-library-linker': patch
---

Short description of what changed.
```

### Commit messages
Use conventional commit format: `fix:`, `feat:`, `chore:`, `perf:`, `docs:`

### Branch naming
- `fix/<description>` for bug fixes
- `feat/<description>` for new features
- `perf/<description>` for performance improvements
- `docs/<description>` for documentation changes

## Adding a new language

1. Add the JW Library language code to the `Language` type in `src/types.ts`
2. Add the Obsidian locale code to the `Locale` type in `src/types.ts` (if not already present)
3. Create `locale/bibleBooks/<LANG_CODE>.yaml` with all 66 books (id, aliases, name with short/medium/long)
4. Create `locale/<locale>.yaml` with all UI translations
5. Add the language to the dropdown in `JWLibraryLinkerSettings.ts`
6. Add the locale to `isValidLocale()` in `TranslationService.ts`
7. Add the language to `initializeTestBibleBooks()` default list in test helpers
8. Add language-specific characters (if any) to `getLanguageSpecificChars()`
