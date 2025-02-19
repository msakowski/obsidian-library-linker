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
    const verseRef = reference.endVerse
      ? `${parseInt(reference.verse)}-${parseInt(reference.endVerse)}`
      : parseInt(reference.verse);

    return `${bookName} ${parseInt(reference.chapter)}:${verseRef}`;
  } catch (error) {
    return input;
  }
}
