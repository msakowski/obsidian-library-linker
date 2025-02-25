import { Notice } from 'obsidian';
import { getBibleBooks } from '@/bibleBooks';
import type { Language } from '@/types';
import { TranslationService } from '@/services/TranslationService';

export const findBook = (bookQuery: string, language: Language) => {
  const t = TranslationService.getInstance().t.bind(TranslationService.getInstance());

  bookQuery = bookQuery
    .toLowerCase()
    .replace(/[/.\s]/g, '')
    .trim();

  const bibleBooks = getBibleBooks(language);

  const bookEntries = bibleBooks
    .filter((book) => (!book.prefix ? true : bookQuery.match(/^[1-5]/)))
    .filter((book) => {
      const alias = book.aliases.map((alias) => (book.prefix ? `${book.prefix}${alias}` : alias));
      return alias.some((alias) => alias.includes(bookQuery));
    });

  if (bookEntries.length > 1) {
    new Notice(
      t('errors.multipleBooksFound', {
        books: bookEntries.map((book) => book.longName).join(', '),
      }),
    );
    return null;
  }

  if (bookEntries.length === 1) {
    return bookEntries[0];
  }

  new Notice(t('errors.bookNotFound'));

  return null;
};
