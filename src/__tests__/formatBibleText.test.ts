import { formatBibleText } from '@/utils/formatBibleText';

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
});
