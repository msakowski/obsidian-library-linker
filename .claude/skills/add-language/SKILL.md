---

name: add-language
description: Add support for a new language to jw-library-linker. Moves the entry from src/consts/languagesUnsupported.json to src/consts/languages.json, fetches Bible book names from jw\.org, and updates all the wiring listed in LOCALIZATION.md (LANGUAGE\_CODES, LOCALES, sign-language map, bibleBooks YAML, locale YAML, changeset). Use when the user asks to "add language X", "support language X", or invokes /add-language with a language name or JW Library code.
allowed-tools: Bash(node .claude/skills/add-language/scripts/_), Write(locale/_)
--------------------------------------------------------------------------------

# Add a new language

Implements the workflow described in `LOCALIZATION.md`. You must follow every step. Do not skip the verification commands at the end.

## Inputs

The user supplies a locale (e.g. `pl`, `it`). This is the `locale` field in `src/consts/languagesUnsupported.json`.

**If no language is specified**, read `.claude/skills/add-language/languages_by_users.json` and pick the entry with the highest `users` count where `supported` is `false`. Look up its locale in `src/consts/languagesUnsupported.json`. Announce the chosen language to the user before proceeding.

## Step 1 — Run the wrapper script

```bash
node .claude/skills/add-language/scripts/add-language.mjs <locale>
```

For spoken languages this single command:

- Fetches `locale/bibleBooks/<CODE>.yaml` from jw\.org
- Verifies the yaml (66 entries, contiguous ids 1…66, name fields, prefix rule) — **hard-fails before any mutation if invalid**
- Moves the entry from `languagesUnsupported.json` → `languages.json`
- Adds `code` to `LANGUAGE_CODES` and `locale` to `LOCALES` in `src/consts/languages.ts`
- Inserts a row into the **Supported Languages** table in `LOCALIZATION.md`
- Creates the changeset file
- Marks the language `supported: true` + `languageCode` in `languages_by_users.json`

For sign languages: fetch, verify, wiring, and mark-supported are skipped automatically. Read the script output to confirm the `code`, and capture `isSignLanguage` from `src/consts/languages.json` after the move.

**Standalone fallbacks** (if you need to re-run a single step):

```bash
node .claude/skills/add-language/scripts/verify-bible-books.mjs <locale>
node .claude/skills/add-language/scripts/mark-supported.mjs <locale>
```

## Step 2 — Sign languages only

If `isSignLanguage` is true, do these manually:

1. Determine the spoken base language (e.g. American Sign Language → English `E`). Ask the user if not obvious from `name`/`vernacular`/region.
2. **If the base language is not yet supported** (not in `src/consts/languages.json`): stop and run this entire skill for the base language first, then resume.
3. In `src/consts/languages.ts`: add `'<CODE>'` to the sign-language block of `LANGUAGE_CODES` (below `// Sign languages`, in alphabetical order).
4. Add `<CODE>: '<BASE_CODE>'` to `SIGN_LANGUAGE_MAP` in `src/utils/signLanguage.ts`, in the appropriate base-language section.
5. In `LOCALIZATION.md`: insert a row into the **Sign Languages** table (alphabetical by code). Format: `| <CODE> | <vernacular> / <name> |`.
6. **Sign languages reuse the base language's `bibleBooks/<BASE_CODE>.yaml` file.** No bibleBooks step needed.

## Step 3 — Create locale/<locale>.yaml (UI strings)

Skip if `locale/<locale>.yaml` already exists.

If missing, create it by translating each value in `locale/en.yaml` into the target language. Keep the keys, structure, and any `{{placeholders}}` or quoted defaults intact — translate only the user-facing strings.

**YAML quoting rule:** Any value that contains a `{{placeholder}}` must be wrapped in single quotes, e.g.:

```yaml
notInstalled: '{{language}}のオフライン聖書はインストールされていません。'
```

This applies whenever the placeholder is adjacent to non-ASCII text or other characters that would confuse the YAML parser. When in doubt, quote it.

## Step 4 — Verify

Run, in order, and fix any failures before reporting done:

```bash
pnpm test:lint-fix
pnpm test:types
pnpm test:jest
```

If `test:lint-fix` reports unfixable errors, resolve them manually and re-run until clean.

## Final summary

Report:

- Language added (code + name)
- Files modified
- Test results

Do not commit. The user reviews and commits.
