import { insertAllBibleQuotes, insertBibleQuoteAtCursor } from '@/utils/insertBibleQuotes';
import { BibleTextFetcher } from '@/services/BibleTextFetcher';
import { OnlineBibleCitationProvider } from '@/services/OnlineBibleCitationProvider';
import { convertBibleTextToMarkdownLink } from '@/utils/convertBibleTextToMarkdownLink';
import type { BibleCitationProvider, LinkReplacerSettings } from '@/types';
import { BIBLE_QUOTE_TEMPLATES } from '@/types';
import { TEST_DEFAULT_SETTINGS } from 'mocks/plugin';
import type { Editor } from 'obsidian';
import { initializeTestBibleBooks } from './__helpers__/initializeBibleBooksForTests';

// Mock dependencies
vi.mock('@/services/BibleTextFetcher');
vi.mock('@/utils/convertBibleTextToMarkdownLink');
// Mock findJWLibraryLinks but keep parseJWLibraryLink real
vi.mock('@/utils/findJWLibraryLinks', async () => ({
  ...(await vi.importActual<typeof import('@/utils/findJWLibraryLinks')>(
    '@/utils/findJWLibraryLinks',
  )),
  findJWLibraryLinks: vi.fn(),
}));

import { findJWLibraryLinks } from '@/utils/findJWLibraryLinks';
import type { Mock, Mocked } from 'vitest';

beforeAll(() => {
  initializeTestBibleBooks();
});

