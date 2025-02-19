import { formatBibleText } from '@/utils/formatBibleText';

describe('formatBibleText', () => {
  describe('with long format', () => {
    test('formats single verse', () => {
      expect(formatBibleText('joh3:16')).toBe('Johannes 3:16');
      expect(formatBibleText('ps23:1')).toBe('Psalm 23:1');
    });

    test('formats verse range', () => {
      expect(formatBibleText('ps23:1-3')).toBe('Psalm 23:1-3');
      expect(formatBibleText('off21:3-4')).toBe('Offenbarung 21:3-4');
    });

    test('handles books with numbers', () => {
      expect(formatBibleText('1mo1:1')).toBe('1. Mose 1:1');
      expect(formatBibleText('2mo3:14')).toBe('2. Mose 3:14');
      expect(formatBibleText('1pe1:3')).toBe('1. Petrus 1:3');
    });
  });

  describe('with short format', () => {
    test('formats single verse', () => {
      expect(formatBibleText('joh3:16', true)).toBe('Joh 3:16');
      expect(formatBibleText('ps23:1', true)).toBe('Ps 23:1');
    });

    test('formats verse range', () => {
      expect(formatBibleText('ps23:1-3', true)).toBe('Ps 23:1-3');
      expect(formatBibleText('off21:3-4', true)).toBe('Off 21:3-4');
    });

    test('handles books with numbers', () => {
      expect(formatBibleText('1mo1:1', true)).toBe('1Mo 1:1');
      expect(formatBibleText('2mo3:14', true)).toBe('2Mo 3:14');
      expect(formatBibleText('1pe1:3', true)).toBe('1Pe 1:3');
    });
  });

  test('returns input on invalid reference', () => {
    expect(formatBibleText('invalid')).toBe('invalid');
    expect(formatBibleText('xyz1:1', true)).toBe('xyz1:1');
  });
});
