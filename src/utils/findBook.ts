import type { BibleBook, Language } from '@/types';
import { getBibleBooks } from '@/stores/bibleBooks';
import { logger } from '@/utils/logger';

const cleanTerm = (name: string): string => {
  return name.toLowerCase().replace(/[/.\s'\u2019\u02BC-]/g, '');
};

const getSearchTerms = (book: BibleBook): string[] => {
  // Clean the name versions (they already include the prefix like "1 Samuel")
  const cleanedNameVersions = [
    cleanTerm(book.name.short),
    cleanTerm(book.name.medium),
    cleanTerm(book.name.long),
  ];

  // Clean the aliases and prepend prefix if book has one
  const cleanedAliases = book.aliases.map((alias) =>
    book.prefix ? `${book.prefix}${cleanTerm(alias)}` : cleanTerm(alias),
  );

  return [...cleanedAliases, ...cleanedNameVersions];
};

export const findBook = (bookQuery: string, language: Language): BibleBook | BibleBook[] => {
  const trimmedQuerry = cleanTerm(bookQuery);

  if (!trimmedQuerry) {
    logger.error('Book query is empty', { bookQuery, trimmedQuerry });
    throw new Error('errors.bookNotFound');
  }

  const bibleBooks = getBibleBooks(language);

  if (!bibleBooks) {
    logger.error('No bible books found', { bookQuery, trimmedQuerry });
    throw new Error('errors.bookNotFound');
  }

  // An exact match wins over a prefix match. Without this, a query that is both the
  // short name of one book and the prefix of another resolves to several books and is
  // rejected as ambiguous (e.g. Ukrainian "Іс" is Isaiah 23, but also prefixes
  // Joshua's "Іс. Нав.").
  const exactMatches = bibleBooks
    .filter((book) => (!book.prefix ? true : trimmedQuerry.match(/^[1-5]/)))
    .filter((book) => getSearchTerms(book).some((term) => term === trimmedQuerry))
    .map((book) => ({ ...book, idPadded: book.id.toString().padStart(2, '0') }));

  if (exactMatches.length === 1) {
    return exactMatches[0];
  }

  const bookEntries = bibleBooks
    .filter((book) => (!book.prefix ? true : trimmedQuerry.match(/^[1-5]/)))
    .filter((book) => getSearchTerms(book).some((term) => term.startsWith(trimmedQuerry)))
    .map((book) => ({ ...book, idPadded: book.id.toString().padStart(2, '0') }));

  if (bookEntries.length > 1) {
    return bookEntries;
  }

  if (bookEntries.length === 1) {
    return bookEntries[0];
  }

  throw new Error('errors.bookNotFound');
};
