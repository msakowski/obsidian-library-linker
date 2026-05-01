import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

import { LANGUAGE_CODES, LOCALES } from '@/consts/languages';
import languageJson from '@/consts/languages.json';

const PROJECT_ROOT = resolve(__dirname, '../..');
const BIBLE_BOOKS_DIR = join(PROJECT_ROOT, 'locale', 'bibleBooks');
const LOCALIZATION_PATH = join(PROJECT_ROOT, 'LOCALIZATION.md');

const documentedCodes = (() => {
  const localization = readFileSync(LOCALIZATION_PATH, 'utf8');
  const codes = new Set<string>();
  // Match table rows like "| E | English / English |"
  const rowRegex = /^\|\s*([A-Z]+)\s*\|\s*[^|]+\|\s*$/gm;
  let match: RegExpExecArray | null;
  while ((match = rowRegex.exec(localization)) !== null) {
    codes.add(match[1]);
  }
  return codes;
})();

describe('Language configuration validation', () => {
  describe.each(LANGUAGE_CODES)('language %s', (code) => {
    const entry = languageJson.find((lang) => lang.code === code);

    test('is present in languages.json', () => {
      expect(entry).toBeDefined();
    });

    test('is listed in the LOCALIZATION.md language table', () => {
      expect(documentedCodes.has(code)).toBe(true);
    });

    if (entry?.isSignLanguage) return;

    test(`has a locale/bibleBooks/${code}.yaml file`, () => {
      const filePath = join(BIBLE_BOOKS_DIR, `${code}.yaml`);
      expect(existsSync(filePath)).toBe(true);
    });

    test('has a corresponding entry in LOCALES', () => {
      expect((LOCALES as readonly string[]).includes(entry!.locale)).toBe(true);
    });
  });
});
