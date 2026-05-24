import { bibleBookExists } from '@/utils/bibleBookExists';
import type { BibleReference, Language } from '@/types';
import { padBook, padChapter, padVerse } from '@/utils/padNumber';
import { normalizeRange } from '@/utils/normalizeRange';

export function formatJWLibraryLink(
  reference: BibleReference,
  language?: Language,
): string | string[] {
  const { book, ranges } = reference;

  if (!bibleBookExists(book)) {
    throw new Error('errors.bookNotFound');
  }

  if (!ranges.length) {
    throw new Error('errors.invalidReferenceFormat');
  }

  const link = (range: string) =>
    `jwlibrary:///finder?bible=${range}${language ? `&wtlocale=${language}` : ''}`;

  const padRange = (book: number, chapter: number, start: number) =>
    `${padBook(book)}${padChapter(chapter)}${padVerse(start)}`;

  // For a single range, return a single string
  if (ranges.length === 1) {
    const { chapterStart, chapterEnd, verseStart, verseEnd } = normalizeRange(ranges[0]);
    const baseReference = padRange(book, chapterStart, verseStart);

    if (verseStart === verseEnd && chapterStart === chapterEnd) {
      return link(baseReference);
    }

    return link(`${baseReference}-${padRange(book, chapterEnd, verseEnd)}`);
  }

  // For multiple ranges, return an array of strings
  return ranges.map((r) => {
    const { chapterStart, chapterEnd, verseStart, verseEnd } = normalizeRange(r);
    const baseReference = padRange(book, chapterStart, verseStart);

    if (verseStart === verseEnd && chapterStart === chapterEnd) {
      return link(baseReference);
    }

    return link(`${baseReference}-${padRange(book, chapterEnd, verseEnd)}`);
  });
}
