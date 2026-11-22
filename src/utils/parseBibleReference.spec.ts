import { beforeAll, describe, expect, test } from 'vitest';
import { extractBibleReferenceFromMatch, parseBibleReference } from '@/utils/parseBibleReference';
import { verseCounts } from '@/consts/verseCounts';
import { chapterCounts } from '@/consts/chapterCounts';
import { initializeTestBibleBooks } from '../__tests__/__helpers__/initializeBibleBooksForTests';

beforeAll(() => {
  initializeTestBibleBooks(['E', 'F']);
});

describe('parseBibleReference: verses that do not exist', () => {
  test.each([
    ['1 John 3:333333', 'E'],
    ['1j 3:333333', 'F'],
    ['John 3:37', 'E'],
    ['John 3:16-40', 'E'],
    ['John 3:16, 40', 'E'],
    ['Jude 26', 'E'],
    ['Matt 3:18-4:2', 'E'],
    ['Matt 3:1-4:26', 'E'],
  ] as const)('rejects %s', (input, language) => {
    expect(() => parseBibleReference(input, language)).toThrow('errors.invalidVerseFormat');
  });

  test.each([
    ['John 3:36', 'E'],
    ['Ps 119:176', 'E'],
    ['Jude 25', 'E'],
    ['Matt 3:17-4:25', 'E'],
    ['John 8:7', 'E'],
    ['1j 3:24', 'F'],
  ] as const)('accepts %s', (input, language) => {
    expect(() => parseBibleReference(input, language)).not.toThrow();
  });
});

describe('extractBibleReferenceFromMatch: a missing verse of a numbered book', () => {
  // Dropping the leading number would turn these into references to John
  test.each(['1 John 3:30', '1 John 5:22', '2 John 14', '3 John 15', '1 John 7'])(
    'finds no reference in %s',
    (text) => {
      expect(extractBibleReferenceFromMatch(text, 'E')).toBeNull();
    },
  );

  test('still drops leading words that are not a book', () => {
    expect(extractBibleReferenceFromMatch('read 1 John 3:16', 'E')).toMatchObject({
      text: '1 John 3:16',
      offset: 'read '.length,
      reference: { book: 62, chapter: 3, verseRanges: [{ start: 16, end: 16 }] },
    });
  });
});

describe('verseCounts', () => {
  test.each([
    ['Mark 16', 41, 16, 8],
    ['John 7', 43, 7, 52],
    ['Psalm 119', 19, 119, 176],
    ['3 John', 64, 1, 14],
  ])('%s has the NWT verse count', (_, book, chapter, verses) => {
    expect(verseCounts[book][chapter - 1]).toBe(verses);
  });

  test('has a verse count for every chapter of every book', () => {
    for (let book = 1; book <= 66; book++) {
      expect(verseCounts[book]).toHaveLength(chapterCounts[book]);
    }
  });
});
