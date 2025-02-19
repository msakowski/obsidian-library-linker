export function convertBibleReference(url: string): string {
  // Replace 'jwpub://' with 'jwlibrary://'
  url = url.replace('jwpub://', 'jwlibrary://');
  // Extract the Bible reference parts
  const parts = url.split('/');
  const bibleRef = parts[parts.length - 1];

  // Extract book, chapter and verse
  const [startBookChapterVerse, endBookChapterVerse] = bibleRef.split('-');
  const [bookStart, chapterStart, verseStart] = startBookChapterVerse.split(':');
  const [bookEnd, chapterEnd, verseEnd] = endBookChapterVerse.split(':');

  // Format the numbers to ensure proper padding
  const formattedChapterStart = chapterStart.padStart(3, '0');
  const formattedVerseStart = verseStart.padStart(3, '0');
  const formattedChapterEnd = chapterEnd.padStart(3, '0');
  const formattedVerseEnd = verseEnd.padStart(3, '0');

  const formattedReferenceStart = `${bookStart}${formattedChapterStart}${formattedVerseStart}`;
  const formattedReferenceEnd = `${bookEnd}${formattedChapterEnd}${formattedVerseEnd}`;

  const formattedReference =
    formattedReferenceStart === formattedReferenceEnd
      ? formattedReferenceStart
      : `${formattedReferenceStart}-${formattedReferenceEnd}`;

  return `jwlibrary:///finder?bible=${formattedReference}`;
}
