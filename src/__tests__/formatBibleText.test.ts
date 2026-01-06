import { formatBibleText } from '@/utils/formatBibleText';
import { initializeTestBibleBooks } from './__helpers__/initializeBibleBooksForTests';

beforeAll(() => {
  initializeTestBibleBooks();
});

describe('formatBibleText', () => {
  describe('with long format', () => {
    test('formats single verse', () => {
      expect(
        formatBibleText(
          { book: 43, chapter: 3, verseRanges: [{ start: 16, end: 16 }] },
          'long',
          'X',
        ),
      ).toBe('Johannes 3:16');
      expect(
        formatBibleText(
          { book: 19, chapter: 23, verseRanges: [{ start: 1, end: 1 }] },
          'long',
          'X',
        ),
      ).toBe('Psalm 23:1');
    });

    test('formats verse range', () => {
      expect(
        formatBibleText(
          { book: 19, chapter: 23, verseRanges: [{ start: 1, end: 3 }] },
          'long',
          'X',
        ),
      ).toBe('Psalm 23:1-3');
      expect(
        formatBibleText(
          { book: 66, chapter: 21, verseRanges: [{ start: 3, end: 4 }] },
          'long',
          'X',
        ),
      ).toBe('Offenbarung 21:3-4');
    });

    test('handles books with numbers', () => {
      expect(
        formatBibleText({ book: 1, chapter: 1, verseRanges: [{ start: 1, end: 1 }] }, 'long', 'X'),
      ).toBe('1. Mose 1:1');
      expect(
        formatBibleText(
          { book: 2, chapter: 3, verseRanges: [{ start: 14, end: 14 }] },
          'long',
          'X',
        ),
      ).toBe('2. Mose 3:14');
      expect(
        formatBibleText({ book: 60, chapter: 1, verseRanges: [{ start: 3, end: 3 }] }, 'long', 'X'),
      ).toBe('1. Petrus 1:3');
    });
  });

  describe('with short format', () => {
    test('formats single verse', () => {
      expect(
        formatBibleText(
          { book: 43, chapter: 3, verseRanges: [{ start: 16, end: 16 }] },
          'short',
          'X',
        ),
      ).toBe('Joh 3:16');
      expect(
        formatBibleText(
          { book: 19, chapter: 23, verseRanges: [{ start: 1, end: 1 }] },
          'short',
          'X',
        ),
      ).toBe('Ps 23:1');
    });

    test('formats verse range', () => {
      expect(
        formatBibleText(
          { book: 19, chapter: 23, verseRanges: [{ start: 1, end: 3 }] },
          'short',
          'X',
        ),
      ).toBe('Ps 23:1-3');
      expect(
        formatBibleText(
          { book: 66, chapter: 21, verseRanges: [{ start: 3, end: 4 }] },
          'short',
          'X',
        ),
      ).toBe('Off 21:3-4');
    });

    test('handles books with numbers', () => {
      expect(
        formatBibleText({ book: 1, chapter: 1, verseRanges: [{ start: 1, end: 1 }] }, 'short', 'X'),
      ).toBe('1Mo 1:1');
      expect(
        formatBibleText(
          { book: 2, chapter: 3, verseRanges: [{ start: 14, end: 14 }] },
          'short',
          'X',
        ),
      ).toBe('2Mo 3:14');
      expect(
        formatBibleText(
          { book: 60, chapter: 1, verseRanges: [{ start: 3, end: 3 }] },
          'short',
          'X',
        ),
      ).toBe('1Pe 1:3');
    });
  });

  test('throw error on invalid reference', () => {
    expect(() =>
      formatBibleText({ book: 200, chapter: 1, verseRanges: [{ start: 1, end: 1 }] }, 'long', 'X'),
    ).toThrow('errors.bookNotFound');
    // TODO: test for verse ranges
    expect(() =>
      formatBibleText(
        { book: 70, chapter: 100, verseRanges: [{ start: 1, end: 1 }] },
        'short',
        'X',
      ),
    ).toThrow('errors.bookNotFound');
  });

  describe('single-chapter books', () => {
    test('formats Obadiah without chapter number', () => {
      expect(
        formatBibleText({ book: 31, chapter: 1, verseRanges: [{ start: 1, end: 1 }] }, 'long', 'E'),
      ).toBe('Obadiah 1');
      expect(
        formatBibleText(
          { book: 31, chapter: 1, verseRanges: [{ start: 1, end: 1 }] },
          'short',
          'E',
        ),
      ).toBe('Ob 1');
    });

    test('formats Philemon without chapter number', () => {
      expect(
        formatBibleText({ book: 57, chapter: 1, verseRanges: [{ start: 5, end: 5 }] }, 'long', 'E'),
      ).toBe('Philemon 5');
      expect(
        formatBibleText(
          { book: 57, chapter: 1, verseRanges: [{ start: 5, end: 5 }] },
          'short',
          'E',
        ),
      ).toBe('Phm 5');
    });

    test('formats 2 John without chapter number', () => {
      expect(
        formatBibleText({ book: 63, chapter: 1, verseRanges: [{ start: 1, end: 1 }] }, 'long', 'E'),
      ).toBe('2 John 1');
      expect(
        formatBibleText(
          { book: 63, chapter: 1, verseRanges: [{ start: 1, end: 1 }] },
          'short',
          'E',
        ),
      ).toBe('2Jo 1');
    });

    test('formats 3 John without chapter number', () => {
      expect(
        formatBibleText(
          { book: 64, chapter: 1, verseRanges: [{ start: 14, end: 14 }] },
          'long',
          'E',
        ),
      ).toBe('3 John 14');
      expect(
        formatBibleText(
          { book: 64, chapter: 1, verseRanges: [{ start: 14, end: 14 }] },
          'short',
          'E',
        ),
      ).toBe('3Jo 14');
    });

    test('formats Jude without chapter number', () => {
      expect(
        formatBibleText({ book: 65, chapter: 1, verseRanges: [{ start: 3, end: 3 }] }, 'long', 'E'),
      ).toBe('Jude 3');
      expect(
        formatBibleText(
          { book: 65, chapter: 1, verseRanges: [{ start: 3, end: 3 }] },
          'short',
          'E',
        ),
      ).toBe('Jude 3');
    });

    test('formats Jude verse range without chapter number', () => {
      expect(
        formatBibleText({ book: 65, chapter: 1, verseRanges: [{ start: 1, end: 5 }] }, 'long', 'E'),
      ).toBe('Jude 1-5');
    });

    test('formats Jude complex verses without chapter number', () => {
      expect(
        formatBibleText(
          {
            book: 65,
            chapter: 1,
            verseRanges: [
              { start: 1, end: 1 },
              { start: 3, end: 3 },
              { start: 5, end: 7 },
              { start: 10, end: 10 },
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
            chapter: 3,
            endChapter: 4,
            verseRanges: [{ start: 1, end: 11 }],
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
            chapter: 3,
            endChapter: 4,
            verseRanges: [{ start: 1, end: 11 }],
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
            chapter: 1,
            endChapter: 2,
            verseRanges: [{ start: 1, end: 3 }],
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
            chapter: 2,
            endChapter: 3,
            verseRanges: [{ start: 3, end: 6 }],
          },
          'short',
          'E',
        ),
      ).toBe('Joh 2:3-3:6');
    });
  });

  describe('whole chapter references', () => {
    test('formats whole chapter for multi-chapter book with long format', () => {
      expect(
        formatBibleText(
          {
            book: 11, // 1 Kings
            chapter: 1,
            verseRanges: [{ start: 1, end: 53 }],
            isWholeChapter: true,
          },
          'long',
          'E',
        ),
      ).toBe('1 Kings 1');
    });

    test('formats whole chapter for multi-chapter book with short format', () => {
      expect(
        formatBibleText(
          {
            book: 11, // 1 Kings
            chapter: 1,
            verseRanges: [{ start: 1, end: 53 }],
            isWholeChapter: true,
          },
          'short',
          'E',
        ),
      ).toBe('1Ki 1');
    });

    test('formats whole chapter for John', () => {
      expect(
        formatBibleText(
          {
            book: 43, // John
            chapter: 3,
            verseRanges: [{ start: 1, end: 36 }],
            isWholeChapter: true,
          },
          'long',
          'E',
        ),
      ).toBe('John 3');
    });

    test('formats whole chapter for Psalms', () => {
      expect(
        formatBibleText(
          {
            book: 19, // Psalms
            chapter: 23,
            verseRanges: [{ start: 1, end: 6 }],
            isWholeChapter: true,
          },
          'short',
          'E',
        ),
      ).toBe('Ps 23');
    });

    test('formats whole single-chapter book', () => {
      expect(
        formatBibleText(
          {
            book: 65, // Jude
            chapter: 1,
            verseRanges: [{ start: 1, end: 25 }],
            isWholeChapter: true,
          },
          'long',
          'E',
        ),
      ).toBe('Jude');
    });

    test('formats whole single-chapter book with short format', () => {
      expect(
        formatBibleText(
          {
            book: 57, // Philemon
            chapter: 1,
            verseRanges: [{ start: 1, end: 25 }],
            isWholeChapter: true,
          },
          'short',
          'E',
        ),
      ).toBe('Phm');
    });
  });
});
