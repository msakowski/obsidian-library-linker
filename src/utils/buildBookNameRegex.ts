import type { Language } from '@/types';
import { getBibleBooks } from '@/stores/bibleBooks';
import { SINGLE_CHAPTER_BOOKS } from '@/consts/chapterCounts';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildBookNameRegex(language: Language): RegExp {
  const books = getBibleBooks(language);

  const allNames: string[] = [];
  const singleChapterNames: string[] = [];

  for (const book of books) {
    const isSingleChapter = SINGLE_CHAPTER_BOOKS.includes(book.id);
    // Collect all name variants
    const names = [book.name.short, book.name.medium, book.name.long];

    // Add aliases with prefix
    for (const alias of book.aliases) {
      if (book.prefix) {
        const variants = [
          `${book.prefix}${alias}`,
          `${book.prefix} ${alias}`,
          `${book.prefix}.${alias}`,
          `${book.prefix}. ${alias}`,
        ];
        allNames.push(...variants);
        if (isSingleChapter) singleChapterNames.push(...variants);
      } else {
        allNames.push(alias);
        if (isSingleChapter) singleChapterNames.push(alias);
      }
    }

    for (const name of names) {
      allNames.push(name);
      if (isSingleChapter) singleChapterNames.push(name);
      // For names ending with '.', also add the variant without the dot
      // so "Rev." also matches "Rev" and "Matt." also matches "Matt"
      if (name.endsWith('.')) {
        allNames.push(name.slice(0, -1));
        if (isSingleChapter) singleChapterNames.push(name.slice(0, -1));
      }
    }
  }

  // Deduplicate and filter empty
  const uniqueNames = [...new Set(allNames.filter((n) => n.length > 0))];
  const uniqueSingleChapterNames = [...new Set(singleChapterNames.filter((n) => n.length > 0))];

  // Sort by length descending — longest first for greedy matching
  uniqueNames.sort((a, b) => b.length - a.length);
  uniqueSingleChapterNames.sort((a, b) => b.length - a.length);

  // Escape regex special chars and join
  const bookPattern = uniqueNames.map(escapeRegex).join('|');

  // Build full regex: book name + optional dot/space + chapter:verse pattern
  const chapterVersePattern = '\\.?\\s?\\d+:\\d+(?:-\\d+(?::\\d+)?)?(?:\\s*,\\s*\\d+(?:-\\d+)?)*';

  // Single-chapter books also match verse-only format (e.g., "Jude 3", "Judas 1-5")
  const singleChapterBookPattern = uniqueSingleChapterNames.map(escapeRegex).join('|');
  const verseOnlyPattern = '\\.?\\s?\\d+(?:-\\d+)?(?:\\s*,\\s*\\d+(?:-\\d+)?)*';

  // Combine: (any book + chapter:verse) OR (single-chapter book + verse-only)
  // chapter:verse pattern listed first so "Jude 1:3" matches fully rather than just "Jude 1"
  const combined = singleChapterBookPattern
    ? `(?:${bookPattern})${chapterVersePattern}|(?:${singleChapterBookPattern})${verseOnlyPattern}`
    : `(?:${bookPattern})${chapterVersePattern}`;

  return new RegExp(combined, 'giu');
}
