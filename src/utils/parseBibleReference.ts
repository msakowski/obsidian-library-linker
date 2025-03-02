import { findBook } from '@/utils/findBook';
import type { Language, VerseRange, ParseResult } from '@/types';
import { TranslationService } from '@/services/TranslationService';

function parseVerseNumber(verse: string): { value: number; error?: string } {
  const t = TranslationService.getInstance().t.bind(TranslationService.getInstance());
  const num = parseInt(verse, 10);
  if (isNaN(num) || num < 1) {
    return { value: 1, error: t('errors.invalidVerseNumber') };
  }
  return { value: num };
}

function padVerse(verse: number): string {
  return verse.toString().padStart(3, '0');
}

function parseVerseRanges(versePart: string): { ranges: VerseRange[] | null; error?: string } {
  const t = TranslationService.getInstance().t.bind(TranslationService.getInstance());
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
    return { ranges: null, error: t('errors.invalidVerseNumber') };
  }

  const ranges: VerseRange[] = [];
  let lastEndVerse = 0;
  let currentRange: VerseRange | null = null;

  for (const part of parts) {
    // Check for invalid patterns like "1-2-3" or "1--2"
    if ((part.match(/-/g) || []).length > 1 || part.includes('--')) {
      return { ranges: null, error: t('errors.invalidVerseNumber') };
    }

    // Handle range (e.g., "7-8")
    if (part.includes('-')) {
      const startResult = parseVerseNumber(part.split('-')[0]);
      const endResult = parseVerseNumber(part.split('-')[1]);

      if (startResult.error) return { ranges: null, error: startResult.error };
      if (endResult.error) return { ranges: null, error: endResult.error };

      const start = startResult.value;
      const end = endResult.value;

      if (start >= end) {
        // This catches both equal and descending cases
        return { ranges: null, error: t('errors.versesAscendingOrder') };
      }

      if (start <= lastEndVerse) {
        return { ranges: null, error: t('errors.versesAscendingOrder') };
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
      const verseResult = parseVerseNumber(part);
      if (verseResult.error) return { ranges: null, error: verseResult.error };

      const verse = verseResult.value;
      if (verse <= lastEndVerse) {
        // This catches repeated verses
        return { ranges: null, error: t('errors.versesAscendingOrder') };
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

  return { ranges };
}

export function parseBibleReference(input: string, language: Language): ParseResult {
  const t = TranslationService.getInstance().t.bind(TranslationService.getInstance());
  input = input.trim().toLowerCase();

  // Match book, chapter, and verses part
  const match = input.match(/^([a-z0-9äöüß]+?)\s*(\d+)\s*:\s*(.+)$/i);
  if (!match) {
    return { reference: null, error: t('errors.invalidFormat') };
  }

  const [, bookName, chapter, versesPart] = match;

  const bookResult = findBook(bookName, language);
  if (!bookResult.book) {
    return {
      reference: null,
      error: bookResult.notification || t('errors.bookNotFound', { book: bookName }),
    };
  }

  const book = bookResult.book;
  const paddedBook = book.id < 10 ? `0${book.id}` : book.id.toString();
  const paddedChapter = chapter.padStart(3, '0');

  // Simple verse or range pattern
  const simpleMatch = versesPart.match(/^(\d+)(?:-(\d+))?$/);
  if (simpleMatch) {
    const [, verse, endVerse] = simpleMatch;
    const startVerseResult = parseVerseNumber(verse);

    if (startVerseResult.error) {
      return { reference: null, error: startVerseResult.error };
    }

    if (endVerse) {
      const endVerseResult = parseVerseNumber(endVerse);
      if (endVerseResult.error) {
        return { reference: null, error: endVerseResult.error };
      }

      if (startVerseResult.value >= endVerseResult.value) {
        return { reference: null, error: t('errors.versesAscendingOrder') };
      }

      return {
        reference: {
          book: paddedBook,
          chapter: paddedChapter,
          verseRanges: [
            {
              start: padVerse(startVerseResult.value),
              end: padVerse(endVerseResult.value),
            },
          ],
        },
      };
    }

    return {
      reference: {
        book: paddedBook,
        chapter: paddedChapter,
        verseRanges: [
          {
            start: padVerse(startVerseResult.value),
            end: padVerse(startVerseResult.value),
          },
        ],
      },
    };
  }

  // Complex verse ranges
  try {
    const result = parseVerseRanges(versesPart);
    if (result.error || !result.ranges) {
      return { reference: null, error: result.error };
    }

    return {
      reference: {
        book: paddedBook,
        chapter: paddedChapter,
        verseRanges: result.ranges,
      },
    };
  } catch (error) {
    return { reference: null, error: t('errors.invalidFormat') };
  }
}
