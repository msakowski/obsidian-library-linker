import { findBook } from '@/utils/findBook';
import type { Language, VerseRange, BibleReference } from '@/types';

function parseVerseNumber(verse: string): number {
  const num = parseInt(verse, 10);
  if (isNaN(num) || num < 1) {
    throw new Error('errors.invalidVerseFormat');
  }
  return num;
}

function padVerse(verse: number): string {
  return verse.toString().padStart(3, '0');
}

function parseVerseRanges(versePart: string): VerseRange[] {
  // Remove any trailing commas
  versePart = versePart.trim();
  if (versePart.endsWith(',')) {
    versePart = versePart.slice(0, -1);
  }

  // Split by comma and clean up whitespace
  const parts = versePart
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  // Check for empty parts (consecutive commas)
  if (parts.length !== versePart.split(',').length) {
    throw new Error('errors.invalidVerseFormat');
  }

  const ranges: VerseRange[] = [];
  let lastEndVerse = 0;
  let currentRange: VerseRange | null = null;

  for (const part of parts) {
    // Check for invalid patterns like "1-2-3" or "1--2"
    if ((part.match(/-/g) || []).length > 1 || part.includes('--')) {
      throw new Error('errors.invalidVerseFormat');
    }

    // Handle range (e.g., "7-8")
    if (part.includes('-')) {
      const start = parseVerseNumber(part.split('-')[0]);
      const end = parseVerseNumber(part.split('-')[1]);

      if (start >= end) {
        // This catches both equal and descending cases
        throw new Error('errors.versesAscendingOrder');
      }

      if (start <= lastEndVerse) {
        throw new Error('errors.versesAscendingOrder');
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
        throw new Error('errors.versesAscendingOrder');
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

export function parseBibleReference(input: string, language: Language): BibleReference {
  input = input.trim().toLowerCase();

  // Match book, chapter, and verses part
  const match = input.match(/^([a-z0-9äöüß]+?)\s*(\d+)\s*:\s*(.+)$/i);
  if (!match) {
    throw new Error('errors.invalidFormat');
  }

  const [, bookName, chapter, versesPart] = match;

  const bookResult = findBook(bookName, language);
  if (!bookResult.book) {
    throw new Error('errors.bookNotFound');
  }

  const book = bookResult.book;
  const paddedBook = book.id < 10 ? `0${book.id}` : book.id.toString();
  const paddedChapter = chapter.padStart(3, '0');

  const versesPartMatch = versesPart.match(/^(\d+)(?:-(\d*))?$/);

  if (versesPartMatch) {
    const [, startVerse, endVerse] = versesPartMatch;
    const startVerseNumber = parseVerseNumber(startVerse);

    if (endVerse) {
      const endVerseNumber = parseVerseNumber(endVerse);

      if (startVerseNumber >= endVerseNumber) {
        throw new Error('errors.versesAscendingOrder');
      }

      return {
        book: paddedBook,
        chapter: paddedChapter,
        verseRanges: [
          {
            start: padVerse(startVerseNumber),
            end: padVerse(endVerseNumber),
          },
        ],
      };
    }

    return {
      book: paddedBook,
      chapter: paddedChapter,
      verseRanges: [
        {
          start: padVerse(startVerseNumber),
          end: padVerse(startVerseNumber),
        },
      ],
    };
  }

  // Complex verse ranges
  const result = parseVerseRanges(versesPart);

  return {
    book: paddedBook,
    chapter: paddedChapter,
    verseRanges: result,
  };
}
