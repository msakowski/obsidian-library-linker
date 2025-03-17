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
});
