import { getBibleBooks } from '@/bibleBooks';
import { parseBibleReference } from '@/utils/parseBibleReference';
import type { Language } from '@/types';

export function formatBibleText(input: string, short = false, language: Language): string {
  const reference = parseBibleReference(input, language);

  if (!reference) {
    return input;
  }

  const bookEntry = getBibleBooks(language)?.find((book) => book.id === parseInt(reference.book));

  if (!bookEntry) {
    return input;
  }

  // Use short or long name based on the provided parameter
  // The parameter should come from the user's settings (useShortNames)
  const bookName = short ? bookEntry.shortName : bookEntry.longName;

  // Format the verse reference
  const verseRefs = reference.verseRanges!.map((range) => {
    const start = parseInt(range.start);
    const end = parseInt(range.end);
    return start === end ? start.toString() : `${start}-${end}`;
  });

  return `${bookName} ${parseInt(reference.chapter)}:${verseRefs.join(',')}`;
}
