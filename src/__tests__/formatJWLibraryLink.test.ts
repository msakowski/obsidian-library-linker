import { formatJWLibraryLink } from '@/utils/formatJWLibraryLink';
import type { BibleReference } from '@/types';

describe('formatJWLibraryLink', () => {
  test('formats single verse reference', () => {
    const reference: BibleReference = {
      book: 43,
      chapter: 3,
      verseRanges: [{ start: 16, end: 16 }],
    };
    expect(formatJWLibraryLink(reference)).toBe('jwlibrary:///finder?bible=43003016');
  });

  test('formats verse range reference', () => {
    const reference: BibleReference = {
      book: 19,
      chapter: 23,
      verseRanges: [{ start: 1, end: 3 }],
    };
    expect(formatJWLibraryLink(reference)).toBe('jwlibrary:///finder?bible=19023001-19023003');
  });

  test('formats complex verse reference with multiple ranges', () => {
    const reference: BibleReference = {
      book: 43,
      chapter: 1,
      verseRanges: [
        { start: 1, end: 2 },
        { start: 4, end: 4 },
        { start: 6, end: 8 },
        { start: 12, end: 14 },
      ],
    };
    expect(formatJWLibraryLink(reference)).toEqual([
      'jwlibrary:///finder?bible=43001001-43001002',
      'jwlibrary:///finder?bible=43001004',
      'jwlibrary:///finder?bible=43001006-43001008',
      'jwlibrary:///finder?bible=43001012-43001014',
    ]);
  });

  test('formats complex verse reference with single verses', () => {
    const reference: BibleReference = {
      book: 43,
      chapter: 1,
      verseRanges: [
        { start: 1, end: 1 },
        { start: 4, end: 4 },
        { start: 6, end: 6 },
      ],
    };
    expect(formatJWLibraryLink(reference)).toEqual([
      'jwlibrary:///finder?bible=43001001',
      'jwlibrary:///finder?bible=43001004',
      'jwlibrary:///finder?bible=43001006',
    ]);
  });

  // Multi-chapter reference tests
  describe('multi-chapter references', () => {
    test('formats multi-chapter reference', () => {
      const reference: BibleReference = {
        book: 40, // Matthew
        chapter: 3,
        endChapter: 4,
        verseRanges: [{ start: 1, end: 11 }],
      };
      expect(formatJWLibraryLink(reference)).toBe('jwlibrary:///finder?bible=40003001-40004011');
    });

    test('formats multi-chapter reference with language', () => {
      const reference: BibleReference = {
        book: 40, // Matthew
        chapter: 3,
        endChapter: 4,
        verseRanges: [{ start: 1, end: 11 }],
      };
      expect(formatJWLibraryLink(reference, 'E')).toBe(
        'jwlibrary:///finder?bible=40003001-40004011&wtlocale=E',
      );
    });

    test('formats multi-chapter reference across many chapters', () => {
      const reference: BibleReference = {
        book: 1, // Genesis
        chapter: 1,
        endChapter: 50,
        verseRanges: [{ start: 1, end: 26 }],
      };
      expect(formatJWLibraryLink(reference)).toBe('jwlibrary:///finder?bible=01001001-01050026');
    });
  });

  // Whole chapter reference tests (new feature)
  describe('whole chapter references', () => {
    test('formats whole chapter link for 1 Kings 1', () => {
      const result = formatJWLibraryLink({
        book: 11,
        chapter: 1,
        verseRanges: [{ start: 1, end: 53 }],
        isWholeChapter: true,
      });
      expect(result).toBe('jwlibrary:///finder?bible=11001000-11001099');
    });

    test('formats whole chapter link for John 3', () => {
      const result = formatJWLibraryLink({
        book: 43,
        chapter: 3,
        verseRanges: [{ start: 1, end: 36 }],
        isWholeChapter: true,
      });
      expect(result).toBe('jwlibrary:///finder?bible=43003000-43003099');
    });

    test('formats whole chapter link for Psalms 23', () => {
      const result = formatJWLibraryLink({
        book: 19,
        chapter: 23,
        verseRanges: [{ start: 1, end: 6 }],
        isWholeChapter: true,
      });
      expect(result).toBe('jwlibrary:///finder?bible=19023000-19023099');
    });

    test('formats whole chapter link with language parameter', () => {
      const result = formatJWLibraryLink(
        {
          book: 11,
          chapter: 1,
          verseRanges: [{ start: 1, end: 53 }],
          isWholeChapter: true,
        },
        'E',
      );
      expect(result).toBe('jwlibrary:///finder?bible=11001000-11001099&wtlocale=E');
    });

    test('formats whole single-chapter book', () => {
      const result = formatJWLibraryLink({
        book: 65, // Jude
        chapter: 1,
        verseRanges: [{ start: 1, end: 25 }],
        isWholeChapter: true,
      });
      expect(result).toBe('jwlibrary:///finder?bible=65001000-65001099');
    });
  });
});
