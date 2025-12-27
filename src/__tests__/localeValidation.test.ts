import { en } from '@/locale/en';
import { de } from '@/locale/de';
import { es } from '@/locale/es';
import { fi } from '@/locale/fi';
import { fr } from '@/locale/fr';
import { ko } from '@/locale/ko';
import { nl } from '@/locale/nl';

type NestedObject = { [key: string]: string | NestedObject };

/**
 * Recursively gets all nested keys from an object as dot-notation strings
 * Example: { a: { b: 'value', c: 'value2' } } returns ['a.b', 'a.c']
 */
function getNestedKeys(obj: NestedObject, prefix: string = ''): string[] {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getNestedKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys.sort();
}

/**
 * Compares two arrays of keys and returns missing keys from the first array
 */
function findMissingKeys(referenceKeys: string[], targetKeys: string[]): string[] {
  return referenceKeys.filter((key) => !targetKeys.includes(key));
}

/**
 * Finds keys that exist in target but not in reference (unknown keys)
 */
function findUnknownKeys(referenceKeys: string[], targetKeys: string[]): string[] {
  return targetKeys.filter((key) => !referenceKeys.includes(key));
}

describe('Locale Translation Validation', () => {
  const locales = {
    en,
    de,
    es,
    fi,
    fr,
    ko,
    nl,
  };

  const englishKeys = getNestedKeys(en);

  test('English locale should have keys (baseline check)', () => {
    expect(englishKeys.length).toBeGreaterThan(0);
    expect(englishKeys).toContain('settings.language.name');
    expect(englishKeys).toContain('commands.linkUnlinkedBibleReferences');
  });

  describe.each([
    ['de', de],
    ['es', es],
    ['fi', fi],
    ['fr', fr],
    ['ko', ko],
    ['nl', nl],
  ])('%s locale validation', (localeCode, locale) => {
    test(`should have all English keys present in ${localeCode}`, () => {
      const localeKeys = getNestedKeys(locale);
      const missingKeys = findMissingKeys(englishKeys, localeKeys);

      if (missingKeys.length > 0) {
        console.error(`Missing keys in ${localeCode}:`, missingKeys);
      }

      expect(missingKeys).toEqual([]);
    });

    test(`should not have unknown keys in ${localeCode}`, () => {
      const localeKeys = getNestedKeys(locale);
      const unknownKeys = findUnknownKeys(englishKeys, localeKeys);

      if (unknownKeys.length > 0) {
        console.error(`Unknown keys in ${localeCode}:`, unknownKeys);
      }

      expect(unknownKeys).toEqual([]);
    });

    test(`should have same number of keys as English in ${localeCode}`, () => {
      const localeKeys = getNestedKeys(locale);
      expect(localeKeys.length).toBe(englishKeys.length);
    });
  });

  test('all locales should have identical key structures', () => {
    const allLocaleKeys = Object.entries(locales).map(([code, locale]) => ({
      code,
      keys: getNestedKeys(locale),
    }));

    // Compare each locale with English
    for (const { code, keys } of allLocaleKeys) {
      if (code === 'en') continue;

      expect(keys).toEqual(englishKeys);
    }
  });

  test('should provide helpful error messages for missing keys', () => {
    // This test demonstrates how to identify specific missing keys
    const results = Object.entries(locales)
      .filter(([code]) => code !== 'en')
      .map(([code, locale]) => {
        const localeKeys = getNestedKeys(locale);
        const missingKeys = findMissingKeys(englishKeys, localeKeys);
        const unknownKeys = findUnknownKeys(englishKeys, localeKeys);

        return {
          locale: code,
          missingKeys,
          unknownKeys,
          isValid: missingKeys.length === 0 && unknownKeys.length === 0,
        };
      });

    const invalidLocales = results.filter((result) => !result.isValid);

    if (invalidLocales.length > 0) {
      const errorMessages = invalidLocales.map((result) => {
        const messages = [];
        if (result.missingKeys.length > 0) {
          messages.push(`Missing keys: ${result.missingKeys.join(', ')}`);
        }
        if (result.unknownKeys.length > 0) {
          messages.push(`Unknown keys: ${result.unknownKeys.join(', ')}`);
        }
        return `${result.locale}: ${messages.join('; ')}`;
      });

      console.error('Translation validation errors:\n', errorMessages.join('\n'));
    }

    expect(invalidLocales).toEqual([]);
  });
});
