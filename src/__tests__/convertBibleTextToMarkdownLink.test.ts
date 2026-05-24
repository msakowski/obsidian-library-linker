import { convertBibleTextToMarkdownLink } from '@/utils/convertBibleTextToMarkdownLink';
import { initializeTestBibleBooks } from './__helpers__/initializeBibleBooksForTests';
import { createSettings } from './__helpers__/createSettings';

beforeAll(() => {
  initializeTestBibleBooks();
});

describe('convertBibleTextToMarkdownLink', () => {
  describe('with long format', () => {
    test('converts single verse to markdown link', () => {
      expect(
        convertBibleTextToMarkdownLink(
          {
            book: 43,
            ranges: [{ chapterStart: 3, verseStart: 16 }],
          },
          createSettings({
            bookLength: 'long',
          }),
        ),
      ).toBe('[John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)');
      expect(
        convertBibleTextToMarkdownLink(
          {
            book: 19,
            ranges: [{ chapterStart: 23, verseStart: 1 }],
          },
          createSettings({
            bookLength: 'long',
            language: 'X',
          }),
        ),
      ).toBe('[Psalm 23:1](jwlibrary:///finder?bible=19023001&wtlocale=X)');
      expect(
        convertBibleTextToMarkdownLink(
          {
            book: 19,
            ranges: [{ chapterStart: 23, verseStart: 1 }],
          },
          createSettings({
            bookLength: 'long',
            language: 'X',
            noLanguageParameter: true,
          }),
        ),
      ).toBe('[Psalm 23:1](jwlibrary:///finder?bible=19023001)');
    });

    test('converts verse range to markdown link', () => {
      expect(
        convertBibleTextToMarkdownLink(
          {
            book: 19,
            ranges: [{ chapterStart: 23, verseStart: 1, verseEnd: 3 }],
          },
          createSettings({
            bookLength: 'long',
            language: 'X',
          }),
        ),
      ).toBe('[Psalm 23:1-3](jwlibrary:///finder?bible=19023001-19023003&wtlocale=X)');
      expect(
        convertBibleTextToMarkdownLink(
          {
            book: 66,
            ranges: [{ chapterStart: 21, verseStart: 3, verseEnd: 4 }],
          },
          createSettings({
            bookLength: 'long',
            language: 'X',
          }),
        ),
      ).toBe('[Offenbarung 21:3-4](jwlibrary:///finder?bible=66021003-66021004&wtlocale=X)');
    });

    test('converts complex verse reference to multiple markdown links', () => {
      expect(
        convertBibleTextToMarkdownLink(
          {
            book: 43,
            ranges: [
              { chapterStart: 1, verseStart: 1, verseEnd: 2 },
              { chapterStart: 1, verseStart: 4 },
              { chapterStart: 1, verseStart: 6, verseEnd: 8 },
              { chapterStart: 1, verseStart: 12, verseEnd: 14 },
            ],
          },
          createSettings({
            bookLength: 'long',
          }),
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
            ranges: [
              { chapterStart: 3, verseStart: 1, verseEnd: 5 },
              { chapterStart: 3, verseStart: 7 },
              { chapterStart: 3, verseStart: 9 },
            ],
          },
          createSettings({
            bookLength: 'long',
            language: 'X',
          }),
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
            ranges: [{ chapterStart: 3, verseStart: 16 }],
          },
          createSettings(),
        ),
      ).toBe('[Joh 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)');
      expect(
        convertBibleTextToMarkdownLink(
          {
            book: 19,
            ranges: [{ chapterStart: 23, verseStart: 1 }],
          },
          createSettings({
            language: 'X',
          }),
        ),
      ).toBe('[Ps 23:1](jwlibrary:///finder?bible=19023001&wtlocale=X)');
    });

    test('converts verse range to markdown link', () => {
      expect(
        convertBibleTextToMarkdownLink(
          {
            book: 19,
            ranges: [{ chapterStart: 23, verseStart: 1, verseEnd: 3 }],
          },
          createSettings({
            language: 'X',
          }),
        ),
      ).toBe('[Ps 23:1-3](jwlibrary:///finder?bible=19023001-19023003&wtlocale=X)');
      expect(
        convertBibleTextToMarkdownLink(
          {
            book: 66,
            ranges: [{ chapterStart: 21, verseStart: 3, verseEnd: 4 }],
          },
          createSettings({
            language: 'X',
          }),
        ),
      ).toBe('[Off 21:3-4](jwlibrary:///finder?bible=66021003-66021004&wtlocale=X)');
    });

    test('converts complex verse reference to multiple markdown links', () => {
      expect(
        convertBibleTextToMarkdownLink(
          {
            book: 43,
            ranges: [
              { chapterStart: 1, verseStart: 1, verseEnd: 2 },
              { chapterStart: 1, verseStart: 4 },
              { chapterStart: 1, verseStart: 6, verseEnd: 8 },
              { chapterStart: 1, verseStart: 12, verseEnd: 14 },
            ],
          },
          createSettings(),
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
            ranges: [
              { chapterStart: 3, verseStart: 1, verseEnd: 5 },
              { chapterStart: 3, verseStart: 7 },
              { chapterStart: 3, verseStart: 9 },
            ],
          },
          createSettings({
            language: 'X',
          }),
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
          ranges: [{ chapterStart: 200, verseStart: 1 }],
        },
        createSettings(),
      ),
    ).toThrow('errors.bookNotFound');
  });
});
