import { parseBibleReference, extractBibleReferenceFromMatch } from '@/utils/parseBibleReference';
import type { Language } from '@/types';
import { initializeTestBibleBooks } from './__helpers__/initializeBibleBooksForTests';
import { LANGUAGES } from '@/consts/languages';

beforeAll(() => {
  initializeTestBibleBooks(Object.keys(LANGUAGES) as Language[]);
});

describe('parseBibleReference', () => {
  const language: Language = 'X';

  // Test cases for successful parsing
  const successTestCases = [
    {
      description: 'parses simple reference',
      input: 'joh3:16',
      expected: {
        book: 43,
        ranges: [{ chapterStart: 3, verseStart: 16 }],
      },
    },
    {
      description: 'parses reference with space',
      input: 'joh 3:16',
      expected: {
        book: 43,
        ranges: [{ chapterStart: 3, verseStart: 16 }],
      },
    },
    {
      description: 'parses verse range',
      input: 'ps23:1-3',
      expected: {
        book: 19,
        ranges: [{ chapterStart: 23, verseStart: 1, verseEnd: 3 }],
      },
    },
    {
      description: 'parses complex verse reference with multiple ranges',
      input: 'joh1:1,2,4,6,7-8,12-14',
      expected: {
        book: 43,
        ranges: [
          { chapterStart: 1, verseStart: 1, verseEnd: 2 }, // 1,2 becomes a range
          { chapterStart: 1, verseStart: 4 }, // single verse
          { chapterStart: 1, verseStart: 6, verseEnd: 8 }, // 6,7-8 becomes one range
          { chapterStart: 1, verseStart: 12, verseEnd: 14 }, // explicit range
        ],
      },
    },
    {
      description: 'parses complex verse reference with spaces',
      input: 'joh 1:1-2, 4, 6, 7-8, 12-14',
      expected: {
        book: 43,
        ranges: [
          { chapterStart: 1, verseStart: 1, verseEnd: 2 },
          { chapterStart: 1, verseStart: 4 },
          { chapterStart: 1, verseStart: 6, verseEnd: 8 },
          { chapterStart: 1, verseStart: 12, verseEnd: 14 },
        ],
      },
    },
    {
      description: 'parses Vietnamese hyphenated book name',
      input: 'Lê-vi 25:1',
      language: 'VT' as Language,
      expected: {
        book: 3,
        ranges: [{ chapterStart: 25, verseStart: 1 }],
      },
    },
    {
      description: 'parses Vietnamese hyphenated book name with prefix',
      input: '1 Sa-mu-ên 3:1',
      language: 'VT' as Language,
      expected: {
        book: 9,
        ranges: [{ chapterStart: 3, verseStart: 1 }],
      },
    },
    {
      description: 'parses Korean multi-word book name (Revelation)',
      input: '요한 계시록 1:1',
      language: 'KO' as Language,
      expected: {
        book: 66,
        ranges: [{ chapterStart: 1, verseStart: 1 }],
      },
    },
    {
      description: 'parses Korean multi-word book name (1 John)',
      input: '요한 1서 1:1',
      language: 'KO' as Language,
      expected: {
        book: 62,
        ranges: [{ chapterStart: 1, verseStart: 1 }],
      },
    },
    {
      description: 'parses Korean digit-suffixed short name (1 John)',
      input: '요1 1:1',
      language: 'KO' as Language,
      expected: {
        book: 62,
        ranges: [{ chapterStart: 1, verseStart: 1 }],
      },
    },
  ];

  // Run the successful parsing tests
  test.each(successTestCases)('$description', ({ input, expected, language: testLanguage }) => {
    const parseResult = parseBibleReference(input, testLanguage ?? language);
    expect(parseResult).toEqual(expected);
  });

  // Test cases for error handling - ascending order errors
  const ascendingOrderErrorCases = [
    {
      description: 'throws error on mixed out of order verses',
      input: 'joh1:2,1,6,4,8-7,14-12',
    },
    {
      description: 'throws error on simple out of order verses',
      input: 'joh1:1,3,2',
    },
    {
      description: 'throws error on out of order range',
      input: 'joh1:3-1',
    },
    {
      description: 'throws error on range followed by out of order verse',
      input: 'joh1:7-8,6',
    },
    {
      description: 'throws error on repeated verses',
      input: 'joh1:1,1',
    },
    {
      description: 'throws error on self-referencing range',
      input: 'joh1:1-1',
    },
    {
      description: 'throws error on repeated verse in sequence',
      input: 'joh1:1,2,2',
    },
    {
      description: 'throws error on repeated verse in range',
      input: 'joh1:1,1-2',
    },
  ];

  // Run the ascending order error tests
  test.each(ascendingOrderErrorCases)('$description', ({ input }) => {
    expect(() => parseBibleReference(input, language)).toThrow('errors.versesAscendingOrder');
  });

  // Test cases for error handling - formatting errors
  const formatErrorCases = [
    {
      description: 'throws error on empty verse parts',
      input: 'joh1:1,,2',
      errorMessage: 'errors.invalidVerseFormat',
    },
    {
      description: 'throws error on multiple hyphens',
      input: 'joh1:1-2-3',
      errorMessage: 'errors.invalidVerseFormat',
    },
    {
      description: 'throws error on hyphen followed by nothing',
      input: 'joh1:1,-2',
      errorMessage: 'errors.invalidVerseFormat',
    },
    {
      description: 'throws error on invalid book',
      input: 'xyz1:1',
      errorMessage: 'errors.bookNotFound',
    },
    {
      description: 'throws error on invalid format',
      input: 'joh:1',
      errorMessage: 'errors.invalidFormat',
    },
  ];

  // Run the format error tests
  test.each(formatErrorCases)('$description', ({ input, errorMessage }) => {
    expect(() => parseBibleReference(input, language)).toThrow(errorMessage);
  });

  describe('rejects non-Bible-book words that match the regex pattern', () => {
    const falsePositiveCases = [
      { input: 'video12:34', description: 'timestamp-like pattern' },
      { input: 'runtime3:45', description: 'duration-like pattern' },
      { input: 'port8:80', description: 'technical notation' },
      { input: 'section4:2', description: 'section reference' },
      { input: 'page3:14', description: 'page reference' },
      { input: 'step2:5', description: 'step reference' },
      { input: 'release2:0', description: 'version-like pattern' },
      { input: 'build12:1', description: 'build number' },
      { input: 'item1:3', description: 'item reference' },
      { input: 'chapter10:2', description: 'chapter reference without book' },
    ];

    test.each(falsePositiveCases)('rejects $description ($input)', ({ input }) => {
      expect(() => parseBibleReference(input, language)).toThrow('errors.bookNotFound');
    });
  });

  test('throws error on out-of-range chapter', () => {
    expect(() => parseBibleReference('joh0:1', 'E')).toThrow('errors.invalidChapter');
    expect(() => parseBibleReference('joh100:1', 'E')).toThrow('errors.invalidChapter');
    expect(() => parseBibleReference('ps 200:1', 'FI')).toThrow('errors.invalidChapter');
  });

  // Multi-chapter reference tests
  describe('multi-chapter references', () => {
    test('parses simple multi-chapter reference', () => {
      const result = parseBibleReference('matt3:1-4:11', 'E');
      expect(result).toEqual({
        book: 40, // Matthew
        ranges: [{ chapterStart: 3, chapterEnd: 4, verseStart: 1, verseEnd: 11 }],
      });
    });

    test('parses multi-chapter reference with spaces', () => {
      const result = parseBibleReference('Matt 3:1-4:11', 'E');
      expect(result).toEqual({
        book: 40,
        ranges: [{ chapterStart: 3, chapterEnd: 4, verseStart: 1, verseEnd: 11 }],
      });
    });

    test('parses multi-chapter reference with punctuation', () => {
      const result = parseBibleReference('Matt. 3:1-4:11', 'E');
      expect(result).toEqual({
        book: 40,
        ranges: [{ chapterStart: 3, chapterEnd: 4, verseStart: 1, verseEnd: 11 }],
      });
    });

    test('parses multi-chapter reference in German', () => {
      const result = parseBibleReference('1mo1:1-2:3', 'X');
      expect(result).toEqual({
        book: 1, // Genesis
        ranges: [{ chapterStart: 1, chapterEnd: 2, verseStart: 1, verseEnd: 3 }],
      });
    });

    test('throws error on chapters in descending order', () => {
      expect(() => parseBibleReference('matt4:1-3:11', 'E')).toThrow(
        'errors.chaptersAscendingOrder',
      );
    });

    test('throws error on same start and end chapter', () => {
      expect(() => parseBibleReference('matt3:1-3:11', 'E')).toThrow(
        'errors.chaptersAscendingOrder',
      );
    });

    test('throws error on multi-chapter with invalid end chapter', () => {
      expect(() => parseBibleReference('joh3:1-100:5', 'E')).toThrow('errors.invalidChapter');
    });
  });

  // Test cases for single-chapter books
  describe('single-chapter books', () => {
    const singleChapterTestCases = [
      {
        description: 'parses Obadiah without colon',
        input: 'Obadiah 1',
        expected: {
          book: 31,
          ranges: [{ chapterStart: 1, verseStart: 1 }],
        },
      },
      {
        description: 'parses Philemon without colon',
        input: 'Philemon 5',
        expected: {
          book: 57,
          ranges: [{ chapterStart: 1, verseStart: 5 }],
        },
      },
      {
        description: 'parses 2 John without colon',
        input: '2 John 1',
        expected: {
          book: 63,
          ranges: [{ chapterStart: 1, verseStart: 1 }],
        },
      },
      {
        description: 'parses 3 John without colon',
        input: '3 John 14',
        expected: {
          book: 64,
          ranges: [{ chapterStart: 1, verseStart: 14 }],
        },
      },
      {
        description: 'parses Jude without colon',
        input: 'Jude 3',
        expected: {
          book: 65,
          ranges: [{ chapterStart: 1, verseStart: 3 }],
        },
      },
      {
        description: 'parses Jude verse range without colon',
        input: 'Jude 1-5',
        expected: {
          book: 65,
          ranges: [{ chapterStart: 1, verseStart: 1, verseEnd: 5 }],
        },
      },
      {
        description: 'parses Jude complex verses without colon',
        input: 'Jude 1,3,5-7,10',
        expected: {
          book: 65,
          ranges: [
            { chapterStart: 1, verseStart: 1 },
            { chapterStart: 1, verseStart: 3 },
            { chapterStart: 1, verseStart: 5, verseEnd: 7 },
            { chapterStart: 1, verseStart: 10 },
          ],
        },
      },
      {
        description: 'parses Jude with explicit chapter:verse format',
        input: 'Jude 1:3',
        expected: {
          book: 65,
          ranges: [{ chapterStart: 1, verseStart: 3 }],
        },
      },
      {
        description: 'parses Philemon with explicit chapter:verse format',
        input: 'Philemon 1:1',
        expected: {
          book: 57,
          ranges: [{ chapterStart: 1, verseStart: 1 }],
        },
      },
    ];

    test.each(singleChapterTestCases)('$description', ({ input, expected }) => {
      const parseResult = parseBibleReference(input, 'E');
      expect(parseResult).toEqual(expected);
    });

    test('throws error when multi-chapter book uses verse-only format', () => {
      // John has 21 chapters, so "John 3" without colon should fail
      expect(() => parseBibleReference('John 3', 'E')).toThrow('errors.invalidFormat');
      expect(() => parseBibleReference('Psalm 23', 'E')).toThrow('errors.invalidFormat');
    });
  });

  describe('hyphenated book names (Vietnamese)', () => {
    test('parses Vietnamese book name with hyphens', () => {
      expect(parseBibleReference('Lê-vi 1:1', 'VT')).toEqual({
        book: 3,
        ranges: [{ chapterStart: 1, verseStart: 1 }],
      });
    });

    test('parses Vietnamese book name with multiple hyphens', () => {
      expect(parseBibleReference('Nê-hê-mi 1:1', 'VT')).toEqual({
        book: 16,
        ranges: [{ chapterStart: 1, verseStart: 1 }],
      });
    });

    test('parses Vietnamese book with hyphens and verse range', () => {
      expect(parseBibleReference('Đa-ni-ên 3:1-5', 'VT')).toEqual({
        book: 27,
        ranges: [{ chapterStart: 3, verseStart: 1, verseEnd: 5 }],
      });
    });

    test('parses Vietnamese book with prefix, spaces, and hyphens', () => {
      expect(parseBibleReference('1 Sa-mu-ên 1:1', 'VT')).toEqual({
        book: 9,
        ranges: [{ chapterStart: 1, verseStart: 1 }],
      });
    });
  });

  describe('multi-word book names (Korean)', () => {
    test('parses Korean book name with spaces', () => {
      expect(parseBibleReference('고린도 전서 1:1', 'KO')).toEqual({
        book: 46,
        ranges: [{ chapterStart: 1, verseStart: 1 }],
      });
    });

    test('parses Korean long book name with spaces', () => {
      expect(parseBibleReference('요한 계시록 1:1', 'KO')).toEqual({
        book: 66,
        ranges: [{ chapterStart: 1, verseStart: 1 }],
      });
    });

    test('parses Korean multi-word book with verse range', () => {
      expect(parseBibleReference('디모데 전서 3:1-5', 'KO')).toEqual({
        book: 54,
        ranges: [{ chapterStart: 3, verseStart: 1, verseEnd: 5 }],
      });
    });
  });

  describe('extractBibleReferenceFromMatch', () => {
    test('extracts reference from match with leading words', () => {
      const result = extractBibleReferenceFromMatch('Some text before John 3:16', 'E');
      expect(result).not.toBeNull();
      expect(result!.text).toBe('John 3:16');
      expect(result!.offset).toBe(17);
      expect(result!.reference.book).toBe(43);
    });

    test('extracts reference when match is exact', () => {
      const result = extractBibleReferenceFromMatch('John 3:16', 'E');
      expect(result).not.toBeNull();
      expect(result!.text).toBe('John 3:16');
      expect(result!.offset).toBe(0);
    });

    test('extracts Korean multi-word reference from match', () => {
      const result = extractBibleReferenceFromMatch('요한 계시록 1:1', 'KO');
      expect(result).not.toBeNull();
      expect(result!.reference.book).toBe(66);
    });

    test('extracts Vietnamese hyphenated reference from match', () => {
      const result = extractBibleReferenceFromMatch('Lê-vi 1:1', 'VT');
      expect(result).not.toBeNull();
      expect(result!.reference.book).toBe(3);
    });

    test('returns null for invalid reference', () => {
      const result = extractBibleReferenceFromMatch('not a reference', 'E');
      expect(result).toBeNull();
    });
  });
});
