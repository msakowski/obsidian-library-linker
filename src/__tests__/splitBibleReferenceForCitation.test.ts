import {
  MAX_VERSES_IN_CHAPTER,
  splitBibleReferenceForCitation,
} from '@/utils/splitBibleReferenceForCitation';

describe('splitBibleReferenceForCitation', () => {
  test('returns a single verse reference unchanged', () => {
    const reference = { book: 43, chapter: 3, verseRanges: [{ start: 16, end: 16 }] };

    expect(splitBibleReferenceForCitation(reference)).toEqual([reference]);
  });

  test('returns a single verse range unchanged', () => {
    const reference = { book: 45, chapter: 8, verseRanges: [{ start: 28, end: 30 }] };

    expect(splitBibleReferenceForCitation(reference)).toEqual([reference]);
  });

  test('splits multiple verse ranges into one part per range', () => {
    const reference = {
      book: 43,
      chapter: 1,
      verseRanges: [
        { start: 1, end: 2 },
        { start: 4, end: 4 },
        { start: 6, end: 8 },
      ],
    };

    expect(splitBibleReferenceForCitation(reference)).toEqual([
      { book: 43, chapter: 1, verseRanges: [{ start: 1, end: 2 }] },
      { book: 43, chapter: 1, verseRanges: [{ start: 4, end: 4 }] },
      { book: 43, chapter: 1, verseRanges: [{ start: 6, end: 8 }] },
    ]);
  });

  test('splits a multi-chapter reference into one part per chapter', () => {
    // Matt. 3:1-4:11
    const reference = { book: 40, chapter: 3, endChapter: 4, verseRanges: [{ start: 1, end: 11 }] };

    expect(splitBibleReferenceForCitation(reference)).toEqual([
      { book: 40, chapter: 3, verseRanges: [{ start: 1, end: MAX_VERSES_IN_CHAPTER }] },
      { book: 40, chapter: 4, verseRanges: [{ start: 1, end: 11 }] },
    ]);
  });

  test('covers whole chapters between the first and the last one', () => {
    // Matt. 24:14-26:2
    const reference = {
      book: 40,
      chapter: 24,
      endChapter: 26,
      verseRanges: [{ start: 14, end: 2 }],
    };

    expect(splitBibleReferenceForCitation(reference)).toEqual([
      { book: 40, chapter: 24, verseRanges: [{ start: 14, end: MAX_VERSES_IN_CHAPTER }] },
      { book: 40, chapter: 25, verseRanges: [{ start: 1, end: MAX_VERSES_IN_CHAPTER }] },
      { book: 40, chapter: 26, verseRanges: [{ start: 1, end: 2 }] },
    ]);
  });

  test('ignores an end chapter that equals the start chapter', () => {
    const reference = {
      book: 40,
      chapter: 24,
      endChapter: 24,
      verseRanges: [{ start: 14, end: 14 }],
    };

    expect(splitBibleReferenceForCitation(reference)).toEqual([reference]);
  });

  test('returns no parts when the reference has no verse ranges', () => {
    expect(splitBibleReferenceForCitation({ book: 40, chapter: 24 })).toEqual([]);
  });
});
