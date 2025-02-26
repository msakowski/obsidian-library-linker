import { parseBibleReference } from '@/utils/parseBibleReference';
import { formatJWLibraryLink } from '@/utils/formatJWLibraryLink';
import { formatBibleText } from '@/utils/formatBibleText';
import { getBibleBooks } from '@/bibleBooks';
import type { Language } from '@/types';
import { Notice } from 'obsidian';
import { TranslationService } from '@/services/TranslationService';

export function convertBibleTextToLink(input: string, language: Language): string | string[] {
  const t = TranslationService.getInstance().t.bind(TranslationService.getInstance());

  try {
    const reference = parseBibleReference(input, language);
    if (!reference) {
      return input;
    }
    return formatJWLibraryLink(reference, language);
  } catch (error) {
    new Notice(
      t('errors.conversionError', {
        message: error instanceof Error ? error.message : String(error),
      }),
    );
    return input;
  }
}

export function convertBibleTextToMarkdownLink(
  input: string,
  short = false,
  language: Language,
): string {
  const t = TranslationService.getInstance().t.bind(TranslationService.getInstance());

  try {
    const reference = parseBibleReference(input, language);
    if (!reference) {
      return input;
    }
    const links = formatJWLibraryLink(reference, language);

    // Early return input if there are no valid links
    if (!links || (Array.isArray(links) && !links.length)) {
      return input;
    }

    if (Array.isArray(links)) {
      // For complex references, create multiple links
      const bookEntry = getBibleBooks(language)?.find(
        (book) => book.id === parseInt(reference.book),
      );

      if (!bookEntry) {
        return input;
      }

      const bookName = short ? bookEntry.shortName : bookEntry.longName;
      const chapter = parseInt(reference.chapter);

      // Format verse ranges without leading zeros
      const verseRanges = reference.verseRanges!.map((range) => {
        const start = parseInt(range.start);
        const end = parseInt(range.end);
        return start === end ? start.toString() : `${start}-${end}`;
      });

      // Create array of markdown links
      return verseRanges
        .map((range, i) => {
          if (i === 0) {
            // First link includes book name and chapter
            return `[${bookName} ${chapter}:${range}](${links[i]})`;
          }
          // Subsequent links only include verse numbers
          return `[${range}](${links[i]})`;
        })
        .join(',');
    }

    // For simple references
    const formattedText = formatBibleText(input, short, language);
    return `[${formattedText}](${links})`;
  } catch (error) {
    new Notice(
      t('errors.conversionError', {
        message: error instanceof Error ? error.message : String(error),
      }),
    );
    return input;
  }
}
