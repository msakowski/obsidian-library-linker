import LibraryLinkerPlugin from '@/main';
import {
  convertBibleTextToLink,
  convertBibleTextToMarkdownLink,
} from '@/utils/convertBibleTextToLink';
import { formatBibleText } from '@/utils/formatBibleText';
import { parseBibleReference } from '@/utils/parseBibleReference';
import { App } from 'obsidian';

describe('LibraryLinkerPlugin', () => {
  let plugin: LibraryLinkerPlugin;

  beforeEach(() => {
    // @ts-ignore - we don't need a full App instance for these tests
    plugin = new LibraryLinkerPlugin({} as App);
  });

  describe('convertBibleTextToLink', () => {
    const testCases = [
      {
        input: 'offb21:3',
        expected: 'jwlibrary:///finder?bible=66021003',
      },
      {
        input: 'offb 21:3',
        expected: 'jwlibrary:///finder?bible=66021003',
      },
      {
        input: 'offb21:3-4',
        expected: 'jwlibrary:///finder?bible=66021003-66021004',
      },
      {
        input: '1mo1:1',
        expected: 'jwlibrary:///finder?bible=01001001',
      },
      {
        input: '2mo 3:14',
        expected: 'jwlibrary:///finder?bible=02003014',
      },
    ];

    test.each(testCases)('converts "$input" to "$expected"', ({ input, expected }) => {
      expect(convertBibleTextToLink(input)).toBe(expected);
    });

    test('handles invalid input', () => {
      console.error = jest.fn(); // Silence console.error for this test
      expect(convertBibleTextToLink('invalid')).toBe('invalid');
    });
  });

  describe('convertBibleTextToMarkdownLink', () => {
    const testCases = [
      {
        input: 'off21:3',
        expectedLong: '[Offenbarung 21:3](jwlibrary:///finder?bible=66021003)',
        expectedShort: '[Off 21:3](jwlibrary:///finder?bible=66021003)',
      },
      {
        input: '1mo1:1',
        expectedLong: '[1. Mose 1:1](jwlibrary:///finder?bible=01001001)',
        expectedShort: '[1Mo 1:1](jwlibrary:///finder?bible=01001001)',
      },
      {
        input: 'ps 23:1-3',
        expectedLong: '[Psalm 23:1-3](jwlibrary:///finder?bible=19023001-19023003)',
        expectedShort: '[Ps 23:1-3](jwlibrary:///finder?bible=19023001-19023003)',
      },
      {
        input: 'hoh1:1',
        expectedLong: '[Hohes Lied 1:1](jwlibrary:///finder?bible=22001001)',
        expectedShort: '[Hoh 1:1](jwlibrary:///finder?bible=22001001)',
      },
      {
        input: 'ps105:3',
        expectedLong: '[Psalm 105:3](jwlibrary:///finder?bible=19105003)',
        expectedShort: '[Ps 105:3](jwlibrary:///finder?bible=19105003)',
      },
      {
        input: 'Ps 29:10',
        expectedLong: '[Psalm 29:10](jwlibrary:///finder?bible=19029010)',
        expectedShort: '[Ps 29:10](jwlibrary:///finder?bible=19029010)',
      },
    ];

    describe('with long format', () => {
      beforeEach(() => {
        plugin.settings = { ...plugin.settings, useShortNames: false };
      });

      test.each(testCases)('formats "$input" to "$expectedLong"', ({ input, expectedLong }) => {
        expect(convertBibleTextToMarkdownLink(input)).toBe(expectedLong);
      });
    });

    describe('with short format', () => {
      beforeEach(() => {
        plugin.settings = { ...plugin.settings, useShortNames: true };
      });

      test.each(testCases)('formats "$input" to "$expectedShort"', ({ input, expectedShort }) => {
        expect(convertBibleTextToMarkdownLink(input, true)).toBe(expectedShort);
      });
    });
  });

  describe('parseBibleReference', () => {
    test('parses simple reference', () => {
      const result = parseBibleReference('joh3:16');
      expect(result).toEqual({
        book: '43',
        chapter: '003',
        verse: '016',
        endVerse: undefined,
      });
    });

    test('parses reference with space', () => {
      const result = parseBibleReference('joh 3:16');
      expect(result).toEqual({
        book: '43',
        chapter: '003',
        verse: '016',
        endVerse: undefined,
      });
    });

    test('parses verse range', () => {
      const result = parseBibleReference('ps23:1-3');
      expect(result).toEqual({
        book: '19',
        chapter: '023',
        verse: '001',
        endVerse: '003',
      });
    });

    test('throws on invalid book', () => {
      console.error = jest.fn(); // Silence console.error for this test
      expect(() => {
        parseBibleReference('xyz1:1');
      }).toThrow('Book not found');
    });

    test('throws on invalid format', () => {
      expect(() => {
        parseBibleReference('joh:1');
      }).toThrow('Invalid format');
    });
  });

  describe('formatBibleText', () => {
    const testCases = [
      {
        input: 'offb21:3',
        expectedLong: 'Offenbarung 21:3',
        expectedShort: 'Off 21:3',
      },
      {
        input: '1mo1:1',
        expectedLong: '1. Mose 1:1',
        expectedShort: '1Mo 1:1',
      },
      {
        input: 'hoh 1:1',
        expectedLong: 'Hohes Lied 1:1',
        expectedShort: 'Hoh 1:1',
      },
      {
        input: 'ps23:1-3',
        expectedLong: 'Psalm 23:1-3',
        expectedShort: 'Ps 23:1-3',
      },
    ];

    describe('with long format', () => {
      test.each(testCases)('formats "$input" to "$expectedLong"', ({ input, expectedLong }) => {
        expect(formatBibleText(input)).toBe(expectedLong);
      });
    });

    describe('with short format', () => {
      beforeEach(() => {
        plugin.settings = { ...plugin.settings, useShortNames: true };
      });

      test.each(testCases)('formats "$input" to "$expectedShort"', ({ input, expectedShort }) => {
        expect(formatBibleText(input, true)).toBe(expectedShort);
      });
    });
  });
});
