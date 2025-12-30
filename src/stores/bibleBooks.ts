import { chapterCounts } from '@/consts/chapterCounts';
import type { BibleBook, Language } from '@/types';
import type { FileLoaderService } from '@/services/FileLoaderService';

type BibleBookWithoutChapters = Omit<BibleBook, 'chapters'>;

// Interface for file loading - allows easier testing
type FileLoader = Pick<FileLoaderService, 'loadJSON'>;

// In-memory cache for bible books data
const booksCache = new Map<Language, readonly BibleBookWithoutChapters[]>();
let fileLoader: FileLoader | null = null;

/**
 * Get the internal cache (for testing purposes only)
 * @internal
 */
export function __getCache(): Map<Language, readonly BibleBookWithoutChapters[]> {
  return booksCache;
}

/**
 * Initialize the bible books store with file loader
 * MUST be called once during plugin startup
 *
 * @param loader - The file loader service instance (or compatible object with loadJSON method)
 */
export function initializeBibleBooks(loader: FileLoader): void {
  fileLoader = loader;
}

/**
 * Load and cache bible books for a language
 * Can be called to pre-load a language before switching
 *
 * @param language - The language code to load
 * @throws Error if store not initialized or loading fails
 */
export async function loadBibleBooks(language: Language): Promise<void> {
  // Return early if already loaded
  if (booksCache.has(language)) {
    return;
  }

  if (!fileLoader) {
    throw new Error('Bible books store not initialized. Call initializeBibleBooks() first.');
  }

  try {
    const books = await fileLoader.loadJSON<readonly BibleBookWithoutChapters[]>(
      `locales/bibleBooks/${language}.json`,
    );
    booksCache.set(language, books);
  } catch (error) {
    console.error(`Failed to load bible books for language ${language}`, error);
    throw new Error('errors.unsupportedLanguage');
  }
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
  const books = booksCache.get(language);

  if (!books) {
    console.error(`Bible books for language ${language} not loaded. Call loadBibleBooks() first.`);
    throw new Error('errors.unsupportedLanguage');
  }

  return books.map((book) => ({
    ...book,
    chapters: chapterCounts[book.id],
  }));
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
