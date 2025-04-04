import { formatJWLibraryLink } from '@/utils/formatJWLibraryLink';
import { formatBibleText } from '@/utils/formatBibleText';
import { getBibleBooks } from '@/bibleBooks';
import type { BibleReference, LinkReplacerSettings } from '@/types';

export function convertBibleTextToMarkdownLink(
  reference: BibleReference,
  settings: Omit<LinkReplacerSettings, 'updatedLinkStrukture' | 'openAutomatically'> & {
    updatedLinkStrukture?: LinkReplacerSettings['updatedLinkStrukture'];
  },
  originalText?: string,
): string | undefined {
  const links = formatJWLibraryLink(
    reference,
    settings.noLanguageParameter ? undefined : settings.language,
  );

  // Early return input if there are no valid links
  if (!links || (Array.isArray(links) && !links.length)) {
    throw new Error('errors.noValidLinks');
  }

  const bookEntry = getBibleBooks(settings.language)?.find((book) => book.id === reference.book);

  if (!bookEntry) {
    throw new Error('errors.bookNotFound');
  }

  let bookName = settings.useShortNames ? bookEntry.shortName : bookEntry.longName;

  if (settings.updatedLinkStrukture === 'keepCurrentStructure' && originalText) {
    // remove chapter and verses from original text
    bookName = originalText.replace(/\s*\d+:\d+(?:-\d+)?(?:\s*,\s*\d+(?:-\d+)?)*\s*$/, '');
  }

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

  if (settings.updatedLinkStrukture === 'keepCurrentStructure' && originalText) {
    return `[${originalText}](${links})`;
  }

  // For simple references
  const formattedText = formatBibleText(reference, settings.useShortNames, settings.language);
  return `[${formattedText}](${links})`;
}
