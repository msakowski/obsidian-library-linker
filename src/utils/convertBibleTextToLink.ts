import { parseBibleReference } from '@/utils/parseBibleReference';
import { formatJWLibraryLink } from '@/utils/formatJWLibraryLink';
import { formatBibleText } from '@/utils/formatBibleText';
import { bibleBooksDE } from '@/bibleBooks';

export function convertBibleTextToLink(input: string): string | string[] {
  try {
    const reference = parseBibleReference(input);
    return formatJWLibraryLink(reference);
  } catch (error) {
    console.error('Error converting Bible text:', error.message);
    return input;
  }
}

export function convertBibleTextToMarkdownLink(input: string, short = false): string {
  try {
    const reference = parseBibleReference(input);
    const links = formatJWLibraryLink(reference);

    // Early return input if there are no valid links
    if (!links || (Array.isArray(links) && !links.length)) {
      return input;
    }

    if (Array.isArray(links)) {
      // For complex references, create multiple links
      const bookEntry = bibleBooksDE.find((book) => book.id === parseInt(reference.book));

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
    const formattedText = formatBibleText(input, short);
    return `[${formattedText}](${links})`;
  } catch (error) {
    return input;
  }
}
