import { matchingBibleReferenceRegex } from '@/main';

describe('Bible Reference Regex Pattern', () => {
  // The regex pattern we want to test (without the /b part)
  const validReferences = [
    // Simple references
    'joh3:16',
    'ps23:1',
    'Joh 3:16',
    'Psal 23:1',
    'offb21:4',
    'Offenbarung 21:4',

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
    '1Mo3:1-5,6,',
    '5Mo3:1-5,7,9',
    '1mo 3:1-5,7,9',
    '1Mo 3:1-5, 7, 9',

    // References with German characters
    'röm8:28',
    'Röm 8:28',

    // References with trailing comma
    'joh1:1,',
    'joh 1:1,2,',
    'Joh1:1,2,3,',
    '2Pet 1:1,2,3,',
  ];

  const invalidReferences = [
    // Invalid formats
    'joh:1',
    '3:16',
    'joh3',
    'joh3:',
    ':16',

    // Invalid verse patterns
    'joh3:1,,2',
    'joh3:1-2-3',
    'joh3:1,-2',
  ];

  test('matches valid Bible references', () => {
    validReferences.forEach((reference) => {
      expect(reference).toMatch(matchingBibleReferenceRegex);
    });
  });

  test('does not match invalid Bible references', () => {
    invalidReferences.forEach((reference) => {
      expect(reference).not.toMatch(matchingBibleReferenceRegex);
    });
  });
});
