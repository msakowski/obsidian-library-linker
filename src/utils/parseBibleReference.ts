import { findBookIndex } from '@/utils/findBookIndex';
import type { BibleReference, VerseRange } from '@/types';

function parseVerseNumber(verse: string): number {
  const num = parseInt(verse, 10);
  if (isNaN(num) || num < 1) {
    throw new Error('Invalid verse number');
  }
  return num;
}

function padVerse(verse: number): string {
  return verse.toString().padStart(3, '0');
}

function parseVerseRanges(versePart: string): VerseRange[] {
  // Split by comma and clean up whitespace
  const parts = versePart
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  // Check for empty parts (consecutive commas)
  if (parts.length !== versePart.split(',').length) {
    throw new Error('Invalid verse number');
  }

  const ranges: VerseRange[] = [];
  let lastEndVerse = 0;
  let currentRange: VerseRange | null = null;

  for (const part of parts) {
    // Check for invalid patterns like "1-2-3" or "1--2"
    if ((part.match(/-/g) || []).length > 1 || part.includes('--')) {
      throw new Error('Invalid verse number');
    }

    // Handle range (e.g., "7-8")
    if (part.includes('-')) {
      const [start, end] = part.split('-').map((v) => {
        if (!v || v.startsWith('-')) {
          throw new Error('Invalid verse number');
        }
        return parseVerseNumber(v);
      });

      if (start >= end) {
        // This catches both equal and descending cases
        throw new Error('Verses must be in ascending order');
      }
      if (start <= lastEndVerse) {
        throw new Error('Verses must be in ascending order');
      }

      // If this range starts right after the current range, extend it
      if (currentRange && start === lastEndVerse + 1) {
        currentRange.end = padVerse(end);
      } else {
        currentRange = {
          start: padVerse(start),
          end: padVerse(end),
        };
        ranges.push(currentRange);
      }
      lastEndVerse = end;
    } else {
      // Handle single verse
      const verse = parseVerseNumber(part);
      if (verse <= lastEndVerse) {
        // This catches repeated verses
        throw new Error('Verses must be in ascending order');
      }

      // If this verse is consecutive with the current range, extend it
      if (currentRange && verse === lastEndVerse + 1) {
        currentRange.end = padVerse(verse);
      } else {
        currentRange = {
          start: padVerse(verse),
          end: padVerse(verse),
        };
        ranges.push(currentRange);
      }
      lastEndVerse = verse;
    }
  }

  return ranges;
}

export function parseBibleReference(input: string): BibleReference {
  input = input.trim().toLowerCase();

  // Match book, chapter, and verses part
  const match = input.match(/^([a-z0-9äöüß]+?)\s*(\d+)\s*:\s*(.+)$/i);
  if (!match) {
    throw new Error('Invalid format');
  }

  const [, bookName, chapter, versesPart] = match;
  const bookIndex = findBookIndex(bookName.trim());
  if (bookIndex === -1) {
    throw new Error('Book not found');
  }

  const paddedBook = bookIndex < 10 ? `0${bookIndex}` : bookIndex.toString();
  const paddedChapter = chapter.padStart(3, '0');

  // Simple verse or range pattern
  const simpleMatch = versesPart.match(/^(\d+)(?:-(\d+))?$/);
  if (simpleMatch) {
    const [, verse, endVerse] = simpleMatch;
    if (endVerse && parseVerseNumber(verse) >= parseVerseNumber(endVerse)) {
      throw new Error('Verses must be in ascending order');
    }
    return {
      book: paddedBook,
      chapter: paddedChapter,
      verseRanges: [
        {
          start: padVerse(parseVerseNumber(verse)),
          end: endVerse ? padVerse(parseVerseNumber(endVerse)) : padVerse(parseVerseNumber(verse)),
        },
      ],
    };
  }

  // Complex verse ranges
  try {
    const verseRanges = parseVerseRanges(versesPart);
    return {
      book: paddedBook,
      chapter: paddedChapter,
      verseRanges,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Invalid format');
  }
}
