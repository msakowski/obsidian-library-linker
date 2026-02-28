import type { Language } from '@/types';

/**
 * Returns language-specific characters for use in regular expressions
 * @param language - The language code
 * @returns String containing language-specific characters for regex patterns
 */
export function getLanguageSpecificChars(language: Language): string {
  if (language === 'X') {
    // German: äöüß
    return 'äöüß';
  } else if (language === 'KO') {
    // Korean: 가-힯ᄀ-ᇿ㄰-㆏
    return '\\uAC00-\\uD7AF\\u1100-\\u11FF\\u3130-\\u318F';
  } else if (language === 'TPO') {
    // Portuguese: ãáàâéêíóôõúç
    return 'ãáàâéêíóôõúç';
  } else if (language === 'CR') {
    // Croatian: čćšžđ
    return 'čćšžđ';
  }
  return '';
}
