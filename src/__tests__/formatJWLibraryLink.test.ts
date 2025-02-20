import { formatJWLibraryLink } from '@/utils/formatJWLibraryLink';
import type { BibleReference } from '@/types';

describe('formatJWLibraryLink', () => {
  test('formats single verse reference', () => {
    const reference: BibleReference = {
      book: '43',
      chapter: '003',
      verseRanges: [{ start: '016', end: '016' }],
    };
    expect(formatJWLibraryLink(reference)).toBe('jwlibrary:///finder?bible=43003016');
  });

  test('formats verse range reference', () => {
    const reference: BibleReference = {
      book: '19',
      chapter: '023',
      verseRanges: [{ start: '001', end: '003' }],
    };
    expect(formatJWLibraryLink(reference)).toBe('jwlibrary:///finder?bible=19023001-19023003');
  });

  test('formats complex verse reference with multiple ranges', () => {
    const reference: BibleReference = {
      book: '43',
      chapter: '001',
      verseRanges: [
        { start: '001', end: '002' },
        { start: '004', end: '004' },
        { start: '006', end: '008' },
        { start: '012', end: '014' },
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
      book: '43',
      chapter: '001',
      verseRanges: [
        { start: '001', end: '001' },
        { start: '004', end: '004' },
        { start: '006', end: '006' },
      ],
    };
    expect(formatJWLibraryLink(reference)).toEqual([
      'jwlibrary:///finder?bible=43001001',
      'jwlibrary:///finder?bible=43001004',
      'jwlibrary:///finder?bible=43001006',
    ]);
  });
});
