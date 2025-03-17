import { findBook } from '@/utils/findBook';
import type { Language, VerseRange, BibleReference } from '@/types';

function parseVerseNumber(verse: string): number {
  const num = parseInt(verse, 10);
  if (isNaN(num) || num < 1) {
    throw new Error('errors.invalidVerseFormat');
  }
  return num;
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
        currentRange.end = end;
      } else {
        currentRange = {
          start,
          end,
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
        currentRange.end = verse;
      } else {
        currentRange = {
          start: verse,
          end: verse,
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

  const book = findBook(bookName, language);

  if (!book) {
    throw new Error('errors.bookNotFound');
  }

  if (Array.isArray(book)) {
    throw new Error('errors.multipleBooksFound');
  }

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
        book: book.id,
        chapter: parseInt(chapter, 10),
        verseRanges: [
          {
            start: startVerseNumber,
            end: endVerseNumber,
          },
        ],
      };
    }

    return {
      book: book.id,
      chapter: parseInt(chapter, 10),
      verseRanges: [
        {
          start: startVerseNumber,
          end: startVerseNumber,
        },
      ],
    };
  }

  // TODO: move parseVerseRanges to own file and include simple verse parsing

  // Complex verse ranges
  const result = parseVerseRanges(versesPart);

  return {
    book: book.id,
    chapter: parseInt(chapter, 10),
    verseRanges: result,
  };
}
