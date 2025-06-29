import { findBook } from '@/utils/findBook';

describe('findBook', () => {
  test('finds book by exact match', () => {
    expect(findBook('offenbarung', 'X')).toEqual(expect.objectContaining({ id: 66 }));
    expect(findBook('psalm', 'X')).toEqual(expect.objectContaining({ id: 19 }));
    expect(findBook('revelation', 'E')).toEqual(expect.objectContaining({ id: 66 }));
    expect(findBook('romans', 'E')).toEqual(expect.objectContaining({ id: 45 }));
    expect(findBook('Joosua', 'FI')).toEqual(expect.objectContaining({ id: 6 }));
    expect(findBook('Ilmestys', 'FI')).toEqual(expect.objectContaining({ id: 66 }));
    expect(findBook('Psalmit', 'FI')).toEqual(expect.objectContaining({ id: 19 }));
    expect(findBook('Jozua', 'O')).toEqual(expect.objectContaining({ id: 6 }));
    expect(findBook('Openbaring', 'O')).toEqual(expect.objectContaining({ id: 66 }));
    expect(findBook('psalm', 'O')).toEqual(expect.objectContaining({ id: 19 }));
  });

  test('finds book by abbreviation', () => {
    expect(findBook('off', 'X')).toEqual(expect.objectContaining({ id: 66 }));
    expect(findBook('ps', 'X')).toEqual(expect.objectContaining({ id: 19 }));
    expect(findBook('rev', 'E')).toEqual(expect.objectContaining({ id: 66 }));
    expect(findBook('ps', 'E')).toEqual(expect.objectContaining({ id: 19 }));
    expect(findBook('hes', 'X')).toEqual(expect.objectContaining({ id: 26 }));
    expect(findBook('phili', 'X')).toEqual(expect.objectContaining({ id: 50 }));
    expect(findBook('eph', 'X')).toEqual(expect.objectContaining({ id: 49 }));
    expect(findBook('ru', 'X')).toEqual(expect.objectContaining({ id: 8 }));
    expect(findBook('ne', 'X')).toEqual(expect.objectContaining({ id: 16 }));
    expect(findBook('hi', 'X')).toEqual(expect.objectContaining({ id: 18 }));
    expect(findBook('pr', 'X')).toEqual(expect.objectContaining({ id: 21 }));
    expect(findBook('klg', 'X')).toEqual(expect.objectContaining({ id: 25 }));
    expect(findBook('da', 'X')).toEqual(expect.objectContaining({ id: 27 }));
    expect(findBook('ob', 'X')).toEqual(expect.objectContaining({ id: 31 }));
    expect(findBook('mi', 'X')).toEqual(expect.objectContaining({ id: 33 }));
    expect(findBook('san', 'FI')).toEqual(expect.objectContaining({ id: 20 }));
    expect(findBook('laul', 'FI')).toEqual(expect.objectContaining({ id: 22 }));
    expect(findBook('ju', 'O')).toEqual(expect.objectContaining({ id: 65 }));
    expect(findBook('ps', 'O')).toEqual(expect.objectContaining({ id: 19 }));

  });

  test('finds book with number prefix', () => {
    expect(findBook('1mo', 'X')).toEqual(expect.objectContaining({ id: 1 }));
    expect(findBook('2mo', 'X')).toEqual(expect.objectContaining({ id: 2 }));
    expect(findBook('1pe', 'X')).toEqual(expect.objectContaining({ id: 60 }));
    expect(findBook('1kor', 'FI')).toEqual(expect.objectContaining({ id: 46 }));
    expect(findBook('1Kor', 'O')).toEqual(expect.objectContaining({ id: 46 }));
  });

  test('is case insensitive', () => {
    expect(findBook('PSALM', 'X')).toEqual(expect.objectContaining({ id: 19 }));
    expect(findBook('Offb', 'X')).toEqual(expect.objectContaining({ id: 66 }));
    expect(findBook('1Mo', 'X')).toEqual(expect.objectContaining({ id: 1 }));
    expect(findBook('JOH', 'E')).toEqual(expect.objectContaining({ id: 43 }));
    expect(findBook('REV', 'E')).toEqual(expect.objectContaining({ id: 66 }));
    expect(findBook('EX', 'E')).toEqual(expect.objectContaining({ id: 2 }));
  });

  test('handles special characters', () => {
    expect(findBook('röm', 'X')).toEqual(expect.objectContaining({ id: 45 }));
    expect(findBook('römer', 'X')).toEqual(expect.objectContaining({ id: 45 }));
  });

  test('throws error for unknown books', () => {
    expect(() => findBook('nonexistent', 'X')).toThrow('errors.bookNotFound');
    expect(() => findBook('', 'X')).toThrow('errors.bookNotFound');
    expect(() => findBook('xyz', 'X')).toThrow('errors.bookNotFound');
    expect(() => findBook('nonexistent', 'E')).toThrow('errors.bookNotFound');
    expect(() => findBook('', 'E')).toThrow('errors.bookNotFound');
    expect(() => findBook('xyz', 'E')).toThrow('errors.bookNotFound');
  });

  test('trims input', () => {
    expect(findBook('  ps  ', 'X')).toEqual(expect.objectContaining({ id: 19 }));
    expect(findBook(' 1mo ', 'X')).toEqual(expect.objectContaining({ id: 1 }));
    expect(findBook('  joh  ', 'E')).toEqual(expect.objectContaining({ id: 43 }));
    expect(findBook(' gen ', 'E')).toEqual(expect.objectContaining({ id: 1 }));
    expect(findBook(' 1 moo ', 'FI')).toEqual(expect.objectContaining({ id: 1 }));
  });
});
