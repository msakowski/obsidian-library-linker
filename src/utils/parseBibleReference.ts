import { findBook } from '@/utils/findBook';
import type { BibleReference, Language, VerseRange } from '@/types';
import { Notice } from 'obsidian';
import { TranslationService } from '@/services/TranslationService';

function parseVerseNumber(verse: string): number {
  const t = TranslationService.getInstance().t.bind(TranslationService.getInstance());
  const num = parseInt(verse, 10);
  if (isNaN(num) || num < 1) {
    new Notice(t('errors.invalidVerseNumber'));
    return 1;
  }
  return num;
}

function padVerse(verse: number): string {
  return verse.toString().padStart(3, '0');
}

function parseVerseRanges(versePart: string): VerseRange[] | null {
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
    new Notice(t('errors.invalidVerseNumber'));
    return null;
  }

  const ranges: VerseRange[] = [];
  let lastEndVerse = 0;
  let currentRange: VerseRange | null = null;

  for (const part of parts) {
    // Check for invalid patterns like "1-2-3" or "1--2"
    if ((part.match(/-/g) || []).length > 1 || part.includes('--')) {
      new Notice(t('errors.invalidVerseNumber'));
      return null;
    }

    // Handle range (e.g., "7-8")
    if (part.includes('-')) {
      const [start, end] = part.split('-').map((v) => {
        if (!v || v.startsWith('-')) {
          new Notice(t('errors.invalidVerseNumber'));
          return null;
        }
        return parseVerseNumber(v);
      });

      if (start === null || end === null) {
        return null;
      }

      if (start >= end) {
        // This catches both equal and descending cases
        new Notice(t('errors.versesAscendingOrder'));
        return null;
      }

      if (start <= lastEndVerse) {
        new Notice(t('errors.versesAscendingOrder'));
        return null;
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
        new Notice(t('errors.versesAscendingOrder'));
        return null;
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

export function parseBibleReference(input: string, language: Language): BibleReference | null {
  const t = TranslationService.getInstance().t.bind(TranslationService.getInstance());
  input = input.trim().toLowerCase();

  // Match book, chapter, and verses part
  const match = input.match(/^([a-z0-9äöüß]+?)\s*(\d+)\s*:\s*(.+)$/i);
  if (!match) {
    new Notice(t('errors.invalidFormat'));
    return null;
  }

  const [, bookName, chapter, versesPart] = match;

  const book = findBook(bookName, language);
  if (!book) {
    new Notice(t('errors.bookNotFound', { book: bookName }));
    return null;
  }

  const paddedBook = book.id < 10 ? `0${book.id}` : book.id.toString();
  const paddedChapter = chapter.padStart(3, '0');

  // Simple verse or range pattern
  const simpleMatch = versesPart.match(/^(\d+)(?:-(\d+))?$/);
  if (simpleMatch) {
    const [, verse, endVerse] = simpleMatch;
    if (endVerse && parseVerseNumber(verse) >= parseVerseNumber(endVerse)) {
      new Notice(t('errors.versesAscendingOrder'));
      return null;
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
    if (!verseRanges) {
      return null;
    }
    return {
      book: paddedBook,
      chapter: paddedChapter,
      verseRanges,
    };
  } catch (error) {
    new Notice(t('errors.invalidFormat'));
    return null;
  }
}
