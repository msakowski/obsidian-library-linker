import { getLocaleFromLanguage } from '@/utils/getLocaleFromLanguage';

describe('getLocaleFromLanguage', () => {
  test.each([
    ['E', 'en'],
    ['X', 'de'],
    ['FI', 'fi'],
    ['S', 'es'],
    ['O', 'nl'],
    ['KO', 'ko'],
    ['F', 'fr'],
    ['TPO', 'pt_pt'],
    ['C', 'hr'],
    ['VT', 'vi'],
    ['B', 'cs'],
  ] as const)('%s → %s', (language, expected) => {
    expect(getLocaleFromLanguage(language)).toBe(expected);
  });

  test('sign language without fallback returns undefined', () => {
    expect(getLocaleFromLanguage('ASL')).toBeUndefined();
    expect(getLocaleFromLanguage('DGS')).toBeUndefined();
    expect(getLocaleFromLanguage('LSF')).toBeUndefined();
  });

  test.each([
    ['ASL', 'en'],
    ['DGS', 'de'],
    ['FID', 'fi'],
    ['LSF', 'fr'],
    ['KSL', 'ko'],
    ['HZJ', 'hr'],
    ['SLV', 'vi'],
  ] as const)('%s → %s with fallbackToSpoken', (language, expected) => {
    expect(getLocaleFromLanguage(language, { fallbackToSpoken: true })).toBe(expected);
  });
});
