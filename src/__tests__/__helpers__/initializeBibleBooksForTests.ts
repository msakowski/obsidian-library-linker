import { readFileSync } from 'fs';
import { join, resolve } from 'path';
import { __getCache } from '@/stores/bibleBooks';
import type { BibleBook, Language } from '@/types';
import yaml from 'js-yaml';
import { LANGUAGES } from '@/consts/languages';
import { getBookLanguage } from '@/utils/signLanguage';

const PROJECT_ROOT = resolve(__dirname, '../../..');
const LOCALE_DIR = join(PROJECT_ROOT, 'locale');

/**
 * Loads bible books test data directly from YAML files
 * @param languages Languages to pre-load (defaults to common test languages)
 */
export function initializeTestBibleBooks(
  languages: Language[] = Object.keys(LANGUAGES) as Language[],
): void {
  const booksCache = __getCache();
  const loadedBooks = new Map<Language, readonly Omit<BibleBook, 'chapters'>[]>();

  languages.forEach((lang) => {
    try {
      const sourceLanguage = getBookLanguage(lang);
      let books = loadedBooks.get(sourceLanguage);

      if (!books) {
        const filePath = join(LOCALE_DIR, 'bibleBooks', `${sourceLanguage}.yaml`);
        const content = readFileSync(filePath, 'utf8');
        books = yaml.load(content, { schema: yaml.JSON_SCHEMA }) as readonly Omit<
          BibleBook,
          'chapters'
        >[];
        loadedBooks.set(sourceLanguage, books);
      }

      booksCache.set(lang, books);
    } catch (error) {
      console.warn(`Failed to load test data for language ${lang}:`, error);
    }
  });
}
