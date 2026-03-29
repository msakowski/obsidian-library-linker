# Data-Driven Bible Book Matching Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix Bible book name matching for Korean and Vietnamese (and other languages with spaces, hyphens, or embedded digits in book names) by building regex patterns dynamically from loaded YAML data.

**Architecture:** Three matching modes use two regex sources. Silent mode keeps a minimally-improved generic regex. Explicit `/b` mode bypasses the regex gate entirely and trusts `parseBibleReference` directly. Bulk convert uses a data-driven regex built from the actual book names for the active language. Normalization (`cleanTerm`, input preprocessing) is updated to strip hyphens.

**Tech Stack:** TypeScript, Jest + SWC, pnpm

---

### Task 1: Add hyphen stripping to `cleanTerm` in `findBook.ts`

**Files:**
- Modify: `src/utils/findBook.ts:5-7`
- Test: `src/__tests__/findBook.test.ts`

- [ ] **Step 1: Write failing tests for hyphenated book lookups**

Add these tests to `src/__tests__/findBook.test.ts`, inside the existing `describe('findBook', ...)` block, after the last existing test:

```typescript
test('finds Vietnamese books with hyphens stripped from query', () => {
  expect(findBook('lêvi', 'VT')).toEqual(expect.objectContaining({ id: 3 }));
  expect(findBook('rutơ', 'VT')).toEqual(expect.objectContaining({ id: 8 }));
  expect(findBook('samuên', 'VT')).toEqual(expect.objectContaining({ id: 9 }));
  expect(findBook('giôsuê', 'VT')).toEqual(expect.objectContaining({ id: 6 }));
});

test('finds Vietnamese books with hyphens in query', () => {
  expect(findBook('lê-vi', 'VT')).toEqual(expect.objectContaining({ id: 3 }));
  expect(findBook('ru-tơ', 'VT')).toEqual(expect.objectContaining({ id: 8 }));
  expect(findBook('sa-mu-ên', 'VT')).toEqual(expect.objectContaining({ id: 9 }));
});
```

- [ ] **Step 2: Add VT to test helper initialization**

In `src/__tests__/__helpers__/initializeBibleBooksForTests.ts`, add `'VT'` to the default languages array:

```typescript
export function initializeTestBibleBooks(
  languages: Language[] = ['E', 'X', 'FI', 'O', 'S', 'F', 'KO', 'TPO', 'CR', 'VT'],
): void {
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm test:jest -- --testPathPattern findBook`
Expected: FAIL — Vietnamese tests fail because `cleanTerm` doesn't strip hyphens. The `lêvi` query won't match `lê-vi` stored term (hyphen preserved on data side).

- [ ] **Step 4: Update `cleanTerm` to strip hyphens**

In `src/utils/findBook.ts`, change line 6:

```typescript
const cleanTerm = (name: string): string => {
  return name.toLowerCase().replace(/[/.\s\-]/g, '');
};
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm test:jest -- --testPathPattern findBook`
Expected: ALL PASS

- [ ] **Step 6: Commit**

```bash
git add src/utils/findBook.ts src/__tests__/findBook.test.ts src/__tests__/__helpers__/initializeBibleBooksForTests.ts
git commit -m "fix: strip hyphens in findBook cleanTerm for Vietnamese book names"
```

---

### Task 2: Add hyphen stripping to `parseBibleReference` input preprocessing

**Files:**
- Modify: `src/utils/parseBibleReference.ts:95-98`
- Test: `src/__tests__/parseBibleReference.test.ts`

- [ ] **Step 1: Write failing tests for hyphenated and Korean inputs**

Add these test cases to the `successTestCases` array in `src/__tests__/parseBibleReference.test.ts`, after the existing cases:

