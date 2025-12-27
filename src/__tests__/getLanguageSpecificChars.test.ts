import { getLanguageSpecificChars } from '@/utils/getLanguageSpecificChars';

describe('getLanguageSpecificChars', () => {
  test('returns German-specific characters for language X', () => {
    expect(getLanguageSpecificChars('X')).toBe('äöüß');
  });

  test('returns Korean-specific characters for language KO', () => {
    expect(getLanguageSpecificChars('KO')).toBe('\\uAC00-\\uD7AF\\u1100-\\u11FF\\u3130-\\u318F');
  });

  test('returns empty string for English language', () => {
    expect(getLanguageSpecificChars('E')).toBe('');
  });

  test('returns empty string for Finnish language', () => {
    expect(getLanguageSpecificChars('FI')).toBe('');
  });

  test('returns empty string for Spanish language', () => {
    expect(getLanguageSpecificChars('S')).toBe('');
  });

  test('returns empty string for Dutch language', () => {
    expect(getLanguageSpecificChars('O')).toBe('');
  });

  test('returns empty string for French language', () => {
    expect(getLanguageSpecificChars('F')).toBe('');
  });
});
