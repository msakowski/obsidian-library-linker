import { SINGLE_CHAPTER_BOOKS } from '@/consts/chapterCounts';
import type { BibleReference, Language, BookLength } from '@/types';
import { getBibleBookById } from '@/stores/bibleBooks';
import { normalizeRange } from '@/utils/normalizeRange';

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

  if (!reference.ranges.length) {
    throw new Error('errors.invalidReferenceFormat');
  }

  const first = normalizeRange(reference.ranges[0]);

  // Format the verse part for same-chapter ranges
  const verseRefs = reference.ranges.map((r) => {
    const n = normalizeRange(r);
    return n.verseStart === n.verseEnd ? n.verseStart.toString() : `${n.verseStart}-${n.verseEnd}`;
  });

  // Single-chapter books don't need "chapter:" prefix
  const isSingleChapterBook = SINGLE_CHAPTER_BOOKS.includes(reference.book);
  if (isSingleChapterBook) {
    return `${bookName} ${verseRefs.join(',')}`;
  }

  // Handle multi-chapter references (single range that spans chapters)
  if (first.chapterStart !== first.chapterEnd) {
    return `${bookName} ${first.chapterStart}:${first.verseStart}-${first.chapterEnd}:${first.verseEnd}`;
  }

  return `${bookName} ${first.chapterStart}:${verseRefs.join(',')}`;
}
