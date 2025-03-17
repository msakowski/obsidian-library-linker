import { getBibleBooks } from '@/bibleBooks';
import type { BibleBook, Language } from '@/types';

export const findBook = (bookQuery: string, language: Language): BibleBook | BibleBook[] => {
  const trimmedQuerry = bookQuery
    .toLowerCase()
    .replace(/[/.\s]/g, '')
    .trim();

  if (!trimmedQuerry) {
    throw new Error('errors.bookNotFound');
  }

  const bibleBooks = getBibleBooks(language);

  if (!bibleBooks) {
    throw new Error('errors.bookNotFound');
  }

  const bookEntries = bibleBooks
    .filter((book) => (!book.prefix ? true : trimmedQuerry.match(/^[1-5]/)))
    .filter((book) => {
      const alias = book.aliases.map((alias) => (book.prefix ? `${book.prefix}${alias}` : alias));
      return alias.some((alias) => alias.startsWith(trimmedQuerry));
    })
    .map((book) => ({ ...book, idPadded: book.id.toString().padStart(2, '0') }));

  if (bookEntries.length > 1) {
    return bookEntries;
  }

  if (bookEntries.length === 1) {
    return bookEntries[0];
  }

  throw new Error('errors.bookNotFound');
};
