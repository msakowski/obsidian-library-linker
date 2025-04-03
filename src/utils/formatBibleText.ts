import { getBibleBookById } from '@/bibleBooks';
import type { BibleReference, Language, LinkLength } from '@/types';

export function formatBibleText(
  reference: BibleReference,
  bookLength: LinkLength,
  language: Language,
): string {
  const bookEntry = getBibleBookById(reference.book, language);

  if (!bookEntry) {
    throw new Error('errors.bookNotFound');
  }

  const bookName = bookEntry.name[bookLength];

  // Format the verse reference
  const verseRefs = reference.verseRanges!.map(({ start, end }) =>
    start === end ? start.toString() : `${start}-${end}`,
  );

  return `${bookName} ${reference.chapter}:${verseRefs.join(',')}`;
}
