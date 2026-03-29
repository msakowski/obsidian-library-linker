# Data-Driven Bible Book Matching

## Problem

The current `BIBLE_REFERENCE_REGEX` uses a single generic pattern (`\p{L}{1,24}`) that only matches contiguous Unicode letter sequences. This fails for:

- **Korean**: multi-word names (`요한 1서`, `고린도 전서`), digit-suffixed short names (`요1`, `요2`, `요3`)
- **Vietnamese**: hyphenated names (`Sa-mu-ên`, `Lê-vi`, `Giê-rê-mi`) and multi-word names (`Sáng thế`, `Xuất Ai Cập`)
- **Other languages**: long-form names with spaces (Finnish, Dutch, Croatian, German)

Additionally, `findBook`'s `cleanTerm` function does not strip hyphens, so even when input reaches the lookup, hyphenated book names don't normalize correctly.

The issue affects all three matching modes: silent mode, explicit `/b` mode, and bulk convert.

GitHub issue: #161 / #235

## Design

### Approach: data-driven matching with mode-specific aggressiveness

Build regex patterns dynamically from loaded Bible book data. Use aggressive matching for `/b` and bulk convert (where user intent is clear), keep silent mode conservative.

### Component 1: Book Name Regex Builder

New file: `src/utils/buildBookNameRegex.ts`

**Function:** `buildBookNameRegex(language: Language): RegExp`

**Algorithm:**
1. Read loaded `BibleBook[]` for the given language via `getBibleBooks(language)`
2. Collect all name variants per book: short, medium, long, plus aliases (with prefix prepended where applicable)
3. Escape regex special characters in each name (hyphens, periods, parentheses, etc.)
4. Sort all names by length descending — longest first ensures greedy matching picks `요한 1서` over `요한`
5. Join with `|` and wrap: `(?:name1|name2|...)`
6. Append the chapter:verse tail pattern: `\s?\d+:\d+(?:-\d+(?::\d+)?)?(?:\s*,\s*\d+(?:-\d+)?)*`
7. Compile with flags `giu` and return

**Example output (Korean, abbreviated):**
```
/(?:요한 계시록|데살로니가 전서|데살로니가 후서|고린도 전서|고린도 후서|...|요3|요2|요1|계|유|행)\s?\d+:\d+.../giu
```

This naturally handles spaces, hyphens, embedded digits, and any other character present in the YAML data.

### Component 2: Mode-specific matching strategy

| Mode | Detection method | Rationale |
|---|---|---|
| `/b` explicit | Skip regex gate, pass query directly to `parseBibleReference` | User signaled intent with `/b` — let the parser be the authority |
| Bulk convert | Data-driven regex from `buildBookNameRegex` | Deliberate action — match all known book names |
| Silent mode | Generic `BIBLE_REFERENCE_REGEX` (minimally improved) | Must avoid false positives in free-form text |

**`/b` mode (`BibleReferenceSuggester.ts`):**
Remove the `BIBLE_REFERENCE_REGEX` gate at line 109. Pass the query directly to `parseBibleReference`. If parsing succeeds, show book suggestions. If it throws, show the "typing" hint.

**Bulk convert (`linkUnlinkedBibleReferences.ts`):**
Accept the data-driven regex as a parameter. Use it in the scan loop instead of `BIBLE_REFERENCE_REGEX`.

**Silent mode (`BibleReferenceSuggester.ts` line 35):**
Improve the generic regex minimally: change `\p{L}{1,24}` to `[\p{L}\-]{1,24}`. This adds support for Vietnamese hyphenated names without being overly aggressive. Multi-word book names remain unsupported in silent mode — this is intentional.

### Component 3: Normalization fixes

**`findBook.ts` — `cleanTerm`:**
Add hyphen to the strip pattern:
```typescript
name.toLowerCase().replace(/[/.\s\-]/g, '');
```
Applied to both the query side and all book name terms. `Lê-vi` normalizes to `lêvi` on both sides.

**`parseBibleReference.ts` — input preprocessing:**
Add hyphen to the strip pattern:
```typescript
input.replace(/[\.\s\-]/g, '');
```
When the data-driven regex captures `Sa-mu-ên 3:1`, the parser strips hyphens before extraction, and `findBook` strips hyphens from stored terms — both sides match.

### Component 4: Caching and lifecycle

- Built once after `loadBibleBooks()` during plugin startup
- Rebuilt when the user changes their language setting
- Stored on the plugin instance (e.g., `this.bookNameRegex: RegExp`)
- `linkUnlinkedBibleReferences` receives the regex as an additional parameter alongside `settings`
- `BibleReferenceSuggester` accesses it via `this.plugin.bookNameRegex`

`BIBLE_REFERENCE_REGEX` continues to exist — still used by silent mode. No changes to YAML files or data loading.

### Korean `요1/요2/요3` handling

Works naturally with the data-driven regex. The built pattern includes `요1`, `요2`, `요3` as literal alternations. In `parseBibleReference`, input `요11:1` (after stripping) hits the extraction regex `[\p{L}0-9]+?` which non-greedily captures `요1` and leaves `1:1`. `findBook('요1', 'KO')` returns book 62 (1 John).

In silent mode, `요1` remains undetectable by the generic regex. This is acceptable — the user can use the full form or `/b` mode.

## Testing

**`buildBookNameRegex` tests:**
- Verify regex matches all name variants (short/medium/long) followed by chapter:verse for each language
- Korean: `요1 1:1`, `요한 1서 1:1`, `요한 계시록 1:1`
- Vietnamese: `Sa-mu-ên 3:1`, `Lê-vi 25:1`, `Sáng thế 1:1`
- Longest-first sorting: `요한 1서` matches before `요한`

**`findBook` tests:**
- Hyphenated queries match hyphenated books after normalization
- Queries without hyphens also match (e.g., `lêvi` finds `Lê-vi`)

**`parseBibleReference` tests:**
- Korean multi-word: `요한 1서 1:1` → book 62, chapter 1, verse 1
- Vietnamese hyphenated: `Sa-mu-ên 3:1` → book 9, chapter 3, verse 1
- Korean digit short: `요1 1:1` → book 62, chapter 1, verse 1

**`linkUnlinkedBibleReferences` tests:**
- Bulk convert finds Korean/Vietnamese references that the old regex missed
- Existing language references still work (regression)

## Files changed

| File | Change |
|---|---|
| `src/utils/buildBookNameRegex.ts` | New — regex builder function |
| `src/utils/bibleReferenceRegex.ts` | Update generic regex: `\p{L}` → `[\p{L}\-]` |
| `src/utils/findBook.ts` | `cleanTerm` adds hyphen stripping |
| `src/utils/parseBibleReference.ts` | Input preprocessing adds hyphen stripping |
| `src/utils/linkUnlinkedBibleReferences.ts` | Accept and use data-driven regex |
| `src/BibleReferenceSuggester.ts` | Remove regex gate in `/b` mode; use data-driven regex reference |
| `src/main.ts` | Build and cache data-driven regex on init and language change |
| `src/__tests__/buildBookNameRegex.test.ts` | New — tests for regex builder |
| `src/__tests__/findBook.test.ts` | Add hyphen normalization tests |
| `src/__tests__/parseBibleReference.test.ts` | Add Korean/Vietnamese parsing tests |
| `src/__tests__/linkUnlinkedBibleReferences.test.ts` | Add Korean/Vietnamese bulk convert tests |
