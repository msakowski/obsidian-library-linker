import { findBook } from '@/utils/findBook';

describe('findBook', () => {
  test('finds book by exact match', () => {
    expect(findBook('offenbarung', 'X').book?.id).toBe(66);
    expect(findBook('psalm', 'X').book?.id).toBe(19);
    expect(findBook('revelation', 'E').book?.id).toBe(66);
    expect(findBook('romans', 'E').book?.id).toBe(45);
  });

  test('finds book by abbreviation', () => {
    expect(findBook('off', 'X').book?.id).toBe(66);
    expect(findBook('ps', 'X').book?.id).toBe(19);
    expect(findBook('rev', 'E').book?.id).toBe(66);
    expect(findBook('ps', 'E').book?.id).toBe(19);
    expect(findBook('hes', 'X').book?.id).toBe(26);
    expect(findBook('phili', 'X').book?.id).toBe(50);
    expect(findBook('eph', 'X').book?.id).toBe(49);
    expect(findBook('ru', 'X').book?.id).toBe(8);
    expect(findBook('ne', 'X').book?.id).toBe(16);
    expect(findBook('hi', 'X').book?.id).toBe(18);
    expect(findBook('pr', 'X').book?.id).toBe(21);
    expect(findBook('klg', 'X').book?.id).toBe(25);
    expect(findBook('da', 'X').book?.id).toBe(27);
    expect(findBook('ob', 'X').book?.id).toBe(31);
    expect(findBook('mi', 'X').book?.id).toBe(33);
  });

  test('finds book with number prefix', () => {
    expect(findBook('1mo', 'X').book?.id).toBe(1);
    expect(findBook('2mo', 'X').book?.id).toBe(2);
    expect(findBook('1pe', 'X').book?.id).toBe(60);
  });

  test('is case insensitive', () => {
    expect(findBook('PSALM', 'X').book?.id).toBe(19);
    expect(findBook('Offb', 'X').book?.id).toBe(66);
    expect(findBook('1Mo', 'X').book?.id).toBe(1);
    expect(findBook('JOH', 'E').book?.id).toBe(43);
    expect(findBook('REV', 'E').book?.id).toBe(66);
    expect(findBook('EX', 'E').book?.id).toBe(2);
  });

  test('handles special characters', () => {
    expect(findBook('röm', 'X').book?.id).toBe(45);
    expect(findBook('römer', 'X').book?.id).toBe(45);
  });

  test('returns null for unknown books', () => {
    expect(findBook('nonexistent', 'X').book).toBeNull();
    expect(findBook('', 'X').book).toBeNull();
    expect(findBook('xyz', 'X').book).toBeNull();
    expect(findBook('nonexistent', 'E').book).toBeNull();
    expect(findBook('', 'E').book).toBeNull();
    expect(findBook('xyz', 'E').book).toBeNull();
  });

  test('trims input', () => {
    expect(findBook('  ps  ', 'X').book?.id).toBe(19);
    expect(findBook(' 1mo ', 'X').book?.id).toBe(1);
    expect(findBook('  joh  ', 'E').book?.id).toBe(43);
    expect(findBook(' gen ', 'E').book?.id).toBe(1);
  });
});
