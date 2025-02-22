import { findBook } from '@/utils/findBook';

describe('findBook', () => {
  test('finds book by exact match', () => {
    expect(findBook('offenbarung')?.id).toBe(66);
    expect(findBook('psalm')?.id).toBe(19);
  });

  test('finds book by abbreviation', () => {
    expect(findBook('off')?.id).toBe(66);
    expect(findBook('ps')?.id).toBe(19);
  });

  test('finds book with number prefix', () => {
    expect(findBook('1mo')?.id).toBe(1);
    expect(findBook('2mo')?.id).toBe(2);
    expect(findBook('1pe')?.id).toBe(60);
  });

  test('is case insensitive', () => {
    expect(findBook('PSALM')?.id).toBe(19);
    expect(findBook('Offb')?.id).toBe(66);
    expect(findBook('1Mo')?.id).toBe(1);
  });

  test('handles special characters', () => {
    expect(findBook('röm')?.id).toBe(45);
    expect(findBook('römer')?.id).toBe(45);
  });

  test('returns -1 for unknown books', () => {
    expect(findBook('nonexistent')?.id).toBe(undefined);
    expect(findBook('')?.id).toBe(undefined);
    expect(findBook('xyz')?.id).toBe(undefined);
  });

  test('trims input', () => {
    expect(findBook('  ps  ')?.id).toBe(19);
    expect(findBook(' 1mo ')?.id).toBe(1);
  });
});