```typescript
{
  description: 'parses Vietnamese hyphenated book name',
  input: 'Lê-vi 25:1',
  language: 'VT' as Language,
  expected: {
    book: 3,
    chapter: 25,
    verseRanges: [{ start: 1, end: 1 }],
  },
},
{
  description: 'parses Vietnamese hyphenated book name with prefix',
  input: '1 Sa-mu-ên 3:1',
  language: 'VT' as Language,
  expected: {
    book: 9,
    chapter: 3,
    verseRanges: [{ start: 1, end: 1 }],
  },
},
{
  description: 'parses Korean multi-word book name (1 John)',
  input: '요한 1서 1:1',
  language: 'KO' as Language,
  expected: {
    book: 62,
    chapter: 1,
    verseRanges: [{ start: 1, end: 1 }],
  },
},
{
  description: 'parses Korean digit-suffixed short name (1 John)',
  input: '요1 1:1',
  language: 'KO' as Language,
  expected: {
    book: 62,
    chapter: 1,
    verseRanges: [{ start: 1, end: 1 }],
  },
},
{
  description: 'parses Korean multi-word book name (Revelation)',
  input: '요한 계시록 1:1',
  language: 'KO' as Language,
  expected: {
    book: 66,
    chapter: 1,
    verseRanges: [{ start: 1, end: 1 }],
  },
},
```

Note: The existing test runner uses `test.each(successTestCases)('$description', ({ input, expected }) => { ... })` with a hardcoded `language` of `'X'`. The new tests need per-test language. Update the test runner to support an optional `language` field:

Change the existing `test.each` call from:

```typescript
test.each(successTestCases)('$description', ({ input, expected }) => {
  const parseResult = parseBibleReference(input, language);
  expect(parseResult).toEqual(expected);
});
```

to:

```typescript
test.each(successTestCases)('$description', ({ input, expected, language: testLanguage }) => {
  const parseResult = parseBibleReference(input, (testLanguage ?? language) as Language);
  expect(parseResult).toEqual(expected);
});
```

And update the type for the test cases — add `language?: Language` to each entry. Existing test cases without `language` will use the default `'X'`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test:jest -- --testPathPattern parseBibleReference`
Expected: FAIL — Vietnamese hyphenated tests fail because hyphens aren't stripped from input. Korean tests may also fail depending on how the non-greedy extraction regex handles the collapsed input.

- [ ] **Step 3: Update input preprocessing to strip hyphens**

In `src/utils/parseBibleReference.ts`, change line 98:

```typescript
input = input
  .trim()
  .toLowerCase()
  .replace(/[\.\s\-]/g, '');
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:jest -- --testPathPattern parseBibleReference`
Expected: ALL PASS

If the Korean `요1 1:1` test still fails (because after stripping spaces/hyphens the input becomes `요11:1`, and the non-greedy `[\p{L}0-9]+?` may split as `요` + `11:1` instead of `요1` + `1:1`), this is expected. The `/b` mode fix in Task 5 will handle this by removing the regex gate. The `parseBibleReference` function may need an adjustment in the extraction regex — see Task 3.

- [ ] **Step 5: Commit**

```bash
git add src/utils/parseBibleReference.ts src/__tests__/parseBibleReference.test.ts
git commit -m "fix: strip hyphens in parseBibleReference input preprocessing"
```

---

### Task 3: Fix `parseBibleReference` extraction regex for Korean digit-suffixed names

**Files:**
- Modify: `src/utils/parseBibleReference.ts:102`
- Test: `src/__tests__/parseBibleReference.test.ts`

This task addresses the ambiguity when Korean short names like `요1` are followed by chapter numbers. After space stripping, `요1 1:1` becomes `요11:1`. The non-greedy `[\p{L}0-9]+?` captures `요` (minimum match), leaving `11:1` — which parses as chapter 11 verse 1 instead of book `요1` chapter 1 verse 1.

The fix: try `findBook` with progressively longer book-name prefixes before falling back. This is necessary because the boundary between "book name" and "chapter number" is ambiguous when both contain digits.

- [ ] **Step 1: Verify the Korean digit-suffix test case from Task 2 fails**

Run: `pnpm test:jest -- --testPathPattern parseBibleReference -t "Korean digit-suffixed"`
Expected: FAIL — `요1 1:1` parses as book `요` (John, id 43) chapter 11 instead of book `요1` (1 John, id 62) chapter 1.

If this test already passes from Task 2, skip to Step 5 (commit).

- [ ] **Step 2: Implement greedy-then-shrink book name extraction**

Replace the extraction logic in `src/utils/parseBibleReference.ts` at line 102. Change from:

```typescript
const match = input.match(new RegExp(`^([\\p{L}0-9]+?)(\\d+.*)$`, 'iu'));

