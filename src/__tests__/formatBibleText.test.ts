import { formatBibleText } from '@/utils/formatBibleText';
import { initializeTestBibleBooks } from './__helpers__/initializeBibleBooksForTests';

beforeAll(() => {
  initializeTestBibleBooks();
});

describe('formatBibleText', () => {
  describe('with long format', () => {
    test('formats single verse', () => {
      expect(
        formatBibleText({ book: 43, ranges: [{ chapterStart: 3, verseStart: 16 }] }, 'long', 'X'),
      ).toBe('Johannes 3:16');
      expect(
        formatBibleText({ book: 19, ranges: [{ chapterStart: 23, verseStart: 1 }] }, 'long', 'X'),
      ).toBe('Psalm 23:1');
    });

    test('formats verse range', () => {
      expect(
        formatBibleText(
          { book: 19, ranges: [{ chapterStart: 23, verseStart: 1, verseEnd: 3 }] },
          'long',
          'X',
        ),
      ).toBe('Psalm 23:1-3');
      expect(
        formatBibleText(
          { book: 66, ranges: [{ chapterStart: 21, verseStart: 3, verseEnd: 4 }] },
          'long',
          'X',
        ),
      ).toBe('Offenbarung 21:3-4');
    });

    test('handles books with numbers', () => {
      expect(
        formatBibleText({ book: 1, ranges: [{ chapterStart: 1, verseStart: 1 }] }, 'long', 'X'),
      ).toBe('1. Mose 1:1');
      expect(
        formatBibleText({ book: 2, ranges: [{ chapterStart: 3, verseStart: 14 }] }, 'long', 'X'),
      ).toBe('2. Mose 3:14');
      expect(
        formatBibleText({ book: 60, ranges: [{ chapterStart: 1, verseStart: 3 }] }, 'long', 'X'),
      ).toBe('1. Petrus 1:3');
    });
  });

  describe('with short format', () => {
    test('formats single verse', () => {
      expect(
        formatBibleText({ book: 43, ranges: [{ chapterStart: 3, verseStart: 16 }] }, 'short', 'X'),
      ).toBe('Joh 3:16');
      expect(
        formatBibleText({ book: 19, ranges: [{ chapterStart: 23, verseStart: 1 }] }, 'short', 'X'),
      ).toBe('Ps 23:1');
    });

    test('formats verse range', () => {
      expect(
        formatBibleText(
          { book: 19, ranges: [{ chapterStart: 23, verseStart: 1, verseEnd: 3 }] },
          'short',
          'X',
        ),
      ).toBe('Ps 23:1-3');
      expect(
        formatBibleText(
          { book: 66, ranges: [{ chapterStart: 21, verseStart: 3, verseEnd: 4 }] },
          'short',
          'X',
        ),
      ).toBe('Off 21:3-4');
    });

    test('handles books with numbers', () => {
      expect(
        formatBibleText({ book: 1, ranges: [{ chapterStart: 1, verseStart: 1 }] }, 'short', 'X'),
      ).toBe('1Mo 1:1');
      expect(
        formatBibleText({ book: 2, ranges: [{ chapterStart: 3, verseStart: 14 }] }, 'short', 'X'),
      ).toBe('2Mo 3:14');
      expect(
        formatBibleText({ book: 60, ranges: [{ chapterStart: 1, verseStart: 3 }] }, 'short', 'X'),
      ).toBe('1Pe 1:3');
    });
  });

  test('throw error on invalid reference', () => {
    expect(() =>
      formatBibleText({ book: 200, ranges: [{ chapterStart: 1, verseStart: 1 }] }, 'long', 'X'),
    ).toThrow('errors.bookNotFound');
    // TODO: test for verse ranges
    expect(() =>
      formatBibleText({ book: 70, ranges: [{ chapterStart: 100, verseStart: 1 }] }, 'short', 'X'),
    ).toThrow('errors.bookNotFound');
  });

  describe('single-chapter books', () => {
    test('formats Obadiah without chapter number', () => {
      expect(
        formatBibleText({ book: 31, ranges: [{ chapterStart: 1, verseStart: 1 }] }, 'long', 'E'),
      ).toBe('Obadiah 1');
      expect(
        formatBibleText({ book: 31, ranges: [{ chapterStart: 1, verseStart: 1 }] }, 'short', 'E'),
      ).toBe('Ob 1');
    });

    test('formats Philemon without chapter number', () => {
      expect(
        formatBibleText({ book: 57, ranges: [{ chapterStart: 1, verseStart: 5 }] }, 'long', 'E'),
      ).toBe('Philemon 5');
      expect(
        formatBibleText({ book: 57, ranges: [{ chapterStart: 1, verseStart: 5 }] }, 'short', 'E'),
      ).toBe('Phm 5');
    });

    test('formats 2 John without chapter number', () => {
      expect(
        formatBibleText({ book: 63, ranges: [{ chapterStart: 1, verseStart: 1 }] }, 'long', 'E'),
      ).toBe('2 John 1');
      expect(
        formatBibleText({ book: 63, ranges: [{ chapterStart: 1, verseStart: 1 }] }, 'short', 'E'),
      ).toBe('2Jo 1');
    });

    test('formats 3 John without chapter number', () => {
      expect(
        formatBibleText({ book: 64, ranges: [{ chapterStart: 1, verseStart: 14 }] }, 'long', 'E'),
      ).toBe('3 John 14');
      expect(
        formatBibleText({ book: 64, ranges: [{ chapterStart: 1, verseStart: 14 }] }, 'short', 'E'),
      ).toBe('3Jo 14');
    });

    test('formats Jude without chapter number', () => {
      expect(
        formatBibleText({ book: 65, ranges: [{ chapterStart: 1, verseStart: 3 }] }, 'long', 'E'),
      ).toBe('Jude 3');
      expect(
        formatBibleText({ book: 65, ranges: [{ chapterStart: 1, verseStart: 3 }] }, 'short', 'E'),
      ).toBe('Jude 3');
    });

    test('formats Jude verse range without chapter number', () => {
      expect(
        formatBibleText(
          { book: 65, ranges: [{ chapterStart: 1, verseStart: 1, verseEnd: 5 }] },
          'long',
          'E',
        ),
      ).toBe('Jude 1-5');
    });

    test('formats Jude complex verses without chapter number', () => {
      expect(
        formatBibleText(
          {
            book: 65,
            ranges: [
              { chapterStart: 1, verseStart: 1 },
              { chapterStart: 1, verseStart: 3 },
              { chapterStart: 1, verseStart: 5, verseEnd: 7 },
              { chapterStart: 1, verseStart: 10 },
            ],
          },
          'long',
          'E',
        ),
      ).toBe('Jude 1,3,5-7,10');
    });
  });

  describe('multi-chapter references', () => {
    test('formats multi-chapter reference with long format', () => {
      expect(
        formatBibleText(
          {
            book: 40,
            ranges: [{ chapterStart: 3, chapterEnd: 4, verseStart: 1, verseEnd: 11 }],
          },
          'long',
          'X',
        ),
      ).toBe('Matthäus 3:1-4:11');
    });

    test('formats multi-chapter reference with short format', () => {
      expect(
        formatBibleText(
          {
            book: 40,
            ranges: [{ chapterStart: 3, chapterEnd: 4, verseStart: 1, verseEnd: 11 }],
          },
          'short',
          'X',
        ),
      ).toBe('Mat 3:1-4:11');
    });

    test('formats Genesis multi-chapter reference', () => {
      expect(
        formatBibleText(
          {
            book: 1,
            ranges: [{ chapterStart: 1, chapterEnd: 2, verseStart: 1, verseEnd: 3 }],
          },
          'long',
          'E',
        ),
      ).toBe('Genesis 1:1-2:3');
    });

    test('formats John multi-chapter reference', () => {
      expect(
        formatBibleText(
          {
            book: 43,
            ranges: [{ chapterStart: 2, chapterEnd: 3, verseStart: 3, verseEnd: 6 }],
          },
          'short',
          'E',
        ),
      ).toBe('Joh 2:3-3:6');
    });
  });
});
