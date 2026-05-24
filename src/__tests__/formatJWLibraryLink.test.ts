import { formatJWLibraryLink } from '@/utils/formatJWLibraryLink';
import type { BibleReference } from '@/types';

describe('formatJWLibraryLink', () => {
  test('formats single verse reference', () => {
    const reference: BibleReference = {
      book: 43,
      ranges: [{ chapterStart: 3, verseStart: 16 }],
    };
    expect(formatJWLibraryLink(reference)).toBe('jwlibrary:///finder?bible=43003016');
  });

  test('formats verse range reference', () => {
    const reference: BibleReference = {
      book: 19,
      ranges: [{ chapterStart: 23, verseStart: 1, verseEnd: 3 }],
    };
    expect(formatJWLibraryLink(reference)).toBe('jwlibrary:///finder?bible=19023001-19023003');
  });

  test('formats complex verse reference with multiple ranges', () => {
    const reference: BibleReference = {
      book: 43,
      ranges: [
        { chapterStart: 1, verseStart: 1, verseEnd: 2 },
        { chapterStart: 1, verseStart: 4 },
        { chapterStart: 1, verseStart: 6, verseEnd: 8 },
        { chapterStart: 1, verseStart: 12, verseEnd: 14 },
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
      ranges: [
        { chapterStart: 1, verseStart: 1 },
        { chapterStart: 1, verseStart: 4 },
        { chapterStart: 1, verseStart: 6 },
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
        ranges: [{ chapterStart: 3, chapterEnd: 4, verseStart: 1, verseEnd: 11 }],
      };
      expect(formatJWLibraryLink(reference)).toBe('jwlibrary:///finder?bible=40003001-40004011');
    });

    test('formats multi-chapter reference with language', () => {
      const reference: BibleReference = {
        book: 40, // Matthew
        ranges: [{ chapterStart: 3, chapterEnd: 4, verseStart: 1, verseEnd: 11 }],
      };
      expect(formatJWLibraryLink(reference, 'E')).toBe(
        'jwlibrary:///finder?bible=40003001-40004011&wtlocale=E',
      );
    });

    test('formats multi-chapter reference across many chapters', () => {
      const reference: BibleReference = {
        book: 1, // Genesis
        ranges: [{ chapterStart: 1, chapterEnd: 50, verseStart: 1, verseEnd: 26 }],
      };
      expect(formatJWLibraryLink(reference)).toBe('jwlibrary:///finder?bible=01001001-01050026');
    });
  });
});