if (!match) {
  throw new Error('errors.invalidFormat');
}

const [, bookName, remainder] = match;
```

to:

```typescript
// Use greedy match to find all possible letter+digit prefixes, then try
// progressively shorter prefixes against findBook to resolve ambiguity
// (e.g., Korean "요11:1" could be book "요1" ch 1 or book "요" ch 11)
const greedyMatch = input.match(new RegExp(`^([\\p{L}0-9]+?)(\\d+.*)$`, 'iu'));

if (!greedyMatch) {
  throw new Error('errors.invalidFormat');
}

let bookName = greedyMatch[1];
let remainder = greedyMatch[2];

// Try extending the book name to resolve digit-boundary ambiguity
// e.g., for "요11:1", try "요1" + "1:1" before settling on "요" + "11:1"
const fullPrefix = greedyMatch[1] + greedyMatch[2];
const colonIdx = fullPrefix.indexOf(':');
if (colonIdx > 0) {
  const beforeColon = fullPrefix.substring(0, colonIdx);
  // Try progressively longer book names (from longest to the greedy minimum)
  for (let i = beforeColon.length - 1; i > bookName.length - 1; i--) {
    const candidateBook = beforeColon.substring(0, i);
    const candidateRemainder = fullPrefix.substring(i);
    // Only consider if remainder starts with a digit (valid chapter start)
    if (/^\d/.test(candidateRemainder)) {
      try {
        const result = findBook(candidateBook, language);
        if (result && !Array.isArray(result)) {
          bookName = candidateBook;
          remainder = candidateRemainder;
          break;
        }
      } catch {
        // Book not found with this prefix length, try shorter
        continue;
      }
    }
  }
}
```

- [ ] **Step 3: Run tests to verify they pass**

Run: `pnpm test:jest -- --testPathPattern parseBibleReference`
Expected: ALL PASS — both the Korean digit-suffix case and all existing tests pass.

- [ ] **Step 4: Run full test suite for regression**

Run: `pnpm test:jest`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/parseBibleReference.ts
git commit -m "fix: resolve digit-boundary ambiguity in book name extraction for Korean"
```

---

### Task 4: Build data-driven regex from loaded book names

**Files:**
- Create: `src/utils/buildBookNameRegex.ts`
- Create: `src/__tests__/buildBookNameRegex.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/buildBookNameRegex.test.ts`:

