import { getBibleBookById } from '@/bibleBooks';
import { SINGLE_CHAPTER_BOOKS } from '@/bibleBooks/chapterCounts';
import type { BibleReference, Language, BookLength } from '@/types';

export function formatBibleText(
  reference: BibleReference,
  bookLength: BookLength,
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

  // Single-chapter books don't need "chapter:" prefix
  const isSingleChapterBook = SINGLE_CHAPTER_BOOKS.includes(reference.book);
  if (isSingleChapterBook) {
    return `${bookName} ${verseRefs.join(',')}`;
  }

  return `${bookName} ${reference.chapter}:${verseRefs.join(',')}`;
}
