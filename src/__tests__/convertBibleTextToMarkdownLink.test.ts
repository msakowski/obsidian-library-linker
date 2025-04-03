import { TEST_DEFAULT_SETTINGS } from '@/__tests__/mocks';
import { convertBibleTextToMarkdownLink } from '@/utils/convertBibleTextToMarkdownLink';

describe('convertBibleTextToMarkdownLink', () => {
  describe('with long format', () => {
    test('converts single verse to markdown link', () => {
      expect(
        convertBibleTextToMarkdownLink(
          {
            book: 43,
            chapter: 3,
            verseRanges: [{ start: 16, end: 16 }],
          },
          {
            ...TEST_DEFAULT_SETTINGS,
            bookLength: 'long',
          },
        ),
      ).toBe('[John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)');
      expect(
        convertBibleTextToMarkdownLink(
          {
            book: 19,
            chapter: 23,
            verseRanges: [{ start: 1, end: 1 }],
          },
          {
            ...TEST_DEFAULT_SETTINGS,
            bookLength: 'long',
            language: 'X',
          },
        ),
      ).toBe('[Psalm 23:1](jwlibrary:///finder?bible=19023001&wtlocale=X)');
      expect(
        convertBibleTextToMarkdownLink(
          {
            book: 19,
            chapter: 23,
            verseRanges: [{ start: 1, end: 1 }],
          },
          {
            ...TEST_DEFAULT_SETTINGS,
            bookLength: 'long',
            language: 'X',
            noLanguageParameter: true,
          },
        ),
      ).toBe('[Psalm 23:1](jwlibrary:///finder?bible=19023001)');
    });

    test('converts verse range to markdown link', () => {
      expect(
        convertBibleTextToMarkdownLink(
          {
            book: 19,
            chapter: 23,
            verseRanges: [{ start: 1, end: 3 }],
          },
          {
            ...TEST_DEFAULT_SETTINGS,
            bookLength: 'long',
            language: 'X',
          },
        ),
      ).toBe('[Psalm 23:1-3](jwlibrary:///finder?bible=19023001-19023003&wtlocale=X)');
      expect(
        convertBibleTextToMarkdownLink(
          {
            book: 66,
            chapter: 21,
            verseRanges: [{ start: 3, end: 4 }],
          },
          {
            ...TEST_DEFAULT_SETTINGS,
            bookLength: 'long',
            language: 'X',
          },
        ),
      ).toBe('[Offenbarung 21:3-4](jwlibrary:///finder?bible=66021003-66021004&wtlocale=X)');
    });

    test('converts complex verse reference to multiple markdown links', () => {
      expect(
        convertBibleTextToMarkdownLink(
          {
            book: 43,
            chapter: 1,
            verseRanges: [
              { start: 1, end: 2 },
              { start: 4, end: 4 },
              { start: 6, end: 8 },
              { start: 12, end: 14 },
            ],
          },
          {
            ...TEST_DEFAULT_SETTINGS,
            bookLength: 'long',
          },
        ),
      ).toBe(
        '[John 1:1-2](jwlibrary:///finder?bible=43001001-43001002&wtlocale=E),' +
          '[4](jwlibrary:///finder?bible=43001004&wtlocale=E),' +
          '[6-8](jwlibrary:///finder?bible=43001006-43001008&wtlocale=E),' +
          '[12-14](jwlibrary:///finder?bible=43001012-43001014&wtlocale=E)',
      );
      expect(
        convertBibleTextToMarkdownLink(
          {
            book: 1,
            chapter: 3,
            verseRanges: [
              { start: 1, end: 5 },
              { start: 7, end: 7 },
              { start: 9, end: 9 },
            ],
          },
          {
            ...TEST_DEFAULT_SETTINGS,
            bookLength: 'long',
            language: 'X',
          },
        ),
      ).toBe(
        '[1. Mose 3:1-5](jwlibrary:///finder?bible=01003001-01003005&wtlocale=X),' +
          '[7](jwlibrary:///finder?bible=01003007&wtlocale=X),' +
          '[9](jwlibrary:///finder?bible=01003009&wtlocale=X)',
      );
    });
  });

  describe('with short format', () => {
    test('converts single verse to markdown link', () => {
      expect(
        convertBibleTextToMarkdownLink(
          {
            book: 43,
            chapter: 3,
            verseRanges: [{ start: 16, end: 16 }],
          },
          TEST_DEFAULT_SETTINGS,
        ),
      ).toBe('[Joh 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)');
      expect(
        convertBibleTextToMarkdownLink(
          {
            book: 19,
            chapter: 23,
            verseRanges: [{ start: 1, end: 1 }],
          },
          {
            ...TEST_DEFAULT_SETTINGS,
            language: 'X',
          },
        ),
      ).toBe('[Ps 23:1](jwlibrary:///finder?bible=19023001&wtlocale=X)');
    });

    test('converts verse range to markdown link', () => {
      expect(
        convertBibleTextToMarkdownLink(
          {
            book: 19,
            chapter: 23,
            verseRanges: [{ start: 1, end: 3 }],
          },
          {
            ...TEST_DEFAULT_SETTINGS,
            language: 'X',
          },
        ),
      ).toBe('[Ps 23:1-3](jwlibrary:///finder?bible=19023001-19023003&wtlocale=X)');
      expect(
        convertBibleTextToMarkdownLink(
          {
            book: 66,
            chapter: 21,
            verseRanges: [{ start: 3, end: 4 }],
          },
          {
            ...TEST_DEFAULT_SETTINGS,
            language: 'X',
          },
        ),
      ).toBe('[Off 21:3-4](jwlibrary:///finder?bible=66021003-66021004&wtlocale=X)');
    });

    test('converts complex verse reference to multiple markdown links', () => {
      expect(
        convertBibleTextToMarkdownLink(
          {
            book: 43,
            chapter: 1,
            verseRanges: [
              { start: 1, end: 2 },
              { start: 4, end: 4 },
              { start: 6, end: 8 },
              { start: 12, end: 14 },
            ],
          },
          TEST_DEFAULT_SETTINGS,
        ),
      ).toBe(
        '[Joh 1:1-2](jwlibrary:///finder?bible=43001001-43001002&wtlocale=E),' +
          '[4](jwlibrary:///finder?bible=43001004&wtlocale=E),' +
          '[6-8](jwlibrary:///finder?bible=43001006-43001008&wtlocale=E),' +
          '[12-14](jwlibrary:///finder?bible=43001012-43001014&wtlocale=E)',
      );
      expect(
        convertBibleTextToMarkdownLink(
          {
            book: 1,
            chapter: 3,
            verseRanges: [
              { start: 1, end: 5 },
              { start: 7, end: 7 },
              { start: 9, end: 9 },
            ],
          },
          {
            ...TEST_DEFAULT_SETTINGS,
            language: 'X',
          },
        ),
      ).toBe(
        '[1Mo 3:1-5](jwlibrary:///finder?bible=01003001-01003005&wtlocale=X),' +
          '[7](jwlibrary:///finder?bible=01003007&wtlocale=X),' +
          '[9](jwlibrary:///finder?bible=01003009&wtlocale=X)',
      );
    });
  });

  test('throws error on invalid reference', () => {
    expect(() =>
      convertBibleTextToMarkdownLink(
        {
          book: 70,
          chapter: 200,
          verseRanges: [{ start: 1, end: 1 }],
        },
        TEST_DEFAULT_SETTINGS,
      ),
    ).toThrow('errors.bookNotFound');
  });
});
