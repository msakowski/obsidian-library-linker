import { findBookIndex } from '@/utils/findBookIndex';

describe('findBookIndex', () => {
  test('finds book by exact match', () => {
    expect(findBookIndex('offenbarung', 'X')).toBe(66);
    expect(findBookIndex('psalm', 'X')).toBe(19);
    expect(findBookIndex('revelation', 'E')).toBe(66);
    expect(findBookIndex('romans', 'E')).toBe(45);
  });

  test('finds book by abbreviation', () => {
    expect(findBookIndex('off', 'X')).toBe(66);
    expect(findBookIndex('ps', 'X')).toBe(19);
    expect(findBookIndex('rev', 'E')).toBe(66);
    expect(findBookIndex('ps', 'E')).toBe(19);
  });

  test('finds book with number prefix', () => {
    expect(findBookIndex('1mo', 'X')).toBe(1);
    expect(findBookIndex('2mo', 'X')).toBe(2);
    expect(findBookIndex('1pe', 'X')).toBe(60);
  });

  test('is case insensitive', () => {
    expect(findBookIndex('PSALM', 'X')).toBe(19);
    expect(findBookIndex('Offb', 'X')).toBe(66);
    expect(findBookIndex('1Mo', 'X')).toBe(1);
    expect(findBookIndex('JOH', 'E')).toBe(43);
    expect(findBookIndex('REV', 'E')).toBe(66);
    expect(findBookIndex('EX', 'E')).toBe(2);
  });

  test('handles special characters', () => {
    expect(findBookIndex('röm', 'X')).toBe(45);
    expect(findBookIndex('römer', 'X')).toBe(45);
  });

  test('returns -1 for unknown books', () => {
    expect(findBookIndex('nonexistent', 'X')).toBe(-1);
    expect(findBookIndex('', 'X')).toBe(-1);
    expect(findBookIndex('xyz', 'X')).toBe(-1);
    expect(findBookIndex('nonexistent', 'E')).toBe(-1);
    expect(findBookIndex('', 'E')).toBe(-1);
    expect(findBookIndex('xyz', 'E')).toBe(-1);
  });

  test('trims input', () => {
    expect(findBookIndex('  ps  ', 'X')).toBe(19);
    expect(findBookIndex(' 1mo ', 'X')).toBe(1);
    expect(findBookIndex('  joh  ', 'E')).toBe(43);
    expect(findBookIndex(' gen ', 'E')).toBe(1);
  });
});
