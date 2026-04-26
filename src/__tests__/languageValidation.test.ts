import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

import { LANGUAGE_CODES, LOCALES } from '@/consts/languages';
import languageJson from '@/consts/languages.json';

const PROJECT_ROOT = resolve(__dirname, '../..');
const BIBLE_BOOKS_DIR = join(PROJECT_ROOT, 'locale', 'bibleBooks');
const README_PATH = join(PROJECT_ROOT, 'README.md');

const readmeCodes = (() => {
  const readme = readFileSync(README_PATH, 'utf8');
  const codes = new Set<string>();
  // Match table rows like "| E | English / English |"
  const rowRegex = /^\|\s*([A-Z]+)\s*\|\s*[^|]+\|\s*$/gm;
  let match: RegExpExecArray | null;
  while ((match = rowRegex.exec(readme)) !== null) {
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

    test('is listed in the README language table', () => {
      expect(readmeCodes.has(code)).toBe(true);
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
