import { bibleBookExists } from '@/bibleBooks';
import type { BibleReference, Language } from '@/types';
import { padBook, padChapter, padVerse } from '@/utils/padNumber';

export function formatJWLibraryLink(
  reference: BibleReference,
  language?: Language,
): string | string[] {
  const { book, chapter, verseRanges } = reference;

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

  // For a single range, return a single string
  if (verseRanges.length === 1) {
    const { start, end } = verseRanges[0];
    const baseReference = padRange(book, chapter, start);

    if (start === end) {
      return link(baseReference);
    }

    return link(`${baseReference}-${padRange(book, chapter, end)}`);
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
