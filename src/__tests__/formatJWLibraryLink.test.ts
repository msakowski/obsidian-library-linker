import { formatJWLibraryLink } from '@/utils/formatJWLibraryLink';
import type { BibleReference } from '@/types';

describe('formatJWLibraryLink', () => {
  test('formats single verse reference', () => {
    const reference: BibleReference = {
      book: '43',
      chapter: '003',
      verse: '016',
    };
    expect(formatJWLibraryLink(reference)).toBe('jwlibrary:///finder?bible=43003016');
  });

  test('formats verse range reference', () => {
    const reference: BibleReference = {
      book: '19',
      chapter: '023',
      verse: '001',
      endVerse: '003',
    };
    expect(formatJWLibraryLink(reference)).toBe('jwlibrary:///finder?bible=19023001-19023003');
  });
});