describe('insertAllBibleQuotes', () => {
  let mockEditor: Mocked<Editor>;
  let settings: LinkReplacerSettings;
  let provider: BibleCitationProvider;
  let mockGetLine: Mock;
  let mockLastLine: Mock;
  let mockTransaction: Mock;

  beforeEach(() => {
    mockGetLine = vi.fn();
    mockLastLine = vi.fn();
    mockTransaction = vi.fn();

    mockEditor = {
      getLine: mockGetLine,
      lastLine: mockLastLine,
      transaction: mockTransaction,
    } as unknown as Mocked<Editor>;

    provider = new OnlineBibleCitationProvider();

    settings = {
      ...TEST_DEFAULT_SETTINGS,
      bibleQuote: {
        template: BIBLE_QUOTE_TEMPLATES.short,
      },
    } satisfies LinkReplacerSettings;

    // Mock BibleTextFetcher
    (BibleTextFetcher.fetchBibleText as Mock).mockResolvedValue({
      success: true,
      text: 'For God loved the world so much that he gave his only-begotten Son.',
    });

    // Mock convertBibleTextToMarkdownLink
    (convertBibleTextToMarkdownLink as Mock).mockReturnValue(
      '[John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)',
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should insert Bible quote for single link', async () => {
    mockLastLine.mockReturnValue(0);
    mockGetLine.mockReturnValue('jwlibrary:///finder?bible=43003016');

    (findJWLibraryLinks as Mock).mockReturnValue([
      {
        url: 'jwlibrary:///finder?bible=43003016',
        reference: { book: 43, chapter: 3, verseRanges: [{ start: 16, end: 16 }] },
        lineNumber: 0,
        lineText: 'jwlibrary:///finder?bible=43003016',
      },
    ]);

    const result = await insertAllBibleQuotes(mockEditor, settings, provider);

    expect(result.inserted).toBe(1);
    expect(mockTransaction).toHaveBeenCalledWith({
      changes: [
        {
          from: { line: 0, ch: 0 },
          to: { line: 0, ch: 'jwlibrary:///finder?bible=43003016'.length },
          text: '[John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)\n> For God loved the world so much that he gave his only-begotten Son.',
        },
      ],
    });
  });

  test('should format quote as long-foldable callout', async () => {
    settings.bibleQuote.template = BIBLE_QUOTE_TEMPLATES.foldable;

    mockLastLine.mockReturnValue(0);
    mockGetLine.mockReturnValue('jwlibrary:///finder?bible=43003016');

    (findJWLibraryLinks as Mock).mockReturnValue([
      {
        url: 'jwlibrary:///finder?bible=43003016',
        reference: { book: 43, chapter: 3, verseRanges: [{ start: 16, end: 16 }] },
        lineNumber: 0,
        lineText: 'jwlibrary:///finder?bible=43003016',
      },
    ]);

    await insertAllBibleQuotes(mockEditor, settings, provider);

    expect(mockTransaction).toHaveBeenCalledWith({
      changes: [
        {
          from: { line: 0, ch: 0 },
          to: { line: 0, ch: 'jwlibrary:///finder?bible=43003016'.length },
          text: '> [!quote]- [John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)\n> For God loved the world so much that he gave his only-begotten Son.',
        },
      ],
    });
  });

  test('should format quote as long-expanded callout', async () => {
    settings.bibleQuote.template = BIBLE_QUOTE_TEMPLATES.expanded;

    mockLastLine.mockReturnValue(0);
    mockGetLine.mockReturnValue('jwlibrary:///finder?bible=43003016');

    (findJWLibraryLinks as Mock).mockReturnValue([
      {
        url: 'jwlibrary:///finder?bible=43003016',
        reference: { book: 43, chapter: 3, verseRanges: [{ start: 16, end: 16 }] },
        lineNumber: 0,
        lineText: 'jwlibrary:///finder?bible=43003016',
      },
    ]);

    await insertAllBibleQuotes(mockEditor, settings, provider);

    expect(mockTransaction).toHaveBeenCalledWith({
      changes: [
        {
          from: { line: 0, ch: 0 },
          to: { line: 0, ch: 'jwlibrary:///finder?bible=43003016'.length },
          text: '> [!quote] [John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)\n> For God loved the world so much that he gave his only-begotten Son.',
        },
      ],
    });
  });

  test('should skip links that already have quotes', async () => {
    mockLastLine.mockReturnValue(1);
    const lines = ['> [!quote] [John 3:16](jwlibrary:///finder?bible=43003016)', '> Quote text'];
    mockGetLine.mockImplementation((line: number) => lines[line]);

    (findJWLibraryLinks as Mock).mockReturnValue([
      {
        url: 'jwlibrary:///finder?bible=43003016',
        reference: { book: 43, chapter: 3, verseRanges: [{ start: 16, end: 16 }] },
        lineNumber: 0,
        lineText: '> [!quote] [John 3:16](jwlibrary:///finder?bible=43003016)',
      },
    ]);

    const result = await insertAllBibleQuotes(mockEditor, settings, provider);

    expect(result.inserted).toBe(0);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('should handle multiple links', async () => {
    mockLastLine.mockReturnValue(2);
    const lines = [
      'jwlibrary:///finder?bible=43003016',
      'Some text',
      'jwlibrary:///finder?bible=40005003',
    ];
    mockGetLine.mockImplementation((line: number) => lines[line]);

    (findJWLibraryLinks as Mock).mockReturnValue([
      {
        url: 'jwlibrary:///finder?bible=43003016',
        reference: { book: 43, chapter: 3, verseRanges: [{ start: 16, end: 16 }] },
        lineNumber: 0,
        lineText: 'jwlibrary:///finder?bible=43003016',
      },
      {
        url: 'jwlibrary:///finder?bible=40005003',
        reference: { book: 40, chapter: 5, verseRanges: [{ start: 3, end: 3 }] },
        lineNumber: 2,
        lineText: 'jwlibrary:///finder?bible=40005003',
      },
    ]);

    (convertBibleTextToMarkdownLink as Mock)
      .mockReturnValueOnce('[John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)')
      .mockReturnValueOnce('[Matt. 5:3](jwlibrary:///finder?bible=40005003&wtlocale=E)');

    const result = await insertAllBibleQuotes(mockEditor, settings, provider);

    expect(result.inserted).toBe(2);
    expect(mockTransaction).toHaveBeenCalledTimes(1);
  });

  test('should return 0 when no links found', async () => {
    mockLastLine.mockReturnValue(0);
    mockGetLine.mockReturnValue('No links here');

    (findJWLibraryLinks as Mock).mockReturnValue([]);

    const result = await insertAllBibleQuotes(mockEditor, settings, provider);

    expect(result).toEqual({ inserted: 0, linksFound: 0, fetchFailed: 0 });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('should handle fetch failure gracefully', async () => {
    mockLastLine.mockReturnValue(0);
    mockGetLine.mockReturnValue('jwlibrary:///finder?bible=43003016');

    (findJWLibraryLinks as Mock).mockReturnValue([
      {
        url: 'jwlibrary:///finder?bible=43003016',
        reference: { book: 43, chapter: 3, verseRanges: [{ start: 16, end: 16 }] },
        lineNumber: 0,
        lineText: 'jwlibrary:///finder?bible=43003016',
      },
    ]);

    (BibleTextFetcher.fetchBibleText as Mock).mockResolvedValue({
      success: false,
      text: null,
    });

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await insertAllBibleQuotes(mockEditor, settings, provider);
    warnSpy.mockRestore();

    expect(result).toEqual({ inserted: 0, linksFound: 1, fetchFailed: 1 });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('should append quote below when link is embedded in surrounding text', async () => {
    const lineText =
      'Jehova befähigt uns ([Jer. 1:8-9](jwlibrary:///finder?bible=24001008-24001009&wtlocale=X); w10 15. 1. 9)';
    mockLastLine.mockReturnValue(0);
    mockGetLine.mockReturnValue(lineText);

    (findJWLibraryLinks as Mock).mockReturnValue([
      {
        url: 'jwlibrary:///finder?bible=24001008-24001009&wtlocale=X',
        reference: { book: 24, chapter: 1, verseRanges: [{ start: 8, end: 9 }] },
        lineNumber: 0,
        lineText,
      },
    ]);

    (BibleTextFetcher.fetchBibleText as Mock).mockResolvedValue({
      success: true,
      text: 'Have no fear because of their appearance.',
    });

    (convertBibleTextToMarkdownLink as Mock).mockReturnValue(
      '[Jer. 1:8-9](jwlibrary:///finder?bible=24001008-24001009&wtlocale=X)',
    );

    const result = await insertAllBibleQuotes(mockEditor, settings, provider);

    expect(result.inserted).toBe(1);
    expect(mockTransaction).toHaveBeenCalledWith({
      changes: [
        {
          from: { line: 0, ch: lineText.length },
          to: { line: 0, ch: lineText.length },
          text:
            '\n\n[Jer. 1:8-9](jwlibrary:///finder?bible=24001008-24001009&wtlocale=X)\n' +
            '> Have no fear because of their appearance.',
        },
      ],
    });
  });

  test('should trim whitespace from variables in custom template', async () => {
    // Test for bug where trailing whitespace breaks markdown formatting
    settings.bibleQuote.template = '> ***{bibleRefLinked}***\n> *{quote}*';

    mockLastLine.mockReturnValue(0);
    mockGetLine.mockReturnValue('jwlibrary:///finder?bible=43003016');

    (findJWLibraryLinks as Mock).mockReturnValue([
      {
        url: 'jwlibrary:///finder?bible=43003016',
        reference: { book: 43, chapter: 3, verseRanges: [{ start: 16, end: 16 }] },
        lineNumber: 0,
        lineText: 'jwlibrary:///finder?bible=43003016',
      },
    ]);

    // Mock with trailing whitespace to simulate the bug
    (convertBibleTextToMarkdownLink as Mock).mockReturnValue(
      '[John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E) ',
    );

    (BibleTextFetcher.fetchBibleText as Mock).mockResolvedValue({
      success: true,
      text: 'For God loved the world so much that he gave his only-begotten Son. ',
    });

    await insertAllBibleQuotes(mockEditor, settings, provider);

    // Verify that whitespace is trimmed and markdown formatting is preserved
    expect(mockTransaction).toHaveBeenCalledWith({
      changes: [
        {
          from: { line: 0, ch: 0 },
          to: { line: 0, ch: 'jwlibrary:///finder?bible=43003016'.length },
          text: '> ***[John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)***\n> *For God loved the world so much that he gave his only-begotten Son.*',
        },
      ],
    });
  });
});

describe('insertBibleQuoteAtCursor', () => {
  let mockEditor: Mocked<Editor>;
  let settings: LinkReplacerSettings;
  let provider: BibleCitationProvider;
  let mockGetCursor: Mock;
  let mockGetLine: Mock;
  let mockLastLine: Mock;
  let mockTransaction: Mock;

  beforeEach(() => {
    mockGetCursor = vi.fn();
    mockGetLine = vi.fn();
    mockLastLine = vi.fn();
    mockTransaction = vi.fn();

    mockEditor = {
      getCursor: mockGetCursor,
      getLine: mockGetLine,
      lastLine: mockLastLine,
      transaction: mockTransaction,
    } as unknown as Mocked<Editor>;

    provider = new OnlineBibleCitationProvider();

    settings = {
      ...TEST_DEFAULT_SETTINGS,
      bibleQuote: {
        template: BIBLE_QUOTE_TEMPLATES.short,
      },
    } satisfies LinkReplacerSettings;

    (BibleTextFetcher.fetchBibleText as Mock).mockResolvedValue({
      success: true,
      text: 'For God loved the world so much that he gave his only-begotten Son.',
    });

    (convertBibleTextToMarkdownLink as Mock).mockReturnValue(
      '[John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)',
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should insert quote at cursor line', async () => {
    mockGetCursor.mockReturnValue({ line: 0, ch: 10 });
    mockLastLine.mockReturnValue(0);
    mockGetLine.mockReturnValue('jwlibrary:///finder?bible=43003016');

    const result = await insertBibleQuoteAtCursor(mockEditor, settings, provider);

    expect(result).toEqual({ inserted: true, alreadyExists: false, fetchFailed: false });
    expect(mockTransaction).toHaveBeenCalledWith({
      changes: [
        {
          from: { line: 0, ch: 0 },
          to: { line: 0, ch: 'jwlibrary:///finder?bible=43003016'.length },
          text: '[John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)\n> For God loved the world so much that he gave his only-begotten Son.',
        },
      ],
    });
  });

  test('should detect existing quote', async () => {
    mockGetCursor.mockReturnValue({ line: 0, ch: 10 });
    mockLastLine.mockReturnValue(1);
    const lines = ['> [!quote] [John 3:16](jwlibrary:///finder?bible=43003016)', '> Quote text'];
    mockGetLine.mockImplementation((line: number) => lines[line]);

    const result = await insertBibleQuoteAtCursor(mockEditor, settings, provider);

    expect(result).toEqual({ inserted: false, alreadyExists: true, fetchFailed: false });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('should return false when no link at cursor', async () => {
    mockGetCursor.mockReturnValue({ line: 0, ch: 10 });
    mockLastLine.mockReturnValue(0);
    mockGetLine.mockReturnValue('No link here');

    const result = await insertBibleQuoteAtCursor(mockEditor, settings, provider);

    expect(result).toEqual({ inserted: false, alreadyExists: false, fetchFailed: false });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('should handle cursor beyond last line', async () => {
    mockGetCursor.mockReturnValue({ line: 10, ch: 0 });
    mockLastLine.mockReturnValue(5);

    const result = await insertBibleQuoteAtCursor(mockEditor, settings, provider);

    expect(result).toEqual({ inserted: false, alreadyExists: false, fetchFailed: false });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('should insert quotes for all links on the same line when standalone', async () => {
    mockGetCursor.mockReturnValue({ line: 0, ch: 10 });
    mockLastLine.mockReturnValue(0);
    mockGetLine.mockReturnValue(
      'jwlibrary:///finder?bible=43003016 jwlibrary:///finder?bible=40005003',
    );

    (BibleTextFetcher.fetchBibleText as Mock)
      .mockResolvedValueOnce({
        success: true,
        text: 'For God loved the world so much that he gave his only-begotten Son.',
      })
      .mockResolvedValueOnce({
        success: true,
        text: 'Happy are those conscious of their spiritual need.',
      });

    (convertBibleTextToMarkdownLink as Mock)
      .mockReturnValueOnce('[John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)')
      .mockReturnValueOnce('[Matt. 5:3](jwlibrary:///finder?bible=40005003&wtlocale=E)');

    const result = await insertBibleQuoteAtCursor(mockEditor, settings, provider);

    expect(result).toEqual({ inserted: true, alreadyExists: false, fetchFailed: false });
    expect(mockTransaction).toHaveBeenCalledWith({
      changes: [
        {
          from: { line: 0, ch: 0 },
          to: {
            line: 0,
            ch: 'jwlibrary:///finder?bible=43003016 jwlibrary:///finder?bible=40005003'.length,
          },
          text:
            '[John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)\n' +
            '> For God loved the world so much that he gave his only-begotten Son.\n\n' +
            '[Matt. 5:3](jwlibrary:///finder?bible=40005003&wtlocale=E)\n' +
            '> Happy are those conscious of their spiritual need.',
        },
      ],
    });
  });

  test('should append quote below when link is embedded in surrounding text', async () => {
    const lineText =
      'Jehova befähigt uns ([Jer. 1:8-9](jwlibrary:///finder?bible=24001008-24001009&wtlocale=X); w10 15. 1. 9 Abs. 7-8)';
    mockGetCursor.mockReturnValue({ line: 0, ch: 25 });
    mockLastLine.mockReturnValue(0);
    mockGetLine.mockReturnValue(lineText);

    (BibleTextFetcher.fetchBibleText as Mock).mockResolvedValueOnce({
      success: true,
      text: 'Have no fear because of their appearance, for I am with you to save you.',
    });

    (convertBibleTextToMarkdownLink as Mock).mockReturnValueOnce(
      '[Jer. 1:8-9](jwlibrary:///finder?bible=24001008-24001009&wtlocale=X)',
    );

    const result = await insertBibleQuoteAtCursor(mockEditor, settings, provider);

    expect(result).toEqual({ inserted: true, alreadyExists: false, fetchFailed: false });
    expect(mockTransaction).toHaveBeenCalledWith({
      changes: [
        {
          from: { line: 0, ch: lineText.length },
          to: { line: 0, ch: lineText.length },
          text:
            '\n\n[Jer. 1:8-9](jwlibrary:///finder?bible=24001008-24001009&wtlocale=X)\n' +
            '> Have no fear because of their appearance, for I am with you to save you.',
        },
      ],
    });
  });

  test('should replace line when link is the only content (standalone)', async () => {
    const lineText = '[John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)';
    mockGetCursor.mockReturnValue({ line: 0, ch: 10 });
    mockLastLine.mockReturnValue(0);
    mockGetLine.mockReturnValue(lineText);

    const result = await insertBibleQuoteAtCursor(mockEditor, settings, provider);

    expect(result).toEqual({ inserted: true, alreadyExists: false, fetchFailed: false });
    expect(mockTransaction).toHaveBeenCalledWith({
      changes: [
        {
          from: { line: 0, ch: 0 },
          to: { line: 0, ch: lineText.length },
          text:
            '[John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)\n' +
            '> For God loved the world so much that he gave his only-begotten Son.',
        },
      ],
    });
  });

  test('should append quote below when link has prefix text', async () => {
    const lineText =
      'See this reference: [John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)';
    mockGetCursor.mockReturnValue({ line: 0, ch: 25 });
    mockLastLine.mockReturnValue(0);
    mockGetLine.mockReturnValue(lineText);

    const result = await insertBibleQuoteAtCursor(mockEditor, settings, provider);

    expect(result).toEqual({ inserted: true, alreadyExists: false, fetchFailed: false });
    expect(mockTransaction).toHaveBeenCalledWith({
      changes: [
        {
          from: { line: 0, ch: lineText.length },
          to: { line: 0, ch: lineText.length },
          text:
            '\n\n[John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)\n' +
            '> For God loved the world so much that he gave his only-begotten Son.',
        },
      ],
    });
  });

  test('should fall back to the previous line when the cursor line has no link', async () => {
    mockGetCursor.mockReturnValue({ line: 1, ch: 0 });
    mockLastLine.mockReturnValue(1);
    const lines = ['[Matt. 24:14](jwlibrary:///finder?bible=40024014&wtlocale=E)', ''];
    mockGetLine.mockImplementation((line: number) => lines[line]);

    (BibleTextFetcher.fetchBibleText as Mock).mockResolvedValueOnce({
      success: true,
      text: 'And this good news of the Kingdom will be preached in all the inhabited earth.',
    });

    (convertBibleTextToMarkdownLink as Mock).mockReturnValueOnce(
      '[Matt. 24:14](jwlibrary:///finder?bible=40024014&wtlocale=E)',
    );

    const result = await insertBibleQuoteAtCursor(mockEditor, settings, provider);

    expect(result).toEqual({ inserted: true, alreadyExists: false, fetchFailed: false });
    expect(mockTransaction).toHaveBeenCalledWith({
      changes: [
        {
          from: { line: 0, ch: 0 },
          to: {
            line: 0,
            ch: '[Matt. 24:14](jwlibrary:///finder?bible=40024014&wtlocale=E)'.length,
          },
          text:
            '[Matt. 24:14](jwlibrary:///finder?bible=40024014&wtlocale=E)\n' +
            '> And this good news of the Kingdom will be preached in all the inhabited earth.',
        },
      ],
    });
  });
});
