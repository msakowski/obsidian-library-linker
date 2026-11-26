import { beforeAll, describe, expect, test, vi } from 'vitest';
import type { Editor, EditorPosition } from 'obsidian';
import { initializeTestBibleBooks } from '../__tests__/__helpers__/initializeBibleBooksForTests';
import { createSettings } from '../__tests__/__helpers__/createSettings';
import { MAX_VERSES_IN_CHAPTER } from './splitBibleReferenceForCitation';
import { insertAllBibleQuotes, insertBibleQuoteAtCursor } from './insertBibleQuotes';
import { ConfiguredBibleCitationProvider } from '@/services/ConfiguredBibleCitationProvider';
import { OfflineBibleCitationProvider } from '@/services/OfflineBibleCitationProvider';
import type {
  BibleCitationProvider,
  BibleReference,
  LinkReplacerSettings,
  OfflineBibleCorpusMetadata,
  OfflineBibleRepository,
} from '@/types';
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
      { chapter: 3, start: 1, end: MAX_VERSES_IN_CHAPTER, toChapterEnd: true },
      { chapter: 4, start: 1, end: 11 },
    ],
  },
  {
    url: MATTHEW_3_13_TO_4_2,
    label: 'Mt 3:13-4:2',
    parts: [
      { chapter: 3, start: 13, end: MAX_VERSES_IN_CHAPTER, toChapterEnd: true },
      { chapter: 4, start: 1, end: 2 },
    ],
  },
])('quoting the real cross-chapter link $label', ({ url, label, parts }): void => {
  const expectedCalls = parts.map(({ chapter, ...range }) => ({
    book: 40,
    chapter,
    verseRanges: [range],
  }));
  // The quote keeps the label and target of the whole reference, not of its parts.
  const expectedQuote = `[${label}](${url})\n> Chapter 3. Chapter 4.`;

  test('fetches every chapter when quoting the whole note', async (): Promise<void> => {
    const { editor, changes } = createEditor([`[${label}](${url})`]);
    const { provider, calls } = createProvider();

    const result = await insertAllBibleQuotes(editor, settings, provider);

    expect(result).toEqual({ inserted: 1, linksFound: 1, fetchFailed: 0, tooManyChapters: 0 });
    expect(calls).toEqual(expectedCalls);
    expect(changes).toHaveLength(1);
    expect(changes[0].text).toBe(expectedQuote);
  });

  test('fetches every chapter when quoting at the cursor', async (): Promise<void> => {
    const { editor, changes } = createEditor([`[${label}](${url})`]);
    const { provider, calls } = createProvider();

    const result = await insertBibleQuoteAtCursor(editor, settings, provider);

    expect(result).toEqual({
      inserted: true,
      alreadyExists: false,
      fetchFailed: false,
      tooManyChapters: false,
    });
    expect(calls).toEqual(expectedCalls);
    expect(changes).toHaveLength(1);
    expect(changes[0].text).toBe(expectedQuote);
  });
});

describe('quoting with only the offline Bible (online fallback off)', (): void => {
  const JOHN_3_16 = '[Joh 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)';

  // The real offline and configured providers, over a repository that has no
  // Bible imported, or one without the requested verse.
  function createOfflineOnlyProvider(bibleImported: boolean) {
    const repository = {
      getInstalledLanguages: () => Promise.resolve(bibleImported ? ['E'] : []),
      getMetadata: () =>
        Promise.resolve(bibleImported ? ({ language: 'E' } as OfflineBibleCorpusMetadata) : null),
      getChapter: () => Promise.resolve(null),
      getVerseRange: () => Promise.resolve(null),
    } as unknown as OfflineBibleRepository;
    const online = {
      getCitation: vi.fn(),
      isLanguageAvailable: vi.fn(),
    } satisfies BibleCitationProvider;
    const offlineOnly: LinkReplacerSettings = {
      ...settings,
      offlineBible: { allowOnlineFallback: false },
    };
    const provider = new ConfiguredBibleCitationProvider(
      () => offlineOnly,
      new OfflineBibleCitationProvider(repository, (key) => key),
      online,
      (key) => key,
    );

    return { provider, online, settings: offlineOnly };
  }

  test.each([
    { bibleImported: false, reason: 'errors.offlineBibleNotInstalled' },
    { bibleImported: true, reason: 'errors.offlineBibleVerseMissing' },
  ])(
    'reports why, without going online (Bible imported: $bibleImported)',
    async ({ bibleImported, reason }): Promise<void> => {
      const expectedError = `${reason} errors.onlineFallbackDisabled`;

      const whole = createOfflineOnlyProvider(bibleImported);
      const { editor, changes } = createEditor([JOHN_3_16]);
      await expect(insertAllBibleQuotes(editor, whole.settings, whole.provider)).resolves.toEqual({
        inserted: 0,
        linksFound: 1,
        fetchFailed: 1,
        fetchError: expectedError,
        tooManyChapters: 0,
      });
      expect(changes).toEqual([]);
      expect(whole.online.getCitation).not.toHaveBeenCalled();

      const atCursor = createOfflineOnlyProvider(bibleImported);
      await expect(
        insertBibleQuoteAtCursor(
          createEditor([JOHN_3_16]).editor,
          atCursor.settings,
          atCursor.provider,
        ),
      ).resolves.toEqual({
        inserted: false,
        alreadyExists: false,
        fetchFailed: true,
        fetchError: expectedError,
        tooManyChapters: false,
      });
      expect(atCursor.online.getCitation).not.toHaveBeenCalled();
    },
  );

  test('keeps the generic notice for an online failure', async (): Promise<void> => {
    const { editor } = createEditor([JOHN_3_16]);
    const provider: BibleCitationProvider = {
      getCitation: () =>
        Promise.resolve({
          success: false,
          source: 'online',
          text: '',
          citation: '',
          error: 'Failed to fetch',
        }),
      isLanguageAvailable: () => Promise.resolve(true),
    };

    const result = await insertAllBibleQuotes(editor, settings, provider);

    expect(result.fetchFailed).toBe(1);
    expect(result.fetchError).toBeUndefined();
  });
});