```typescript
import { buildBookNameRegex } from '@/utils/buildBookNameRegex';
import { initializeTestBibleBooks } from './__helpers__/initializeBibleBooksForTests';

beforeAll(() => {
  initializeTestBibleBooks();
});

describe('buildBookNameRegex', () => {
  test('matches Korean short names with digits', () => {
    const regex = buildBookNameRegex('KO');
    expect('요1 1:1'.match(regex)).toBeTruthy();
    expect('요2 1:1'.match(regex)).toBeTruthy();
    expect('요3 1:1'.match(regex)).toBeTruthy();
  });

  test('matches Korean multi-word book names', () => {
    const regex = buildBookNameRegex('KO');
    expect('요한 1서 1:1'.match(regex)).toBeTruthy();
    expect('요한 2서 1:1'.match(regex)).toBeTruthy();
    expect('요한 3서 1:1'.match(regex)).toBeTruthy();
    expect('요한 계시록 1:1'.match(regex)).toBeTruthy();
    expect('고린도 전서 1:1'.match(regex)).toBeTruthy();
    expect('데살로니가 전서 1:1'.match(regex)).toBeTruthy();
  });

  test('matches Korean simple book names', () => {
    const regex = buildBookNameRegex('KO');
    expect('창 1:1'.match(regex)).toBeTruthy();
    expect('창세기 1:1'.match(regex)).toBeTruthy();
    expect('요한복음 3:16'.match(regex)).toBeTruthy();
  });

  test('matches Vietnamese hyphenated book names', () => {
    const regex = buildBookNameRegex('VT');
    expect('Lê-vi 25:1'.match(regex)).toBeTruthy();
    expect('Ru-tơ 1:1'.match(regex)).toBeTruthy();
    expect('Sa-mu-ên 3:1'.match(regex)).toBeTruthy();
    expect('1 Sa-mu-ên 3:1'.match(regex)).toBeTruthy();
    expect('Giô-suê 1:1'.match(regex)).toBeTruthy();
  });

  test('matches Vietnamese multi-word book names', () => {
    const regex = buildBookNameRegex('VT');
    expect('Sáng thế 1:1'.match(regex)).toBeTruthy();
    expect('Xuất Ai Cập 1:1'.match(regex)).toBeTruthy();
    expect('Phục truyền luật lệ 1:1'.match(regex)).toBeTruthy();
  });

  test('matches Vietnamese short names', () => {
    const regex = buildBookNameRegex('VT');
    expect('Sa 1:1'.match(regex)).toBeTruthy();
    expect('1Sa 3:1'.match(regex)).toBeTruthy();
  });

  test('matches English book names', () => {
    const regex = buildBookNameRegex('E');
    expect('John 3:16'.match(regex)).toBeTruthy();
    expect('1 Corinthians 1:1'.match(regex)).toBeTruthy();
    expect('Rev 21:4'.match(regex)).toBeTruthy();
    expect('Matt. 6:33'.match(regex)).toBeTruthy();
  });

  test('matches German book names', () => {
    const regex = buildBookNameRegex('X');
    expect('Offenbarung 21:4'.match(regex)).toBeTruthy();
    expect('1. Mose 1:1'.match(regex)).toBeTruthy();
    expect('Röm 8:28'.match(regex)).toBeTruthy();
  });

  test('matches verse ranges', () => {
    const regex = buildBookNameRegex('E');
    expect('John 3:16-17'.match(regex)).toBeTruthy();
    expect('John 1:1,2,4'.match(regex)).toBeTruthy();
    expect('Matt 3:1-4:11'.match(regex)).toBeTruthy();
  });

  test('prefers longest match', () => {
    const regex = buildBookNameRegex('KO');
    const match = '요한 1서 1:1'.match(regex);
    // Should match "요한 1서 1:1" not just "요한"
    expect(match).toBeTruthy();
    expect(match![0]).toContain('요한 1서');
  });

  test('does not match random text', () => {
    const regex = buildBookNameRegex('E');
    expect('Hello world'.match(regex)).toBeNull();
    expect('The number 3:16 is interesting'.match(regex)).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test:jest -- --testPathPattern buildBookNameRegex`
Expected: FAIL — module `@/utils/buildBookNameRegex` does not exist.

- [ ] **Step 3: Implement `buildBookNameRegex`**

Create `src/utils/buildBookNameRegex.ts`:

