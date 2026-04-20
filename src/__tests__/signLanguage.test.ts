import { loadBibleBooks, getBibleBooks, __getCache } from '@/stores/bibleBooks';
import { formatJWLibraryLink } from '@/utils/formatJWLibraryLink';
import { getBookLanguage, SIGN_LANGUAGE_MAP } from '@/utils/signLanguage';
import type { BibleReference } from '@/types';
import { initializeTestBibleBooks } from '@/__tests__/__helpers__/initializeBibleBooksForTests';

beforeEach(() => {
  __getCache().clear();
});

describe('SIGN_LANGUAGE_MAP', () => {
  test('ASL maps to English', () => {
    expect(SIGN_LANGUAGE_MAP['ASL']).toBe('E');
  });

  test('SLV maps to Vietnamese', () => {
    expect(SIGN_LANGUAGE_MAP['SLV']).toBe('VT');
  });

  test('DGS maps to German', () => {
    expect(SIGN_LANGUAGE_MAP['DGS']).toBe('X');
  });
});

describe('getBookLanguage', () => {
  test('returns same language for spoken languages', () => {
    expect(getBookLanguage('E')).toBe('E');
    expect(getBookLanguage('X')).toBe('X');
    expect(getBookLanguage('VT')).toBe('VT');
  });

  test('resolves sign languages to their spoken base', () => {
    expect(getBookLanguage('ASL')).toBe('E');
    expect(getBookLanguage('SLV')).toBe('VT');
    expect(getBookLanguage('DGS')).toBe('X');
    expect(getBookLanguage('KSL')).toBe('KO');
    expect(getBookLanguage('HZJ')).toBe('C');
  });
});

describe('loadBibleBooks / getBibleBooks for sign languages', () => {
  beforeEach(() => {
    initializeTestBibleBooks(['E', 'X', 'VT']);
  });

  test('ASL returns the same books as English', () => {
    loadBibleBooks('ASL');
    const aslBooks = getBibleBooks('ASL');
    const englishBooks = getBibleBooks('E');
    expect(aslBooks).toBe(englishBooks);
  });

  test('DGS returns the same books as German', () => {
    loadBibleBooks('DGS');
    const dgsBooks = getBibleBooks('DGS');
    const germanBooks = getBibleBooks('X');
    expect(dgsBooks).toBe(germanBooks);
  });

  test('SLV returns the same books as Vietnamese', () => {
    loadBibleBooks('SLV');
    const slvBooks = getBibleBooks('SLV');
    const vtBooks = getBibleBooks('VT');
    expect(slvBooks).toBe(vtBooks);
  });

  test('second loadBibleBooks call is a no-op', () => {
    loadBibleBooks('ASL');
    loadBibleBooks('ASL');
    expect(getBibleBooks('ASL')).toBe(getBibleBooks('E'));
  });
});

describe('formatJWLibraryLink uses sign language code as wtlocale', () => {
  const reference: BibleReference = {
    book: 40,
    chapter: 24,
    verseRanges: [{ start: 14, end: 14 }],
  };

  test('ASL produces wtlocale=ASL', () => {
    expect(formatJWLibraryLink(reference, 'ASL')).toBe(
      'jwlibrary:///finder?bible=40024014&wtlocale=ASL',
    );
  });

  test('SLV produces wtlocale=SLV', () => {
    expect(formatJWLibraryLink(reference, 'SLV')).toBe(
      'jwlibrary:///finder?bible=40024014&wtlocale=SLV',
    );
  });

  test('DGS produces wtlocale=DGS', () => {
    expect(formatJWLibraryLink(reference, 'DGS')).toBe(
      'jwlibrary:///finder?bible=40024014&wtlocale=DGS',
    );
  });
});
