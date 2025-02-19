import { findBookIndex } from '@/utils/findBookIndex';

describe('findBookIndex', () => {
  test('finds book by exact match', () => {
    expect(findBookIndex('offenbarung')).toBe(66);
    expect(findBookIndex('psalm')).toBe(19);
  });

  test('finds book by abbreviation', () => {
    expect(findBookIndex('off')).toBe(66);
    expect(findBookIndex('ps')).toBe(19);
  });

  test('finds book with number prefix', () => {
    expect(findBookIndex('1mo')).toBe(1);
    expect(findBookIndex('2mo')).toBe(2);
    expect(findBookIndex('1pe')).toBe(60);
  });

  test('is case insensitive', () => {
    expect(findBookIndex('PSALM')).toBe(19);
    expect(findBookIndex('Offb')).toBe(66);
    expect(findBookIndex('1Mo')).toBe(1);
  });

  test('handles special characters', () => {
    expect(findBookIndex('röm')).toBe(45);
    expect(findBookIndex('römer')).toBe(45);
  });

  test('returns -1 for unknown books', () => {
    expect(findBookIndex('nonexistent')).toBe(-1);
    expect(findBookIndex('')).toBe(-1);
    expect(findBookIndex('xyz')).toBe(-1);
  });

  test('trims input', () => {
    expect(findBookIndex('  ps  ')).toBe(19);
    expect(findBookIndex(' 1mo ')).toBe(1);
  });
});
