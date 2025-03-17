import { getBibleBookById } from '@/bibleBooks';
import type { BibleReference, Language } from '@/types';

export function formatBibleText(
  reference: BibleReference,
  short = false,
  language: Language,
): string {
  const bookEntry = getBibleBookById(reference.book, language);

  console.log(bookEntry);

  if (!bookEntry) {
    throw new Error('errors.bookNotFound');
  }

  const bookName = short ? bookEntry.shortName : bookEntry.longName;

  // Format the verse reference
  const verseRefs = reference.verseRanges!.map(({ start, end }) =>
    start === end ? start.toString() : `${start}-${end}`,
  );

  return `${bookName} ${reference.chapter}:${verseRefs.join(',')}`;
}
