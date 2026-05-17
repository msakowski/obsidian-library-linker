import { bibleBookExists } from '@/utils/bibleBookExists';
import type { BibleReference, Language, LinkFormat } from '@/types';
import { padBook, padChapter, padVerse } from '@/utils/padNumber';

export function formatJWLibraryLink(
  reference: BibleReference,
  language?: Language,
  linkFormat: LinkFormat = 'jwlibrary',
): string | string[] {
  const { book, chapter, endChapter, verseRanges } = reference;

  if (!bibleBookExists(book)) {
    throw new Error('errors.bookNotFound');
  }

  if (!verseRanges) {
    throw new Error('errors.invalidReferenceFormat');
  }

  const padRange = (book: number, chapter: number, start: number) =>
    `${padBook(book)}${padChapter(chapter)}${padVerse(start)}`;

  const link = (range: string) => {
    if (linkFormat === 'jworg-finder') {
      const locale = language ?? 'E';
      return `https://www.jw.org/finder?srcid=jwlshare&wtlocale=${locale}&prefer=lang&bible=${range}&pub=nwtsty`;
    }
    // Default: jwlibrary://
    return `jwlibrary:///finder?bible=${range}${language ? `&wtlocale=${language}` : ''}`;
  };

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
