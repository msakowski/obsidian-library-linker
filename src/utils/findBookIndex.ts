import { getBibleBooks } from '@/bibleBooks';
import type { Language } from '@/types';

export function findBookIndex(bookQuery: string, language: Language): number {
  bookQuery = bookQuery.toLowerCase().trim();
  for (const book of getBibleBooks(language)) {
    if (book.aliases.includes(bookQuery)) {
      return book.id;
    }
  }
  return -1;
}
