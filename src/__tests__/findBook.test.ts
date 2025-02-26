import { findBook } from '@/utils/findBook';

describe('findBook', () => {
  test('finds book by exact match', () => {
    expect(findBook('offenbarung', 'X')?.id).toBe(66);
    expect(findBook('psalm', 'X')?.id).toBe(19);
    expect(findBook('revelation', 'E')?.id).toBe(66);
    expect(findBook('romans', 'E')?.id).toBe(45);
  });

  test('finds book by abbreviation', () => {
    expect(findBook('off', 'X')?.id).toBe(66);
    expect(findBook('ps', 'X')?.id).toBe(19);
    expect(findBook('rev', 'E')?.id).toBe(66);
    expect(findBook('ps', 'E')?.id).toBe(19);
  });

  test('finds book with number prefix', () => {
    expect(findBook('1mo', 'X')?.id).toBe(1);
    expect(findBook('2mo', 'X')?.id).toBe(2);
    expect(findBook('1pe', 'X')?.id).toBe(60);
  });

  test('is case insensitive', () => {
    expect(findBook('PSALM', 'X')?.id).toBe(19);
    expect(findBook('Offb', 'X')?.id).toBe(66);
    expect(findBook('1Mo', 'X')?.id).toBe(1);
    expect(findBook('JOH', 'E')?.id).toBe(43);
    expect(findBook('REV', 'E')?.id).toBe(66);
    expect(findBook('EX', 'E')?.id).toBe(2);
  });

  test('handles special characters', () => {
    expect(findBook('röm', 'X')?.id).toBe(45);
    expect(findBook('römer', 'X')?.id).toBe(45);
  });

  test('returns null for unknown books', () => {
    expect(findBook('nonexistent', 'X')).toBeNull();
    expect(findBook('', 'X')).toBeNull();
    expect(findBook('xyz', 'X')).toBeNull();
    expect(findBook('nonexistent', 'E')).toBeNull();
    expect(findBook('', 'E')).toBeNull();
    expect(findBook('xyz', 'E')).toBeNull();
  });

  test('trims input', () => {
    expect(findBook('  ps  ', 'X')?.id).toBe(19);
    expect(findBook(' 1mo ', 'X')?.id).toBe(1);
    expect(findBook('  joh  ', 'E')?.id).toBe(43);
    expect(findBook(' gen ', 'E')?.id).toBe(1);
  });
});