```typescript
import type { Language } from '@/types';
import { getBibleBooks } from '@/stores/bibleBooks';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildBookNameRegex(language: Language): RegExp {
  const books = getBibleBooks(language);

  const allNames: string[] = [];

  for (const book of books) {
    // Collect all name variants
    const names = [book.name.short, book.name.medium, book.name.long];

    // Add aliases with prefix
    for (const alias of book.aliases) {
      if (book.prefix) {
        allNames.push(`${book.prefix}${alias}`);
        // Also allow space/dot between prefix and alias
        allNames.push(`${book.prefix} ${alias}`);
        allNames.push(`${book.prefix}.${alias}`);
        allNames.push(`${book.prefix}. ${alias}`);
      } else {
        allNames.push(alias);
      }
    }

    for (const name of names) {
      allNames.push(name);
    }
  }

  // Deduplicate and filter empty
  const uniqueNames = [...new Set(allNames.filter((n) => n.length > 0))];

  // Sort by length descending — longest first for greedy matching
  uniqueNames.sort((a, b) => b.length - a.length);

  // Escape regex special chars and join
  const bookPattern = uniqueNames.map(escapeRegex).join('|');

  // Build full regex: book name + optional dot/space + chapter:verse pattern
  const chapterVersePattern =
    '\\.?\\s?\\d+:\\d+(?:-\\d+(?::\\d+)?)?(?:\\s*,\\s*\\d+(?:-\\d+)?)*';

  return new RegExp(`(?:${bookPattern})${chapterVersePattern}`, 'giu');
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:jest -- --testPathPattern buildBookNameRegex`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/buildBookNameRegex.ts src/__tests__/buildBookNameRegex.test.ts
git commit -m "feat: add buildBookNameRegex for data-driven Bible book matching"
```

---

### Task 5: Remove regex gate in `/b` explicit mode

**Files:**
- Modify: `src/BibleReferenceSuggester.ts:109-118`

- [ ] **Step 1: Understand the current flow**

In `src/BibleReferenceSuggester.ts`, the `getSuggestions` method at line 109 checks `query.match(BIBLE_REFERENCE_REGEX)`. If the query doesn't match, it returns a "typing" hint for explicit mode or empty for silent mode. This gate blocks valid Korean/Vietnamese names that the generic regex can't detect.

The fix: in explicit mode, skip the regex check entirely. Try `parseBibleReference` directly — if it succeeds, the user typed a valid reference. If it throws, show the typing hint.

- [ ] **Step 2: Refactor `getSuggestions` to bypass regex in explicit mode**

In `src/BibleReferenceSuggester.ts`, replace lines 109-137:

```typescript
if (!query.match(BIBLE_REFERENCE_REGEX)) {
  if (!isExplicitMode) return [];
  return [
    {
      text: query,
      command: 'typing',
      description: this.t('suggestions.typing', { text: query }),
    },
  ];
}

// If it's a complete reference, parse and show detailed suggestions
let reference: BibleReference | null = null;

try {
  reference = parseBibleReference(query, this.plugin.settings.language);
} catch (error: unknown) {
  logger.error(error instanceof Error ? error.message : String(error));

  if (!isExplicitMode) return [];

  return [
    {
      text: query,
      command: 'typing',
      description: this.t('suggestions.typing', { text: query }),
    },
  ];
}
```

with:

```typescript
// Silent mode: use generic regex to avoid false positives
if (!isExplicitMode && !query.match(BIBLE_REFERENCE_REGEX)) {
  return [];
}

// Try parsing the reference directly — this handles all book name formats
// including multi-word, hyphenated, and digit-suffixed names
let reference: BibleReference | null = null;

try {
  reference = parseBibleReference(query, this.plugin.settings.language);
} catch (error: unknown) {
  logger.error(error instanceof Error ? error.message : String(error));

  if (!isExplicitMode) return [];

  return [
    {
      text: query,
      command: 'typing',
      description: this.t('suggestions.typing', { text: query }),
    },
  ];
}
```

- [ ] **Step 3: Run full test suite for regression**

Run: `pnpm test:jest`
Expected: ALL PASS

- [ ] **Step 4: Commit**

```bash
git add src/BibleReferenceSuggester.ts
git commit -m "fix: bypass regex gate in explicit /b mode for flexible book matching"
```

---

### Task 6: Use data-driven regex in bulk convert

**Files:**
- Modify: `src/utils/linkUnlinkedBibleReferences.ts:1-4,30`
- Test: `src/__tests__/linkUnlinkedBibleReferences.test.ts`

- [ ] **Step 1: Write failing tests for Korean and Vietnamese bulk convert**

Add these tests to `src/__tests__/linkUnlinkedBibleReferences.test.ts`, inside the existing `describe` block:

```typescript
test('should find and create links for Korean multi-word references', () => {
  const koreanSettings: LinkReplacerSettings = {
    ...TEST_DEFAULT_SETTINGS,
    language: 'KO',
  };

  const koreanText = '요한 1서 1:1을 읽어보세요.';

  linkUnlinkedBibleReferences(koreanText, koreanSettings, callbackMock);

  const callbackArgs = callbackMock.mock.calls[0][0];
  expect(callbackArgs.error).toBeUndefined();
  expect(callbackArgs.changes.length).toBe(1);
  expect(callbackArgs.changes[0].text).toContain('jwlibrary:///finder?bible=');
});

