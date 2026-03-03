import { chapterCounts } from '@/consts/chapterCounts';
import type { BibleBook, Language } from '@/types';
import BUNDLED_LOCALES from 'locale:all';
import { logger } from '@/utils/logger';

type BibleBookWithoutChapters = Omit<BibleBook, 'chapters'>;

// In-memory cache for bible books data
const booksCache = new Map<Language, readonly BibleBookWithoutChapters[]>();

// Cache for enriched books (with chapter counts merged in)
const enrichedBooksCache = new Map<Language, readonly BibleBook[]>();

/**
 * Get the internal cache (for testing purposes only)
 * @internal
 */
export function __getCache(): Map<Language, readonly BibleBookWithoutChapters[]> {
  return booksCache;
}

/**
 * Load and cache bible books for a language
 * Can be called to pre-load a language before switching
 *
 * @param language - The language code to load
 * @throws Error if loading fails
 */
export function loadBibleBooks(language: Language): void {
  // Return early if already loaded
  if (booksCache.has(language)) {
    return;
  }

  const bibleFile = `locale/bibleBooks/${language}.yaml`;

  if (!(bibleFile in BUNDLED_LOCALES)) {
    logger.error(`Bible books for language ${language} not found in bundle`);
    throw new Error('errors.unsupportedLanguage');
  }

  const books = BUNDLED_LOCALES[bibleFile] as readonly BibleBookWithoutChapters[];
  booksCache.set(language, books);
}

/**
 * Get all bible books for a language (synchronous)
 * Assumes language has been loaded via loadBibleBooks()
 *
 * @param language - The language code to get books for
 * @returns Array of bible books with chapter counts
 * @throws Error if language not loaded
 */
export function getBibleBooks(language: Language): readonly BibleBook[] {
  const cached = enrichedBooksCache.get(language);
  if (cached) return cached;

  const books = booksCache.get(language);

  if (!books) {
    logger.error(`Bible books for language ${language} not loaded. Call loadBibleBooks() first.`);
    throw new Error('errors.unsupportedLanguage');
  }

  const enriched = books.map((book) => ({
    ...book,
    chapters: chapterCounts[book.id],
  }));
  enrichedBooksCache.set(language, enriched);
  return enriched;
}

/**
 * Get a specific bible book by ID
 *
 * @param id - The book ID (1-66)
 * @param language - The language code
 * @returns The bible book or undefined if not found
 */
export function getBibleBookById(id: number, language: Language): BibleBook | undefined {
  return getBibleBooks(language).find((book) => book.id === id);
}

/**
 * Check if a bible book ID is valid
 *
 * @param id - The book ID to check
 * @returns True if ID is between 1 and 66
 */
export function bibleBookExists(id: number): boolean {
  return id >= 1 && id <= 66;
}
