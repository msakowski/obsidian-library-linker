import { beforeAll, describe, expect, test } from 'vitest';
import type { Editor, EditorPosition } from 'obsidian';
import { initializeTestBibleBooks } from '../__tests__/__helpers__/initializeBibleBooksForTests';
import { createSettings } from '../__tests__/__helpers__/createSettings';
import { MAX_VERSES_IN_CHAPTER } from './splitBibleReferenceForCitation';
import { insertAllBibleQuotes, insertBibleQuoteAtCursor } from './insertBibleQuotes';
import type { BibleCitationProvider, BibleReference, LinkReplacerSettings } from '@/types';
import { BIBLE_QUOTE_TEMPLATES } from '@/types';

interface RecordedChange {
  from: EditorPosition;
  to: EditorPosition;
  text: string;
}

// Minimal editor over real lines, so links go through the real discovery and parsing.
function createEditor(lines: string[], cursorLine = 0) {
  const changes: RecordedChange[] = [];
  const editor = {
    getLine: (line: number) => lines[line] ?? '',
    lastLine: () => lines.length - 1,
    getCursor: () => ({ line: cursorLine, ch: 0 }),
    transaction: (transaction: { changes: RecordedChange[] }) => {
      changes.push(...transaction.changes);
    },
  } as unknown as Editor;

  return { editor, changes };
}

function createProvider() {
  const calls: BibleReference[] = [];
  const provider: BibleCitationProvider = {
    getCitation: (reference) => {
      calls.push(reference);
      return Promise.resolve({
        success: true,
        source: 'online',
        text: `Chapter ${reference.chapter}.`,
        citation: '',
      });
    },
    isLanguageAvailable: () => Promise.resolve(true),
  };

  return { provider, calls };
}

const MATTHEW_3_1_TO_4_11 = 'jwlibrary:///finder?bible=40003001-40004011&wtlocale=E';
// The ending verse is lower than the starting one: only the chapters keep it a valid range.
const MATTHEW_3_13_TO_4_2 = 'jwlibrary:///finder?bible=40003013-40004002&wtlocale=E';

let settings: LinkReplacerSettings;

beforeAll((): void => {
  initializeTestBibleBooks(['E']);
  const base = createSettings({ language: 'E', bookLength: 'short' });
  settings = {
    ...base,
    bibleQuote: { ...base.bibleQuote, template: BIBLE_QUOTE_TEMPLATES.short },
  };
});

describe.each([
  {
    url: MATTHEW_3_1_TO_4_11,
    label: 'Mt 3:1-4:11',
    parts: [
      { chapter: 3, start: 1, end: MAX_VERSES_IN_CHAPTER },
      { chapter: 4, start: 1, end: 11 },
    ],
  },
  {
    url: MATTHEW_3_13_TO_4_2,
    label: 'Mt 3:13-4:2',
    parts: [
      { chapter: 3, start: 13, end: MAX_VERSES_IN_CHAPTER },
      { chapter: 4, start: 1, end: 2 },
    ],
  },
])('quoting the real cross-chapter link $label', ({ url, label, parts }): void => {
  const expectedCalls = parts.map(({ chapter, start, end }) => ({
    book: 40,
    chapter,
    verseRanges: [{ start, end }],
  }));
  // The quote keeps the label and target of the whole reference, not of its parts.
  const expectedQuote = `[${label}](${url})\n> Chapter 3. Chapter 4.`;

  test('fetches every chapter when quoting the whole note', async (): Promise<void> => {
    const { editor, changes } = createEditor([`[${label}](${url})`]);
    const { provider, calls } = createProvider();

    const result = await insertAllBibleQuotes(editor, settings, provider);

    expect(result).toEqual({ inserted: 1, linksFound: 1, fetchFailed: 0 });
    expect(calls).toEqual(expectedCalls);
    expect(changes).toHaveLength(1);
    expect(changes[0].text).toBe(expectedQuote);
  });

  test('fetches every chapter when quoting at the cursor', async (): Promise<void> => {
    const { editor, changes } = createEditor([`[${label}](${url})`]);
    const { provider, calls } = createProvider();

    const result = await insertBibleQuoteAtCursor(editor, settings, provider);

    expect(result).toEqual({ inserted: true, alreadyExists: false, fetchFailed: false });
    expect(calls).toEqual(expectedCalls);
    expect(changes).toHaveLength(1);
    expect(changes[0].text).toBe(expectedQuote);
  });
});
