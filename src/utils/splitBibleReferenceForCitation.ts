import type { BibleReference } from '@/types';

/**
 * Highest verse number of any chapter in the Bible (Psalm 119).
 * Used as the end of an open range when a part runs to the end of a chapter.
 */
export const MAX_VERSES_IN_CHAPTER = 176;

/**
 * Splits a reference into the parts a citation provider can look up.
 *
 * Providers resolve a single verse range inside a single chapter, so
 * multi-range references (`Joh 1:1,3-4`) and multi-chapter references
 * (`Matt 3:1-4:11`) have to be requested piece by piece.
 *
 * The parts are returned in reading order and together cover the whole
 * reference. Simple references are returned unchanged.
 */
export function splitBibleReferenceForCitation(reference: BibleReference): BibleReference[] {
  const { book, chapter, endChapter, verseRanges } = reference;

  if (!verseRanges?.length) {
    return [];
  }

  if (endChapter && endChapter > chapter) {
    // A multi-chapter reference always carries exactly one range: the start
    // verse in the first chapter and the end verse in the last chapter.
    const { start, end } = verseRanges[0];
    const parts: BibleReference[] = [];

    for (let current = chapter; current <= endChapter; current++) {
      parts.push({
        book,
        chapter: current,
        verseRanges: [
          {
            start: current === chapter ? start : 1,
            end: current === endChapter ? end : MAX_VERSES_IN_CHAPTER,
          },
        ],
      });
    }

    return parts;
  }

  if (verseRanges.length === 1) {
    return [reference];
  }

  return verseRanges.map((range) => ({ book, chapter, verseRanges: [range] }));
}
