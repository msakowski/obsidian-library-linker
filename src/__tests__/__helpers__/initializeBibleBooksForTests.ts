import { readFileSync } from 'fs';
import { join, resolve } from 'path';
import { __getCache } from '@/stores/bibleBooks';
import type { BibleBook, Language } from '@/types';
import yaml from 'js-yaml';

const PROJECT_ROOT = resolve(__dirname, '../../..');
const LOCALE_DIR = join(PROJECT_ROOT, 'locale');

/**
 * Loads bible books test data directly from YAML files
 * @param languages Languages to pre-load (defaults to common test languages)
 */
export function initializeTestBibleBooks(
  languages: Language[] = ['E', 'X', 'FI', 'O', 'S', 'F', 'KO', 'TPO', 'CR'],
): void {
  const booksCache = __getCache();

  languages.forEach((lang) => {
    try {
      const filePath = join(LOCALE_DIR, 'bibleBooks', `${lang}.yaml`);
      const content = readFileSync(filePath, 'utf8');
      const books = yaml.load(content, { schema: yaml.JSON_SCHEMA }) as readonly Omit<
        BibleBook,
        'chapters'
      >[];
      booksCache.set(lang, books);
    } catch (error) {
      console.warn(`Failed to load test data for language ${lang}:`, error);
    }
  });
}
