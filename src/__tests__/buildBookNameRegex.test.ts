import { buildBookNameRegex } from '@/utils/buildBookNameRegex';
import { initializeTestBibleBooks } from './__helpers__/initializeBibleBooksForTests';

beforeAll(() => {
  initializeTestBibleBooks();
});

describe('buildBookNameRegex', () => {
  test('matches Korean short names with digits', () => {
    const regex = buildBookNameRegex('KO');
    expect('요1 1:1'.match(regex)).toBeTruthy();
    expect('요2 1:1'.match(regex)).toBeTruthy();
    expect('요3 1:1'.match(regex)).toBeTruthy();
  });

  test('matches Korean multi-word book names', () => {
    const regex = buildBookNameRegex('KO');
    expect('요한 1서 1:1'.match(regex)).toBeTruthy();
    expect('요한 2서 1:1'.match(regex)).toBeTruthy();
    expect('요한 3서 1:1'.match(regex)).toBeTruthy();
    expect('요한 계시록 1:1'.match(regex)).toBeTruthy();
    expect('고린도 전서 1:1'.match(regex)).toBeTruthy();
    expect('데살로니가 전서 1:1'.match(regex)).toBeTruthy();
  });

  test('matches Korean simple book names', () => {
    const regex = buildBookNameRegex('KO');
    expect('창 1:1'.match(regex)).toBeTruthy();
    expect('창세기 1:1'.match(regex)).toBeTruthy();
    expect('요한복음 3:16'.match(regex)).toBeTruthy();
  });

  test('matches Vietnamese hyphenated book names', () => {
    const regex = buildBookNameRegex('VT');
    expect('Lê-vi 25:1'.match(regex)).toBeTruthy();
    expect('Ru-tơ 1:1'.match(regex)).toBeTruthy();
    expect('1 Sa-mu-ên 3:1'.match(regex)).toBeTruthy();
    expect('2 Sa-mu-ên 3:1'.match(regex)).toBeTruthy();
    expect('Giô-suê 1:1'.match(regex)).toBeTruthy();
  });

  test('matches Vietnamese multi-word book names', () => {
    const regex = buildBookNameRegex('VT');
    expect('Sáng thế 1:1'.match(regex)).toBeTruthy();
    expect('Xuất Ai Cập 1:1'.match(regex)).toBeTruthy();
    expect('Phục truyền luật lệ 1:1'.match(regex)).toBeTruthy();
  });

  test('matches Vietnamese short names', () => {
    const regex = buildBookNameRegex('VT');
    expect('Sa 1:1'.match(regex)).toBeTruthy();
    expect('1Sa 3:1'.match(regex)).toBeTruthy();
  });

  test('matches English book names', () => {
    const regex = buildBookNameRegex('E');
    expect('John 3:16'.match(regex)).toBeTruthy();
    expect('1 Corinthians 1:1'.match(regex)).toBeTruthy();
    expect('Rev 21:4'.match(regex)).toBeTruthy();
    expect('Matt. 6:33'.match(regex)).toBeTruthy();
  });

  test('matches German book names', () => {
    const regex = buildBookNameRegex('X');
    expect('Offenbarung 21:4'.match(regex)).toBeTruthy();
    expect('1. Mose 1:1'.match(regex)).toBeTruthy();
    expect('Röm 8:28'.match(regex)).toBeTruthy();
  });

  test('matches verse ranges', () => {
    const regex = buildBookNameRegex('E');
    expect('John 3:16-17'.match(regex)).toBeTruthy();
    expect('John 1:1,2,4'.match(regex)).toBeTruthy();
    expect('Matt 3:1-4:11'.match(regex)).toBeTruthy();
  });

  test('prefers longest match', () => {
    const regex = buildBookNameRegex('KO');
    const match = '요한 1서 1:1'.match(regex);
    // Should match the full "요한 1서 1:1" not just "요한"
    expect(match).toBeTruthy();
    expect(match![0]).toContain('요한 1서');
  });

  test('does not match random text', () => {
    const regex = buildBookNameRegex('E');
    expect('Hello world'.match(regex)).toBeNull();
    expect('The number 3:16 is interesting'.match(regex)).toBeNull();
  });
});
