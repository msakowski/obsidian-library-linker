/** Format selected verses consistently for offline and online quotes. */
export function formatQuotedVerses(
  verses: { number: number; text: string }[],
  includeVerseNumbers: boolean,
): string {
  const numbered = includeVerseNumbers && verses.length > 1;
  return verses.map(({ number, text }) => (numbered ? `${number} ${text}` : text)).join(' ');
}
