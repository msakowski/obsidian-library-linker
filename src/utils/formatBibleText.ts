import { SINGLE_CHAPTER_BOOKS } from '@/consts/chapterCounts';
import type { BibleReference, Language, BookLength } from '@/types';
import { getBibleBookById } from '@/stores/bibleBooks';

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

  // Handle multi-chapter references
  if (reference.endChapter && reference.endChapter !== reference.chapter) {
    // For multi-chapter references, the verseRanges contain start verse and end verse
    const startVerse = reference.verseRanges![0].start;
    const endVerse = reference.verseRanges![0].end;
    return `${bookName} ${reference.chapter}:${startVerse}-${reference.endChapter}:${endVerse}`;
  }

  return `${bookName} ${reference.chapter}:${verseRefs.join(',')}`;
}
