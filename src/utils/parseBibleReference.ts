import { findBook } from '@/utils/findBook';
import { SINGLE_CHAPTER_BOOKS } from '@/consts/chapterCounts';
import { getVerseCount } from '@/consts/verseCounts';
import { getLanguageSpecificChars } from '@/utils/getLanguageSpecificChars';
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
  input = input
    .trim()
    .toLowerCase()
    .replace(/[\.\s]/g, '');

  const customChars = getLanguageSpecificChars(language);

  // Match book, chapter, and verses part
  // Supports "Book chapter:verse", "Book verse" (for single-chapter books), "Book chapter" (for whole chapters), and "Book" (for whole single-chapter books)
  const match = input.match(
    new RegExp(
      `^([a-z0-9${customChars}\\uAC00-\\uD7AF\\u1100-\\u11FF\\u3130-\\u318F]+?)(?:(\\d+.*))?$`,
      'i',
    ),
  );

  if (!match) {
    throw new Error('errors.invalidFormat');
  }

  const [, bookName, remainder] = match;

  const book = findBook(bookName, language);

  if (!book) {
    throw new Error('errors.bookNotFound');
  }

  if (Array.isArray(book)) {
    console.log('multiple books found', book, bookName, remainder);
    throw new Error('errors.multipleBooksFound');
  }

  // Handle case where there's no remainder (just book name)
  if (!remainder) {
    // Only single-chapter books can be referenced without chapter/verse
    const isSingleChapterBook = SINGLE_CHAPTER_BOOKS.includes(book.id);
    if (!isSingleChapterBook) {
      throw new Error('errors.invalidFormat');
    }

    // Get the verse count for this single-chapter book
    const verseCount = getVerseCount(book.id, 1);
    if (!verseCount) {
      throw new Error('errors.invalidChapter');
    }

    return {
      book: book.id,
      chapter: 1,
      verseRanges: [
        {
          start: 1,
          end: verseCount,
        },
      ],
      isWholeChapter: true,
    };
  }

  // Check if remainder contains a colon (chapter:verse format)
  const colonIndex = remainder.indexOf(':');
  let numberPart: string;
  let versesPart: string | undefined;

  if (colonIndex > 0) {
    // Has colon: split into chapter and verses
    numberPart = remainder.substring(0, colonIndex);
    versesPart = remainder.substring(colonIndex + 1);
  } else {
    // No colon: entire remainder is the number (could be chapter or verse)
    numberPart = remainder;
    versesPart = undefined;
  }

  // Determine if this is a single-chapter book reference without colon
  const isSingleChapterBook = SINGLE_CHAPTER_BOOKS.includes(book.id);
  const hasColon = versesPart !== undefined;

  let chapter: number;
  let actualVersesPart: string;

  if (!hasColon) {
    // No colon - could be "Book verse" (single-chapter) or "Book chapter" (whole chapter)
    if (isSingleChapterBook) {
      // For single-chapter books, treat numberPart as verse
      chapter = 1;
      actualVersesPart = numberPart;
    } else {
      // For multi-chapter books without colon, treat as whole chapter reference
      chapter = parseInt(numberPart, 10);
      if (chapter < 1 || (book.chapters !== undefined && chapter > book.chapters)) {
        throw new Error('errors.invalidChapter');
      }
      actualVersesPart = ''; // Empty indicates whole chapter
    }
  } else {
    // Has colon - format is "Book chapter:verse"
    chapter = parseInt(numberPart, 10);
    actualVersesPart = versesPart as string; // TypeScript: versesPart is defined when hasColon is true

    if (chapter < 1 || (book.chapters !== undefined && chapter > book.chapters)) {
      throw new Error('errors.invalidChapter');
    }
  }

  // Check for multi-chapter reference (e.g., "1-4:11" meaning verse 1 to chapter 4 verse 11)
  const multiChapterMatch = actualVersesPart.match(/^(\d+)-(\d+):(\d+)$/);
  if (multiChapterMatch) {
    const [, startVerse, endChapter, endVerse] = multiChapterMatch;
    const startVerseNumber = parseVerseNumber(startVerse);
    const endChapterNumber = parseInt(endChapter, 10);
    const endVerseNumber = parseVerseNumber(endVerse);

    // Validate end chapter
    if (endChapterNumber < 1 || (book.chapters !== undefined && endChapterNumber > book.chapters)) {
      throw new Error('errors.invalidChapter');
    }

    // End chapter must be greater than start chapter
    const startChapterNumber = chapter;
    if (endChapterNumber <= startChapterNumber) {
      throw new Error('errors.chaptersAscendingOrder');
    }

    return {
      book: book.id,
      chapter: startChapterNumber,
      endChapter: endChapterNumber,
      verseRanges: [
        {
          start: startVerseNumber,
          end: endVerseNumber,
        },
      ],
    };
  }

  // Check if this is a chapter-only reference (no verses specified)
  // This happens when user inputs like "1 Kings 1" or "John 3"
  if (actualVersesPart === '' || actualVersesPart.match(/^\s*$/)) {
    // Get the verse count for this chapter to create a full chapter range
    const verseCount = getVerseCount(book.id, chapter);
    if (!verseCount) {
      throw new Error('errors.invalidChapter');
    }

    return {
      book: book.id,
      chapter: chapter,
      verseRanges: [
        {
          start: 1,
          end: verseCount,
        },
      ],
      isWholeChapter: true,
    };
  }

  const versesPartMatch = actualVersesPart.match(/^(\d+)(?:-(\d*))?$/);

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
        chapter: chapter,
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
      chapter: chapter,
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
  const result = parseVerseRanges(actualVersesPart);

  return {
    book: book.id,
    chapter: chapter,
    verseRanges: result,
  };
}

export const parseBibleReferenceFromUrl = (url: string, language: Language): BibleReference => {
  // Replace 'jwpub://' with 'jwlibrary://'
  url = url.replace('jwpub://', 'jwlibrary://');
  // Extract the Bible reference parts
  const parts = url.split('/');
  const bibleRef = parts[parts.length - 1];

  // Extract book, chapter and verse
  const [startBookChapterVerse, endBookChapterVerse] = bibleRef.split('-');
  const [bookStart, chapterStart, verseStart] = startBookChapterVerse.split(':');
  const [, chapterEnd, verseEnd] = endBookChapterVerse.split(':');

  const startChapterNum = parseInt(chapterStart, 10);
  const endChapterNum = parseInt(chapterEnd, 10);

  // Handle multi-chapter references
  if (startChapterNum !== endChapterNum) {
    return {
      book: parseInt(bookStart, 10),
      chapter: startChapterNum,
      endChapter: endChapterNum,
      verseRanges: [
        {
          start: parseInt(verseStart, 10),
          end: parseInt(verseEnd, 10),
        },
      ],
    };
  }

  return {
    book: parseInt(bookStart, 10),
    chapter: startChapterNum,
    verseRanges: [
      {
        start: parseInt(verseStart, 10),
        end: parseInt(verseEnd, 10),
      },
    ],
  };
};
