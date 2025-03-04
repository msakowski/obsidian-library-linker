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
    plugin.settings = {
      language: 'X',
      useShortNames: false,
    };
  });

  describe('convertBibleTextToLink', () => {
    const testCases = [
      {
        input: 'offb21:3',
        expected: 'jwlibrary:///finder?bible=66021003&wtlocale=X',
      },
      {
        input: 'offb 21:3',
        expected: 'jwlibrary:///finder?bible=66021003&wtlocale=X',
      },
      {
        input: 'offb21:3-4',
        expected: 'jwlibrary:///finder?bible=66021003-66021004&wtlocale=X',
      },
      {
        input: '1mo1:1',
        expected: 'jwlibrary:///finder?bible=01001001&wtlocale=X',
      },
      {
        input: '2mo 3:14',
        expected: 'jwlibrary:///finder?bible=02003014&wtlocale=X',
      },
    ];

    test.each(testCases)('converts "$input" to "$expected"', ({ input, expected }) => {
      expect(convertBibleTextToLink(input, plugin.settings.language)).toBe(expected);
    });

    test('handles invalid input', () => {
      console.error = jest.fn(); // Silence console.error for this test
      expect(convertBibleTextToLink('invalid', plugin.settings.language)).toBe('invalid');
    });
  });

  describe('convertBibleTextToMarkdownLink', () => {
    const testCases = [
      {
        input: 'off21:3',
        expectedLong: '[Offenbarung 21:3](jwlibrary:///finder?bible=66021003&wtlocale=X)',
        expectedShort: '[Off 21:3](jwlibrary:///finder?bible=66021003&wtlocale=X)',
      },
      {
        input: '1mo1:1',
        expectedLong: '[1. Mose 1:1](jwlibrary:///finder?bible=01001001&wtlocale=X)',
        expectedShort: '[1Mo 1:1](jwlibrary:///finder?bible=01001001&wtlocale=X)',
      },
      {
        input: 'ps 23:1-3',
        expectedLong: '[Psalm 23:1-3](jwlibrary:///finder?bible=19023001-19023003&wtlocale=X)',
        expectedShort: '[Ps 23:1-3](jwlibrary:///finder?bible=19023001-19023003&wtlocale=X)',
      },
      {
        input: 'hoh1:1',
        expectedLong: '[Hohes Lied 1:1](jwlibrary:///finder?bible=22001001&wtlocale=X)',
        expectedShort: '[Hoh 1:1](jwlibrary:///finder?bible=22001001&wtlocale=X)',
      },
      {
        input: 'ps105:3',
        expectedLong: '[Psalm 105:3](jwlibrary:///finder?bible=19105003&wtlocale=X)',
        expectedShort: '[Ps 105:3](jwlibrary:///finder?bible=19105003&wtlocale=X)',
      },
      {
        input: 'Ps 29:10',
        expectedLong: '[Psalm 29:10](jwlibrary:///finder?bible=19029010&wtlocale=X)',
        expectedShort: '[Ps 29:10](jwlibrary:///finder?bible=19029010&wtlocale=X)',
      },
    ];

    describe('with long format', () => {
      beforeEach(() => {
        plugin.settings = { ...plugin.settings, useShortNames: false };
      });

      test.each(testCases)('formats "$input" to "$expectedLong"', ({ input, expectedLong }) => {
        expect(convertBibleTextToMarkdownLink(input, false, plugin.settings.language)).toBe(
          expectedLong,
        );
      });
    });

    describe('with short format', () => {
      beforeEach(() => {
        plugin.settings = { ...plugin.settings, useShortNames: true };
      });

      test.each(testCases)('formats "$input" to "$expectedShort"', ({ input, expectedShort }) => {
        expect(convertBibleTextToMarkdownLink(input, true, plugin.settings.language)).toBe(
          expectedShort,
        );
      });
    });
  });

  describe('parseBibleReference', () => {
    test('parses simple reference', () => {
      const parseResult = parseBibleReference('joh3:16', plugin.settings.language);
      expect(parseResult).toEqual({
        book: '43',
        chapter: '003',
        verseRanges: [
          {
            start: '016',
            end: '016',
          },
        ],
      });
    });

    test('parses reference with space', () => {
      const parseResult = parseBibleReference('joh 3:16', plugin.settings.language);
      expect(parseResult).toEqual({
        book: '43',
        chapter: '003',
        verseRanges: [
          {
            start: '016',
            end: '016',
          },
        ],
      });
    });

    test('parses verse range', () => {
      const parseResult = parseBibleReference('ps23:1-3', plugin.settings.language);
      expect(parseResult).toEqual({
        book: '19',
        chapter: '023',
        verseRanges: [
          {
            start: '001',
            end: '003',
          },
        ],
      });
    });

    test('parses complex verse reference with multiple ranges', () => {
      const parseResult = parseBibleReference('joh1:1,2,4,6,7-8,12-14', plugin.settings.language);
      expect(parseResult).toEqual({
        book: '43',
        chapter: '001',
        verseRanges: [
          { start: '001', end: '002' }, // 1,2 becomes a range
          { start: '004', end: '004' }, // single verse
          { start: '006', end: '008' }, // 6,7-8 becomes one range
          { start: '012', end: '014' }, // explicit range
        ],
      });
    });

    test('parses complex verse reference with spaces', () => {
      const parseResult = parseBibleReference(
        'joh 1:1-2, 4, 6, 7-8, 12-14',
        plugin.settings.language,
      );
      expect(parseResult).toEqual({
        book: '43',
        chapter: '001',
        verseRanges: [
          { start: '001', end: '002' },
          { start: '004', end: '004' },
          { start: '006', end: '008' },
          { start: '012', end: '014' },
        ],
      });
    });

    test('throw error on out of order verses in complex reference', () => {
      expect(() => parseBibleReference('joh1:2,1,6,4,8-7,14-12', plugin.settings.language)).toThrow(
        'errors.versesAscendingOrder',
      );
      expect(() => parseBibleReference('joh1:1,3,2', plugin.settings.language)).toThrow(
        'errors.versesAscendingOrder',
      );
      expect(() => parseBibleReference('joh1:3-1', plugin.settings.language)).toThrow(
        'errors.versesAscendingOrder',
      );
      expect(() => parseBibleReference('joh1:7-8,6', plugin.settings.language)).toThrow(
        'errors.versesAscendingOrder',
      );
    });

    test('throw error on invalid format in complex reference', () => {
      expect(() => parseBibleReference('joh1:1,,2', plugin.settings.language)).toThrow(
        'errors.invalidVerseFormat',
      );
      expect(() => parseBibleReference('joh1:1-2-3', plugin.settings.language)).toThrow(
        'errors.invalidVerseFormat',
      );
      expect(() => parseBibleReference('joh1:1,-2', plugin.settings.language)).toThrow(
        'errors.invalidVerseFormat',
      );
    });

    test('throw error on self-referencing verses', () => {
      expect(() => parseBibleReference('joh1:1,1', plugin.settings.language)).toThrow(
        'errors.versesAscendingOrder',
      );
      expect(() => parseBibleReference('joh1:1-1', plugin.settings.language)).toThrow(
        'errors.versesAscendingOrder',
      );
      expect(() => parseBibleReference('joh1:1,2,2', plugin.settings.language)).toThrow(
        'errors.versesAscendingOrder',
      );
      expect(() => parseBibleReference('joh1:1,1-2', plugin.settings.language)).toThrow(
        'errors.versesAscendingOrder',
      );
    });

    test('throw error on invalid book', () => {
      expect(() => parseBibleReference('xyz1:1', plugin.settings.language)).toThrow(
        'errors.bookNotFound',
      );
    });

    test('throw error on invalid format', () => {
      expect(() => parseBibleReference('joh:1', plugin.settings.language)).toThrow(
        'errors.invalidFormat',
      );
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
        expect(formatBibleText(input, false, plugin.settings.language)).toBe(expectedLong);
      });
    });

    describe('with short format', () => {
      beforeEach(() => {
        plugin.settings = { ...plugin.settings, useShortNames: true };
      });

      test.each(testCases)('formats "$input" to "$expectedShort"', ({ input, expectedShort }) => {
        expect(formatBibleText(input, true, plugin.settings.language)).toBe(expectedShort);
      });
    });
  });
});
