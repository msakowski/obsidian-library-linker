import { bibleBooksDE } from '@/bibleBooks';
import { parseBibleReference } from '@/utils/parseBibleReference';

export function formatBibleText(input: string, short = false): string {
  try {
    const reference = parseBibleReference(input);
    const bookIndex = parseInt(reference.book) - 1;
    const bookEntry = bibleBooksDE[bookIndex];

    // Use short or long name based on settings
    const bookName = short ? bookEntry.shortName : bookEntry.longName;

    // Format the verse reference
    const verseRefs = reference.verseRanges!.map((range) => {
      const start = parseInt(range.start);
      const end = parseInt(range.end);
      return start === end ? start.toString() : `${start}-${end}`;
    });

    return `${bookName} ${parseInt(reference.chapter)}:${verseRefs.join(',')}`;
  } catch (error) {
    return input;
  }
}
