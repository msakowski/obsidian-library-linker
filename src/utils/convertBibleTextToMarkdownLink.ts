import { formatJWLibraryLink } from '@/utils/formatJWLibraryLink';
import { formatBibleText } from '@/utils/formatBibleText';
import { getBibleBooks } from '@/bibleBooks';
import type { BibleReference, LinkReplacerSettings, LinkStyles } from '@/types';

/**
 * Apply styling to the link text based on font style setting
 */
function applyFontStyle(text: string, fontStyle: LinkReplacerSettings['fontStyle']): string {
  switch (fontStyle) {
    case 'bold':
      return `**${text}**`;
    case 'italic':
      return `*${text}*`;
    case 'normal':
    default:
      return text;
  }
}

export function convertBibleTextToMarkdownLink(
  reference: BibleReference,
  settings: Omit<LinkReplacerSettings, 'updatedLinkStrukture' | 'openAutomatically'> & {
    updatedLinkStrukture?: LinkReplacerSettings['updatedLinkStrukture'];
  } & Partial<LinkStyles>,
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

  let bookName = bookEntry.name[settings.bookLength];

  if (settings.updatedLinkStrukture === 'keepCurrentStructure' && originalText) {
    // remove chapter and verses from original text
    bookName = originalText.replace(/\s*\d+:\d+(?:-\d+)?(?:\s*,\s*\d+(?:-\d+)?)*\s*$/, '');
  }

  // Get styling options with default empty strings for backward compatibility
  const prefixOutside = settings.prefixOutsideLink || '';
  const prefixInside = settings.prefixInsideLink || '';
  const suffixInside = settings.suffixInsideLink || '';
  const suffixOutside = settings.suffixOutsideLink || '';
  const fontStyle = settings.fontStyle || 'normal';

  if (Array.isArray(links)) {
    // Format verse ranges without leading zeros
    const verseRanges = reference.verseRanges!.map(({ start, end }) =>
      start === end ? start.toString() : `${start}-${end}`,
    );

    // Create array of markdown links
    const styledLinks = verseRanges
      .map((range, i) => {
        let linkText;
        if (i === 0) {
          // First link includes book name and chapter
          linkText = `${prefixInside}${bookName} ${reference.chapter}:${range}`;
        } else if (i === verseRanges.length - 1) {
          // Last link includes verse numbers and suffix
          linkText = `${range}${suffixInside}`;
        } else {
          // Subsequent links only include verse numbers
          linkText = `${range}`;
        }

        // Apply font styling
        linkText = applyFontStyle(linkText, fontStyle);

        return `[${linkText}](${links[i]})`;
      })
      .join(',');

    return `${prefixOutside}${styledLinks}${suffixOutside}`;
  }

  if (settings.updatedLinkStrukture === 'keepCurrentStructure' && originalText) {
    const linkText = applyFontStyle(`${prefixInside}${originalText}${suffixInside}`, fontStyle);
    return `${prefixOutside}[${linkText}](${links})${suffixOutside}`;
  }

  // For simple references
  const formattedText = formatBibleText(reference, settings.bookLength, settings.language);
  const linkText = applyFontStyle(`${prefixInside}${formattedText}${suffixInside}`, fontStyle);
  return `${prefixOutside}[${linkText}](${links})${suffixOutside}`;
}
