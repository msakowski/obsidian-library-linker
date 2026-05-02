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

  describe('single-chapter books', () => {
    test('matches single-chapter books without colon (English)', () => {
      const regex = buildBookNameRegex('E');
      expect('Jude 3'.match(regex)).toBeTruthy();
      expect('Jude 1-5'.match(regex)).toBeTruthy();
      expect('Jude 1,3,5-7'.match(regex)).toBeTruthy();
      expect('Obadiah 4'.match(regex)).toBeTruthy();
      expect('Philemon 5'.match(regex)).toBeTruthy();
      expect('2 John 1'.match(regex)).toBeTruthy();
      expect('3 John 14'.match(regex)).toBeTruthy();
    });

    test('matches single-chapter books without colon (German)', () => {
      const regex = buildBookNameRegex('X');
      expect('Judas 3'.match(regex)).toBeTruthy();
      expect('Jud 3'.match(regex)).toBeTruthy();
      expect('Obadja 4'.match(regex)).toBeTruthy();
      expect('Philemon 5'.match(regex)).toBeTruthy();
      expect('3. Johannes 14'.match(regex)).toBeTruthy();
      expect('3. Joh. 14'.match(regex)).toBeTruthy();
      expect('2. Johannes 1'.match(regex)).toBeTruthy();
    });

    test('still matches single-chapter books with colon', () => {
      const regex = buildBookNameRegex('E');
      expect('Jude 1:3'.match(regex)).toBeTruthy();
      expect('Philemon 1:1'.match(regex)).toBeTruthy();
      expect('3 John 1:14'.match(regex)).toBeTruthy();
    });

    test('prefers chapter:verse match over verse-only for single-chapter books', () => {
      const regex = buildBookNameRegex('E');
      const match = 'Jude 1:3'.match(regex);
      expect(match).toBeTruthy();
      expect(match![0]).toBe('Jude 1:3');
    });
  });
});
