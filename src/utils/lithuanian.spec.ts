import { beforeAll, describe, expect, test } from 'vitest';
import { initializeTestBibleBooks } from '@/__tests__/__helpers__/initializeBibleBooksForTests';
import { buildBookNameRegex } from '@/utils/buildBookNameRegex';
import { parseBibleReference } from '@/utils/parseBibleReference';

beforeAll((): void => {
  initializeTestBibleBooks(['L']);
});

describe('Lithuanian Bible references', (): void => {
  test.each([
    ['Jono 3:16', 43, 3, 16],
    ['Jn 3:16', 43, 3, 16],
    ['1 Jono 4:8', 62, 4, 8],
    ['1Jn 4:8', 62, 4, 8],
    ['Pakartoto Įstatymo 6:4', 5, 6, 4],
    ['Įst 6:4', 5, 6, 4],
    ['Apaštalų darbai 2:4', 44, 2, 4],
    ['Giesmių giesmė 2:1', 22, 2, 1],
    ['Apreiškimas 21:4', 66, 21, 4],
  ] as const)('parses %s', (input, book, chapter, verse): void => {
    expect(parseBibleReference(input, 'L')).toEqual({
      book,
      chapter,
      verseRanges: [{ start: verse, end: verse }],
    });
  });

  test('finds references with Lithuanian letters in running text', (): void => {
    const matches = 'Žr. Apaštalų darbai 2:4 ir Įst 6:4.'.match(buildBookNameRegex('L'));
    expect(matches).toEqual(['Apaštalų darbai 2:4', 'Įst 6:4']);
  });
});