test('should find and create links for Korean digit-suffixed references', () => {
  const koreanSettings: LinkReplacerSettings = {
    ...TEST_DEFAULT_SETTINGS,
    language: 'KO',
  };

  const koreanText = '요1 1:1을 읽어보세요.';

  linkUnlinkedBibleReferences(koreanText, koreanSettings, callbackMock);

  const callbackArgs = callbackMock.mock.calls[0][0];
  expect(callbackArgs.error).toBeUndefined();
  expect(callbackArgs.changes.length).toBe(1);
  expect(callbackArgs.changes[0].text).toContain('jwlibrary:///finder?bible=');
});

test('should find and create links for Vietnamese hyphenated references', () => {
  const vietnameseSettings: LinkReplacerSettings = {
    ...TEST_DEFAULT_SETTINGS,
    language: 'VT',
  };

  const vietnameseText = 'Hãy đọc Lê-vi 25:1 và Ru-tơ 1:1.';

  linkUnlinkedBibleReferences(vietnameseText, vietnameseSettings, callbackMock);

  const callbackArgs = callbackMock.mock.calls[0][0];
  expect(callbackArgs.error).toBeUndefined();
  expect(callbackArgs.changes.length).toBe(2);
});

test('should find and create links for Vietnamese multi-word references', () => {
  const vietnameseSettings: LinkReplacerSettings = {
    ...TEST_DEFAULT_SETTINGS,
    language: 'VT',
  };

  const vietnameseText = 'Sáng thế 1:1 là câu đầu tiên.';

  linkUnlinkedBibleReferences(vietnameseText, vietnameseSettings, callbackMock);

  const callbackArgs = callbackMock.mock.calls[0][0];
  expect(callbackArgs.error).toBeUndefined();
  expect(callbackArgs.changes.length).toBe(1);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test:jest -- --testPathPattern linkUnlinkedBibleReferences`
Expected: FAIL — Korean and Vietnamese references not found by `BIBLE_REFERENCE_REGEX`.

- [ ] **Step 3: Update `linkUnlinkedBibleReferences` to use data-driven regex**

In `src/utils/linkUnlinkedBibleReferences.ts`, change the function signature to accept an optional regex parameter. When provided, use it instead of `BIBLE_REFERENCE_REGEX`:

Replace the import and function signature:

```typescript
import { parseBibleReference } from '@/utils/parseBibleReference';
import { convertBibleTextToMarkdownLink } from '@/utils/convertBibleTextToMarkdownLink';
import type { BibleReference, LinkReplacerSettings } from '@/types';
import { BIBLE_REFERENCE_REGEX } from '@/utils/bibleReferenceRegex';
import { logger } from '@/utils/logger';
import { buildBookNameRegex } from '@/utils/buildBookNameRegex';

type Change = {
  from: { line: number; ch: number };
  to: { line: number; ch: number };
  text: string;
};

export function linkUnlinkedBibleReferences(
  currentContent: string,
  settings: LinkReplacerSettings,
  callback: (settings: { changes: Change[]; error: string | undefined }) => void,
): void {
  // Use data-driven regex for accurate matching across all languages
  const regex = buildBookNameRegex(settings.language);
```

And update line 30 to use `regex` instead of `BIBLE_REFERENCE_REGEX`:

```typescript
  lines.forEach((line, lineIndex) => {
    let match;
    while ((match = regex.exec(line)) !== null) {
```

Remove the now-unused `BIBLE_REFERENCE_REGEX` import.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:jest -- --testPathPattern linkUnlinkedBibleReferences`
Expected: ALL PASS

- [ ] **Step 5: Run full test suite for regression**

Run: `pnpm test:jest`
Expected: ALL PASS

- [ ] **Step 6: Commit**

```bash
git add src/utils/linkUnlinkedBibleReferences.ts src/__tests__/linkUnlinkedBibleReferences.test.ts
git commit -m "feat: use data-driven regex in bulk convert for Korean/Vietnamese support"
```

---

### Task 7: Improve silent mode regex for hyphenated names

**Files:**
- Modify: `src/utils/bibleReferenceRegex.ts:1-2`
- Test: `src/__tests__/bibleReferenceRegex.test.ts`

- [ ] **Step 1: Write failing tests for hyphenated silent mode references**

Add Vietnamese references to `src/__tests__/bibleReferenceRegex.test.ts`. Add a new array after `validSpanishReferences`:

```typescript
const validVietnameseReferences = [
  'Lê-vi 25:1',
  'Ru-tơ 1:1',
  'Giô-suê 1:1',
  'Ha-ba-cúc 1:1',
  'Mi-chê 1:1',
];
```

And add a test:

```typescript
test('matches valid Vietnamese Bible references with hyphens', () => {
  validVietnameseReferences.forEach((reference) => {
    const testRegex = new RegExp(`^${BIBLE_REFERENCE_REGEX.source}$`, 'iu');
    if (!testRegex.test(reference)) {
      console.error('Should match', { reference });
    }
    expect(testRegex.test(reference)).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test:jest -- --testPathPattern bibleReferenceRegex`
Expected: FAIL — hyphenated names don't match `\p{L}{1,24}`.

- [ ] **Step 3: Update the generic regex to allow hyphens**

In `src/utils/bibleReferenceRegex.ts`, change `\p{L}{1,24}` to `[\p{L}\-]{1,24}`:

```typescript
export const BIBLE_REFERENCE_REGEX = new RegExp(
  '([1-5]{1}\\.?\\s?)?[\\p{L}\\-]{1,24}\\.?\\s?\\d+:\\d+(?:-\\d+(?::\\d+)?)?(?:\\s*,\\s*\\d+(?:-\\d+)?)*',
  'giu',
);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:jest -- --testPathPattern bibleReferenceRegex`
Expected: ALL PASS

- [ ] **Step 5: Run full test suite for regression**

Run: `pnpm test:jest`
Expected: ALL PASS

- [ ] **Step 6: Commit**

```bash
git add src/utils/bibleReferenceRegex.ts src/__tests__/bibleReferenceRegex.test.ts
git commit -m "fix: allow hyphens in silent mode regex for Vietnamese book names"
```

---

### Task 8: Lint, full test, and changeset

**Files:**
- Create: `.changeset/<descriptive-name>.md`

- [ ] **Step 1: Run linter**

Run: `pnpm test:lint`
Expected: PASS (no lint errors)

If there are lint errors, fix them.

- [ ] **Step 2: Run full test suite**

Run: `pnpm test:jest`
Expected: ALL PASS

- [ ] **Step 3: Run type check**

Run: `pnpm test:types`
Expected: PASS

- [ ] **Step 4: Create changeset**

Create `.changeset/korean-vietnamese-matching.md`:

```markdown
---
'jw-library-linker': minor
---

Improve Bible book name matching for Korean, Vietnamese, and other languages with spaces, hyphens, or embedded digits in book names.

- Explicit `/b` mode now matches all book name formats directly without regex pre-filtering
- Bulk convert uses data-driven regex built from actual book names for accurate detection
- Silent mode now supports hyphenated book names (e.g., Vietnamese Lê-vi, Ru-tơ)
- Book name normalization now strips hyphens for consistent matching
```

- [ ] **Step 5: Commit changeset**

```bash
git add .changeset/korean-vietnamese-matching.md
git commit -m "chore: add changeset for Korean/Vietnamese matching improvements"
```
