import { getBibleBooks } from '@/bibleBooks';
import type { BibleBook, Language } from '@/types';
import { TranslationService } from '@/services/TranslationService';

// Define a return type that includes both the book and any notification message
export interface FindBookResult {
  book: BibleBook | null;
  notification?: string;
}

export const findBook = (bookQuery: string, language: Language): FindBookResult => {
  const t = TranslationService.getInstance().t.bind(TranslationService.getInstance());

  bookQuery = bookQuery
    .toLowerCase()
    .replace(/[/.\s]/g, '')
    .trim();

  const bibleBooks = getBibleBooks(language);
  if (!bibleBooks) {
    return { book: null };
  }

  const bookEntries = bibleBooks
    .filter((book) => (!book.prefix ? true : bookQuery.match(/^[1-5]/)))
    .filter((book) => {
      const alias = book.aliases.map((alias) => (book.prefix ? `${book.prefix}${alias}` : alias));
      return alias.some((alias) => alias.includes(bookQuery));
    });

  if (bookEntries.length > 1) {
    return {
      book: null,
      notification: t('errors.multipleBooksFound', {
        books: bookEntries.map((book) => book.longName).join(', '),
      }),
    };
  }

  if (bookEntries.length === 1) {
    return { book: bookEntries[0] };
  }

  return {
    book: null,
    notification: t('errors.bookNotFound'),
  };
};
