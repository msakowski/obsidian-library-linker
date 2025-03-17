import { parseBibleReference } from '@/utils/parseBibleReference';
import type { Language } from '@/types';

describe('parseBibleReference', () => {
  const language: Language = 'X';

  // Test cases for successful parsing
  const successTestCases = [
    {
      description: 'parses simple reference',
      input: 'joh3:16',
      expected: {
        book: 43,
        chapter: 3,
        verseRanges: [{ start: 16, end: 16 }],
      },
    },
    {
      description: 'parses reference with space',
      input: 'joh 3:16',
      expected: {
        book: 43,
        chapter: 3,
        verseRanges: [{ start: 16, end: 16 }],
      },
    },
    {
      description: 'parses verse range',
      input: 'ps23:1-3',
      expected: {
        book: 19,
        chapter: 23,
        verseRanges: [{ start: 1, end: 3 }],
      },
    },
    {
      description: 'parses complex verse reference with multiple ranges',
      input: 'joh1:1,2,4,6,7-8,12-14',
      expected: {
        book: 43,
        chapter: 1,
        verseRanges: [
          { start: 1, end: 2 }, // 1,2 becomes a range
          { start: 4, end: 4 }, // single verse
          { start: 6, end: 8 }, // 6,7-8 becomes one range
          { start: 12, end: 14 }, // explicit range
        ],
      },
    },
    {
      description: 'parses complex verse reference with spaces',
      input: 'joh 1:1-2, 4, 6, 7-8, 12-14',
      expected: {
        book: 43,
        chapter: 1,
        verseRanges: [
          { start: 1, end: 2 },
          { start: 4, end: 4 },
          { start: 6, end: 8 },
          { start: 12, end: 14 },
        ],
      },
    },
  ];

  // Run the successful parsing tests
  test.each(successTestCases)('$description', ({ input, expected }) => {
    const parseResult = parseBibleReference(input, language);
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

  test('throws error on out-of-range chapter', () => {
    expect(() => parseBibleReference('joh0:1', 'E')).toThrow('errors.invalidChapter');
    expect(() => parseBibleReference('joh100:1', 'E')).toThrow('errors.invalidChapter');
    expect(() => parseBibleReference('ps 200:1', 'FI')).toThrow('errors.invalidChapter');
  });
});
