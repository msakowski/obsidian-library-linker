import type { BibleReference, Language } from '@/types';

export function formatJWLibraryLink(
  reference: BibleReference,
  language?: Language,
): string | string[] {
  const { book, chapter, verseRanges } = reference;

  if (!verseRanges) {
    throw new Error('Invalid reference format');
  }

  const link = (range: string) =>
    `jwlibrary:///finder?bible=${range}${language ? `&wtlocale=${language}` : ''}`;

  // For a single range, return a single string
  if (verseRanges.length === 1) {
    const { start, end } = verseRanges[0];
    const baseReference = `${book}${chapter}${start}`;

    if (start === end) {
      return link(baseReference);
    }

    return link(`${baseReference}-${book}${chapter}${end}`);
  }

  // For multiple ranges, return an array of strings
  return verseRanges.map(({ start, end }) => {
    const baseReference = `${book}${chapter}${start}`;

    if (start === end) {
      return link(baseReference);
    }

    return link(`${baseReference}-${book}${chapter}${end}`);
  });
}
