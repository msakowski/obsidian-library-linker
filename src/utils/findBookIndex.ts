import { bibleBooksDE } from '@/bibleBooks';

export function findBookIndex(bookQuery: string): number {
  bookQuery = bookQuery.toLowerCase().trim();
  for (const book of bibleBooksDE) {
    if (book.aliases.includes(bookQuery)) {
      return book.id;
    }
  }
  return -1;
}
