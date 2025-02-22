import type { BibleReference } from '@/types';

export function formatJWLibraryLink(reference: BibleReference): string | string[] {
  const { book, chapter, verseRanges } = reference;

  if (!verseRanges) {
    throw new Error('Invalid reference format');
  }

  // For a single range, return a single string
  if (verseRanges.length === 1) {
    const { start, end } = verseRanges[0];
    const baseReference = `${book}${chapter}${start}`;
    return start === end
      ? `jwlibrary:///finder?bible=${baseReference}`
      : `jwlibrary:///finder?bible=${baseReference}-${book}${chapter}${end}`;
  }

  // For multiple ranges, return an array of strings
  return verseRanges.map(({ start, end }) => {
    const baseReference = `${book}${chapter}${start}`;
    return start === end
      ? `jwlibrary:///finder?bible=${baseReference}`
      : `jwlibrary:///finder?bible=${baseReference}-${book}${chapter}${end}`;
  });
}
