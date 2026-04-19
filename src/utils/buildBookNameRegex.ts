import type { Language } from '@/types';
import { getBibleBooks } from '@/stores/bibleBooks';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildBookNameRegex(language: Language): RegExp {
  const books = getBibleBooks(language);

  const allNames: string[] = [];

  for (const book of books) {
    // Collect all name variants
    const names = [book.name.short, book.name.medium, book.name.long];

    // Add aliases with prefix
    for (const alias of book.aliases) {
      if (book.prefix) {
        allNames.push(`${book.prefix}${alias}`);
        allNames.push(`${book.prefix} ${alias}`);
        allNames.push(`${book.prefix}.${alias}`);
        allNames.push(`${book.prefix}. ${alias}`);
      } else {
        allNames.push(alias);
      }
    }

    for (const name of names) {
      allNames.push(name);
      // For names ending with '.', also add the variant without the dot
      // so "Rev." also matches "Rev" and "Matt." also matches "Matt"
      if (name.endsWith('.')) {
        allNames.push(name.slice(0, -1));
      }
    }
  }

  // Deduplicate and filter empty
  const uniqueNames = [...new Set(allNames.filter((n) => n.length > 0))];

  // Sort by length descending — longest first for greedy matching
  uniqueNames.sort((a, b) => b.length - a.length);

  // Escape regex special chars and join
  const bookPattern = uniqueNames.map(escapeRegex).join('|');

  // Build full regex: book name + optional dot/space + chapter:verse pattern
  const chapterVersePattern = '\\.?\\s?\\d+:\\d+(?:-\\d+(?::\\d+)?)?(?:\\s*,\\s*\\d+(?:-\\d+)?)*';

  return new RegExp(`(?:${bookPattern})${chapterVersePattern}`, 'giu');
}
