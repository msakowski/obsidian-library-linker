import { Notice } from 'obsidian';
import { bibleBooksDE } from '../bibleBooks';

export const findBook = (bookQuery: string) => {
  bookQuery = bookQuery
    .toLowerCase()
    .replace(/[/.\s]/g, '')
    .trim();

  const bookEntries = bibleBooksDE
    .filter((book) => (!book.prefix ? true : bookQuery.match(/^[1-5]/)))
    .filter((book) => {
      const alias = book.aliases.map((alias) => (book.prefix ? `${book.prefix}${alias}` : alias));
      return alias.some((alias) => alias.includes(bookQuery));
    });

  if (bookEntries.length > 1) {
    new Notice(
      `Es wurden mehrere Bibelbücher gefunden: ${bookEntries.map((book) => book.longName).join(', ')}`,
    );
    return null;
  }

  if (bookEntries.length === 1) {
    return bookEntries[0];
  }

  return null;
};
