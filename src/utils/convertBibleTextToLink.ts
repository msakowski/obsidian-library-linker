import { formatJWLibraryLink } from '@/utils/formatJWLibraryLink';
import { formatBibleText } from '@/utils/formatBibleText';
import { getBibleBooks } from '@/bibleBooks';
import type { BibleReference, Language } from '@/types';

// TODO: can be removed
export function convertBibleTextToLink(
  reference: BibleReference,
  language: Language,
): string | string[] {
  return formatJWLibraryLink(reference, language);
}

export function convertBibleTextToMarkdownLink(
  reference: BibleReference,
  short = false,
  language: Language,
): string | undefined {
  const links = formatJWLibraryLink(reference, language);

  // Early return input if there are no valid links
  if (!links || (Array.isArray(links) && !links.length)) {
    throw new Error('errors.noValidLinks');
  }

  const bookEntry = getBibleBooks(language)?.find((book) => book.id === reference.book);

  if (!bookEntry) {
    throw new Error('errors.bookNotFound');
  }

  const bookName = short ? bookEntry.shortName : bookEntry.longName;

  if (Array.isArray(links)) {
    // Format verse ranges without leading zeros
    const verseRanges = reference.verseRanges!.map(({ start, end }) =>
      start === end ? start.toString() : `${start}-${end}`,
    );

    // Create array of markdown links
    return verseRanges
      .map((range, i) => {
        if (i === 0) {
          // First link includes book name and chapter
          return `[${bookName} ${reference.chapter}:${range}](${links[i]})`;
        }
        // Subsequent links only include verse numbers
        return `[${range}](${links[i]})`;
      })
      .join(',');
  }

  // For simple references
  const formattedText = formatBibleText(reference, short, language);
  return `[${formattedText}](${links})`;
}
