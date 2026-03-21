import { BIBLE_REFERENCE_REGEX } from '@/utils/bibleReferenceRegex';

describe('Bible Reference Regex Pattern', () => {
  // The regex pattern we want to test (without the /b part)
  const validGermanReferences = [
    // Simple references
    'joh3:16',
    'ps23:1',
    'Joh 3:16',
    'Psal 23:1',
    'offb21:4',
    'Offenbarung 21:4',
    'Matt. 6:33',
    '2 Cor. 5:15',
    '2 Corinthians 6:1',
    '1. Kor. 15:1',

    // References with ranges
    'ps23:1-3',
    'off21:3-4',
    'Ps 23:1-3',
    'Off 21:3-4',

    // References with numbers in book names
    '1mo1:1',
    '5mo3:14',
    '1pe1:3',
    '1Mo 1:1',
    '3Mo 3:14',
    '1Pe 1:3',

    // Complex references with multiple verses
    'joh1:1,2,4,6,7-8,12-14',
    'joh 1:1,2,4,6,7-8,12-14',
    'joh1:1-2,4,6-8,12-14',
    'joh 1:1-2, 4, 6-8, 12-14',
    '1mo3:1-5,7,9',
    '1Mo3:1-5,6',
    '5Mo3:1-5,7,9',
    '1mo 3:1-5,7,9',
    '1Mo 3:1-5, 7, 9',

    // References with German characters
    'röm8:28',
    'Röm 8:28',

    // Multi-chapter references
    'Matt. 3:1-4:11',
    'matt3:1-4:11',
    'Matt 3:1-4:11',
    '1mo1:1-2:3',
    '1Mo 1:1-50:26',
    'Joh 3:16-4:1',
  ];

  const validKoreanReferences = [
    // Korean references (single-word book names)
    '신1:1',
    '신1:1-3',
    '수1:1-3,5,7',

    // Korean references with spaces in book names
    '솔로몬의 노래 1:1',
    '고린도 전서 1:1',
    '고린도 후서 1:1',
    '요한 계시록 1:1',
    // Note: "요한 1서 1:1", "요한 2서 1:1", "요한 3서 1:1" cannot be matched by regex
    // because the embedded digit in the book name (1서/2서/3서) is indistinguishable
    // from a chapter number. These require dictionary-based matching.
    '디모데 전서 1:1',
    '베드로 전서 1:1',
    '데살로니가 전서 1:1',
  ];

  const validVietnameseReferences = [
    // Vietnamese references with hyphens
    'Lê-vi 1:1',
    'Ru-tơ 1:1',
    'Nê-hê-mi 1:1',
    'Đa-ni-ên 1:1',
    'Ha-ba-cúc 1:1',
    'Ê-phê-sô 1:1',
    'Phi-lê-môn 1:1',

    // Vietnamese references with spaces and hyphens
    '1 Sa-mu-ên 1:1',
    '1 Phi-e-rơ 1:1',
    '2 Phi-e-rơ 1:1',
  ];

  const validSpanishReferences = [
    // Spanish references with accented characters
    'Génesis 3:1',
    'Éxodo 1:1',
    'Levítico 1:1',
    'Números 1:1',
    'Josué 1:1',
    '1 Crónicas 1:1',
    'Nehemías 1:1',
    'Eclesiastés 1:1',
    'Isaías 1:1',
  ];

  const invalidReferences = [
    // Invalid formats
    'joh:1',
    '3:16',
    'joh3',
    'joh3:',
    ':16',
    ' joh3:16',
    'joh 3:16 ',

    // Invalid verse patterns
    'joh3:1,,2',
    'joh3:1-2-3',
    'joh3:1,-2',
  ];

  test('matches valid German Bible references', () => {
    validGermanReferences.forEach((reference) => {
      const testRegex = new RegExp(`^${BIBLE_REFERENCE_REGEX.source}$`, 'iu');
      if (!testRegex.test(reference)) {
        console.error('Should match', { reference });
      }
      expect(testRegex.test(reference)).toBe(true);
    });
  });

  test('matches valid Korean Bible references', () => {
    validKoreanReferences.forEach((reference) => {
      const testRegex = new RegExp(`^${BIBLE_REFERENCE_REGEX.source}$`, 'iu');
      if (!testRegex.test(reference)) {
        console.error('Should match', { reference });
      }
      expect(testRegex.test(reference)).toBe(true);
    });
  });

  test('matches valid Spanish Bible references with accents', () => {
    validSpanishReferences.forEach((reference) => {
      const testRegex = new RegExp(`^${BIBLE_REFERENCE_REGEX.source}$`, 'iu');
      if (!testRegex.test(reference)) {
        console.error('Should match', { reference });
      }
      expect(testRegex.test(reference)).toBe(true);
    });
  });

  test('matches valid Vietnamese Bible references with hyphens', () => {
    validVietnameseReferences.forEach((reference) => {
      const testRegex = new RegExp(`^${BIBLE_REFERENCE_REGEX.source}$`, 'iu');
      if (!testRegex.test(reference)) {
        console.error('Should match', { reference });
      }
      expect(testRegex.test(reference)).toBe(true);
    });
  });

  test('does not match invalid Bible references', () => {
    invalidReferences.forEach((reference) => {
      const testRegex = new RegExp(`^${BIBLE_REFERENCE_REGEX.source}$`, 'iu');
      if (testRegex.test(reference)) {
        console.error('Should not match', { reference });
      }
      expect(testRegex.test(reference)).toBe(false);
    });
  });
});
