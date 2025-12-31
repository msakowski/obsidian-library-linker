import { readFileSync } from 'fs';
import { join, resolve } from 'path';
import { __getCache } from '@/stores/bibleBooks';
import type { BibleBook, Language } from '@/types';

const PROJECT_ROOT = resolve(__dirname, '../../..');
const LOCALES_DIR = join(PROJECT_ROOT, 'dist/locales');

/**
 * Loads bible books test data directly from compiled JSON files
 * @param languages Languages to pre-load (defaults to common test languages)
 */
export function initializeTestBibleBooks(
  languages: Language[] = ['E', 'X', 'FI', 'O', 'S', 'F', 'KO', 'TPO'],
): void {
  // Load books directly from dist/locales and populate cache
  const booksCache = __getCache();

  languages.forEach((lang) => {
    try {
      const filePath = join(LOCALES_DIR, 'bibleBooks', `${lang}.json`);
      const content = readFileSync(filePath, 'utf8');
      const books = JSON.parse(content) as readonly Omit<BibleBook, 'chapters'>[];
      booksCache.set(lang, books);
    } catch (error) {
      console.warn(`Failed to load test data for language ${lang}:`, error);
    }
  });
}
