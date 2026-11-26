/**
 * Verses the New World Translation leaves out of the main text, because they
 * are missing from the oldest manuscripts. Their verse numbers are skipped, so
 * an offline chapter legitimately has no text for them.
 *
 * Keys are `book:chapter:verse`. Any other verse missing from an offline
 * chapter is incomplete data, not an omission. A fixed list rather than data
 * recorded at import: the importer cannot tell an omitted verse from a failed
 * extraction, and the list also covers corpora imported before it existed.
 */
const OMITTED_VERSES: ReadonlySet<string> = new Set([
  '40:17:21', // Matthew 17:21
  '40:18:11', // Matthew 18:11
  '40:23:14', // Matthew 23:14
  '41:7:16', // Mark 7:16
  '41:9:44', // Mark 9:44
  '41:9:46', // Mark 9:46
  '41:11:26', // Mark 11:26
  '41:15:28', // Mark 15:28
  '42:17:36', // Luke 17:36
  '42:23:17', // Luke 23:17
  '43:5:4', // John 5:4
  '43:7:53', // John 7:53
  ...Array.from({ length: 11 }, (_, index) => `43:8:${index + 1}`), // John 8:1-11
  '44:8:37', // Acts 8:37
  '44:15:34', // Acts 15:34
  '44:24:7', // Acts 24:7
  '44:28:29', // Acts 28:29
  '45:16:24', // Romans 16:24
]);

export function isOmittedVerse(book: number, chapter: number, verse: number): boolean {
  return OMITTED_VERSES.has(`${book}:${chapter}:${verse}`);
}
