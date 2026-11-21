import { beforeAll, describe, expect, test } from 'vitest';
import { parseBibleReference } from '@/utils/parseBibleReference';
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

describe('verseCounts', () => {
  test('has a verse count for every chapter of every book', () => {
    for (let book = 1; book <= 66; book++) {
      expect(verseCounts[book]).toHaveLength(chapterCounts[book]);
    }
  });
});
