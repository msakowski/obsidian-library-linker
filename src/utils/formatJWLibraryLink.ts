import { bibleBookExists } from '@/utils/bibleBookExists';
import type { BibleReference, Language } from '@/types';
import { padBook, padChapter, padVerse } from '@/utils/padNumber';

export function formatJWLibraryLink(
  reference: BibleReference,
  language?: Language,
): string | string[] {
  const { book, chapter, endChapter, verseRanges, isWholeChapter } = reference;

  if (!bibleBookExists(book)) {
    throw new Error('errors.bookNotFound');
  }

  if (!verseRanges) {
    throw new Error('errors.invalidReferenceFormat');
  }

  const link = (range: string) =>
    `jwlibrary:///finder?bible=${range}${language ? `&wtlocale=${language}` : ''}`;

  const padRange = (book: number, chapter: number, start: number) =>
    `${padBook(book)}${padChapter(chapter)}${padVerse(start)}`;

  // Handle whole chapter references with optimized format
  if (isWholeChapter && verseRanges.length === 1) {
    const baseReference = padRange(book, chapter, 0); // Start with verse 000
    const endReference = padRange(book, chapter, 99); // End with verse 99
    return link(`${baseReference}-${endReference}`);
  }

  // For a single range, return a single string
  if (verseRanges.length === 1) {
    const { start, end } = verseRanges[0];
    const startChapter = chapter;
    const endChapterValue = endChapter || chapter;
    const baseReference = padRange(book, startChapter, start);

    if (start === end && startChapter === endChapterValue) {
      return link(baseReference);
    }

    return link(`${baseReference}-${padRange(book, endChapterValue, end)}`);
  }

  // For multiple ranges, return an array of strings
  return verseRanges.map(({ start, end }) => {
    const baseReference = padRange(book, chapter, start);

    if (start === end) {
      return link(baseReference);
    }

    return link(`${baseReference}-${padRange(book, chapter, end)}`);
  });
}
