import type { BibleBook, Language } from '@/types';
import { getBibleBooks } from '@/stores/bibleBooks';
import { logger } from '@/utils/logger';

const cleanTerm = (name: string): string => {
  return name.toLowerCase().replace(/[/.\s-]/g, '');
};

export const findBook = (
  bookQuery: string,
  language: Language,
  { preferExactMatch = false }: { preferExactMatch?: boolean } = {},
): BibleBook | BibleBook[] => {
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

  const exactBookIds = new Set<number>();
  const bookEntries = bibleBooks
    .filter((book) => (!book.prefix ? true : trimmedQuerry.match(/^[1-5]/)))
    .filter((book) => {
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

      const allSearchTerms = [...cleanedAliases, ...cleanedNameVersions];
      if (allSearchTerms.includes(trimmedQuerry)) {
        exactBookIds.add(book.id);
      }
      return allSearchTerms.some((term) => term.startsWith(trimmedQuerry));
    })
    .map((book) => ({ ...book, idPadded: book.id.toString().padStart(2, '0') }));

  const matches =
    preferExactMatch && exactBookIds.size > 0
      ? bookEntries.filter((book) => exactBookIds.has(book.id))
      : bookEntries;

  if (matches.length > 1) {
    return matches;
  }

  if (matches.length === 1) {
    return matches[0];
  }

  throw new Error('errors.bookNotFound');
};
