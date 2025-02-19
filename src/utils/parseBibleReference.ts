import { findBookIndex } from '@/utils/findBookIndex';

import type { BibleReference } from '@/types';

export function parseBibleReference(input: string): BibleReference {
  input = input.trim().toLowerCase();

  const match = input.match(/^([a-z0-9äöüß]+?)(?:\s*(\d+)\s*:\s*(\d+)(?:\s*-\s*(\d+))?$)/i);
  if (!match) {
    throw new Error('Invalid format');
  }

  const [, bookName, chapter, verseStart, verseEnd] = match;
  const bookIndex = findBookIndex(bookName.trim());
  if (bookIndex === -1) {
    throw new Error('Book not found');
  }

  return {
    book: bookIndex < 10 ? `0${bookIndex}` : bookIndex.toString(),
    chapter: chapter.padStart(3, '0'),
    verse: verseStart.padStart(3, '0'),
    endVerse: verseEnd ? verseEnd.padStart(3, '0') : undefined,
  };
}
