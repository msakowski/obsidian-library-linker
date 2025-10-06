import { insertAllBibleQuotes, insertBibleQuoteAtCursor } from '@/utils/insertBibleQuotes';
import { BibleTextFetcher } from '@/services/BibleTextFetcher';
import { convertBibleTextToMarkdownLink } from '@/utils/convertBibleTextToMarkdownLink';
import type { LinkReplacerSettings } from '@/types';
import { TEST_DEFAULT_SETTINGS } from 'mocks/plugin';
import type { Editor } from 'obsidian';

// Mock dependencies
jest.mock('@/services/BibleTextFetcher');
jest.mock('@/utils/convertBibleTextToMarkdownLink');

// Mock findJWLibraryLinks but keep parseJWLibraryLink real
jest.mock('@/utils/findJWLibraryLinks', () => ({
  ...jest.requireActual<typeof import('@/utils/findJWLibraryLinks')>('@/utils/findJWLibraryLinks'),
  findJWLibraryLinks: jest.fn(),
}));

import { findJWLibraryLinks } from '@/utils/findJWLibraryLinks';

describe('insertAllBibleQuotes', () => {
  let mockEditor: jest.Mocked<Editor>;
  let settings: LinkReplacerSettings;
  let mockGetLine: jest.Mock;
  let mockLastLine: jest.Mock;
  let mockTransaction: jest.Mock;

  beforeEach(() => {
    mockGetLine = jest.fn();
    mockLastLine = jest.fn();
    mockTransaction = jest.fn();

    mockEditor = {
      getLine: mockGetLine,
      lastLine: mockLastLine,
      transaction: mockTransaction,
    } as unknown as jest.Mocked<Editor>;

    settings = {
      ...TEST_DEFAULT_SETTINGS,
      bibleQuote: {
        format: 'short',
        calloutType: 'quote',
      },
    };

    // Mock BibleTextFetcher
    (BibleTextFetcher.fetchBibleText as jest.Mock).mockResolvedValue({
      success: true,
      text: 'For God loved the world so much that he gave his only-begotten Son.',
    });

    // Mock convertBibleTextToMarkdownLink
    (convertBibleTextToMarkdownLink as jest.Mock).mockReturnValue(
      '[John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)',
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should insert Bible quote for single link', async () => {
    mockLastLine.mockReturnValue(0);
    mockGetLine.mockReturnValue('jwlibrary:///finder?bible=43003016');

    (findJWLibraryLinks as jest.Mock).mockReturnValue([
      {
        url: 'jwlibrary:///finder?bible=43003016',
        reference: { book: 43, chapter: 3, verseRanges: [{ start: 16, end: 16 }] },
        lineNumber: 0,
        lineText: 'jwlibrary:///finder?bible=43003016',
      },
    ]);

    const count = await insertAllBibleQuotes(mockEditor, settings);

    expect(count).toBe(1);
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
    settings.bibleQuote.format = 'long-foldable';
    settings.bibleQuote.calloutType = 'info';

    mockLastLine.mockReturnValue(0);
    mockGetLine.mockReturnValue('jwlibrary:///finder?bible=43003016');

    (findJWLibraryLinks as jest.Mock).mockReturnValue([
      {
        url: 'jwlibrary:///finder?bible=43003016',
        reference: { book: 43, chapter: 3, verseRanges: [{ start: 16, end: 16 }] },
        lineNumber: 0,
        lineText: 'jwlibrary:///finder?bible=43003016',
      },
    ]);

    await insertAllBibleQuotes(mockEditor, settings);

    expect(mockTransaction).toHaveBeenCalledWith({
      changes: [
        {
          from: { line: 0, ch: 0 },
          to: { line: 0, ch: 'jwlibrary:///finder?bible=43003016'.length },
          text: '> [!info]- [John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)\n> For God loved the world so much that he gave his only-begotten Son.',
        },
      ],
    });
  });

  test('should format quote as long-expanded callout', async () => {
    settings.bibleQuote.format = 'long-expanded';

    mockLastLine.mockReturnValue(0);
    mockGetLine.mockReturnValue('jwlibrary:///finder?bible=43003016');

    (findJWLibraryLinks as jest.Mock).mockReturnValue([
      {
        url: 'jwlibrary:///finder?bible=43003016',
        reference: { book: 43, chapter: 3, verseRanges: [{ start: 16, end: 16 }] },
        lineNumber: 0,
        lineText: 'jwlibrary:///finder?bible=43003016',
      },
    ]);

    await insertAllBibleQuotes(mockEditor, settings);

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

    (findJWLibraryLinks as jest.Mock).mockReturnValue([
      {
        url: 'jwlibrary:///finder?bible=43003016',
        reference: { book: 43, chapter: 3, verseRanges: [{ start: 16, end: 16 }] },
        lineNumber: 0,
        lineText: '> [!quote] [John 3:16](jwlibrary:///finder?bible=43003016)',
      },
    ]);

    const count = await insertAllBibleQuotes(mockEditor, settings);

    expect(count).toBe(0);
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

    (findJWLibraryLinks as jest.Mock).mockReturnValue([
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

    (convertBibleTextToMarkdownLink as jest.Mock)
      .mockReturnValueOnce('[John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)')
      .mockReturnValueOnce('[Matt. 5:3](jwlibrary:///finder?bible=40005003&wtlocale=E)');

    const count = await insertAllBibleQuotes(mockEditor, settings);

    expect(count).toBe(2);
    expect(mockTransaction).toHaveBeenCalledTimes(1);
  });

  test('should return 0 when no links found', async () => {
    mockLastLine.mockReturnValue(0);
    mockGetLine.mockReturnValue('No links here');

    (findJWLibraryLinks as jest.Mock).mockReturnValue([]);

    const count = await insertAllBibleQuotes(mockEditor, settings);

    expect(count).toBe(0);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('should handle fetch failure gracefully', async () => {
    mockLastLine.mockReturnValue(0);
    mockGetLine.mockReturnValue('jwlibrary:///finder?bible=43003016');

    (findJWLibraryLinks as jest.Mock).mockReturnValue([
      {
        url: 'jwlibrary:///finder?bible=43003016',
        reference: { book: 43, chapter: 3, verseRanges: [{ start: 16, end: 16 }] },
        lineNumber: 0,
        lineText: 'jwlibrary:///finder?bible=43003016',
      },
    ]);

    (BibleTextFetcher.fetchBibleText as jest.Mock).mockResolvedValue({
      success: false,
      text: null,
    });

    const count = await insertAllBibleQuotes(mockEditor, settings);

    expect(count).toBe(0);
    expect(mockTransaction).not.toHaveBeenCalled();
  });
});

describe('insertBibleQuoteAtCursor', () => {
  let mockEditor: jest.Mocked<Editor>;
  let settings: LinkReplacerSettings;
  let mockGetCursor: jest.Mock;
  let mockGetLine: jest.Mock;
  let mockLastLine: jest.Mock;
  let mockTransaction: jest.Mock;

  beforeEach(() => {
    mockGetCursor = jest.fn();
    mockGetLine = jest.fn();
    mockLastLine = jest.fn();
    mockTransaction = jest.fn();

    mockEditor = {
      getCursor: mockGetCursor,
      getLine: mockGetLine,
      lastLine: mockLastLine,
      transaction: mockTransaction,
    } as unknown as jest.Mocked<Editor>;

    settings = {
      ...TEST_DEFAULT_SETTINGS,
      bibleQuote: {
        format: 'short',
        calloutType: 'quote',
      },
    };

    (BibleTextFetcher.fetchBibleText as jest.Mock).mockResolvedValue({
      success: true,
      text: 'For God loved the world so much that he gave his only-begotten Son.',
    });

    (convertBibleTextToMarkdownLink as jest.Mock).mockReturnValue(
      '[John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)',
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should insert quote at cursor line', async () => {
    mockGetCursor.mockReturnValue({ line: 0, ch: 10 });
    mockLastLine.mockReturnValue(0);
    mockGetLine.mockReturnValue('jwlibrary:///finder?bible=43003016');

    const result = await insertBibleQuoteAtCursor(mockEditor, settings);

    expect(result).toEqual({ inserted: true, alreadyExists: false });
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

    const result = await insertBibleQuoteAtCursor(mockEditor, settings);

    expect(result).toEqual({ inserted: false, alreadyExists: true });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('should return false when no link at cursor', async () => {
    mockGetCursor.mockReturnValue({ line: 0, ch: 10 });
    mockLastLine.mockReturnValue(0);
    mockGetLine.mockReturnValue('No link here');

    const result = await insertBibleQuoteAtCursor(mockEditor, settings);

    expect(result).toEqual({ inserted: false, alreadyExists: false });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('should handle cursor beyond last line', async () => {
    mockGetCursor.mockReturnValue({ line: 10, ch: 0 });
    mockLastLine.mockReturnValue(5);

    const result = await insertBibleQuoteAtCursor(mockEditor, settings);

    expect(result).toEqual({ inserted: false, alreadyExists: false });
    expect(mockTransaction).not.toHaveBeenCalled();
  });
});
