import LibraryLinkerPlugin from '../../main';
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
                expected: 'jwlibrary:///finder?bible=66021003'
            },
            {
                input: 'offb 21:3',
                expected: 'jwlibrary:///finder?bible=66021003'
            },
            {
                input: 'offb21:3-4',
                expected: 'jwlibrary:///finder?bible=66021003-66021004'
            },
            {
                input: '1mo1:1',
                expected: 'jwlibrary:///finder?bible=01001001'
            },
            {
                input: '2mo 3:14',
                expected: 'jwlibrary:///finder?bible=02003014'
            }
        ];

        test.each(testCases)('converts "$input" to "$expected"', ({ input, expected }) => {
            expect(plugin.convertBibleTextToLink(input)).toBe(expected);
        });

        test('handles invalid input', () => {
            expect(plugin.convertBibleTextToLink('invalid')).toBe('invalid');
        });
    });

    describe('convertBibleTextToMarkdownLink', () => {
        const testCases = [
            {
                input: 'offb21:3',
                expected: '[Offenbarung 21:3](jwlibrary:///finder?bible=66021003)'
            },
            {
                input: '1mo1:1',
                expected: '[1. Mose 1:1](jwlibrary:///finder?bible=01001001)'
            },
            {
                input: 'ps 23:1-3',
                expected: '[Psalm 23:1-3](jwlibrary:///finder?bible=19023001-19023003)'
            },
            {
                input: 'hoh1:1',
                expected: '[Hohes Lied 1:1](jwlibrary:///finder?bible=22001001)'
            },
            {
                input: 'ps105:3',
                expected: '[Psalm 105:3](jwlibrary:///finder?bible=19105003)'
            },
            {
                input: 'Ps 29:10',
                expected: '[Psalm 29:10](jwlibrary:///finder?bible=19029010)'
            }
        ];

        test.each(testCases)('formats "$input" to "$expected"', ({ input, expected }) => {
            expect(plugin.convertBibleTextToMarkdownLink(input)).toBe(expected);
        });
    });

    describe('parseBibleReference', () => {
        test('parses simple reference', () => {
            const result = plugin['parseBibleReference']('joh3:16');
            expect(result).toEqual({
                book: '43',
                chapter: '003',
                verse: '016',
                endVerse: undefined
            });
        });

        test('parses reference with space', () => {
            const result = plugin['parseBibleReference']('joh 3:16');
            expect(result).toEqual({
                book: '43',
                chapter: '003',
                verse: '016',
                endVerse: undefined
            });
        });

        test('parses verse range', () => {
            const result = plugin['parseBibleReference']('ps23:1-3');
            expect(result).toEqual({
                book: '19',
                chapter: '023',
                verse: '001',
                endVerse: '003'
            });
        });

        test('throws on invalid book', () => {
            expect(() => {
                plugin['parseBibleReference']('xyz1:1');
            }).toThrow('Book not found');
        });

        test('throws on invalid format', () => {
            expect(() => {
                plugin['parseBibleReference']('joh:1');
            }).toThrow('Invalid format');
        });
    });

    describe('formatBibleText', () => {
        const testCases = [
            {
                input: 'offb21:3',
                expected: 'Offenbarung 21:3'
            },
            {
                input: '1mo1:1',
                expected: '1. Mose 1:1'
            },
            {
                input: 'hoh 1:1',
                expected: 'Hohes Lied 1:1'
            },
            {
                input: 'ps23:1-3',
                expected: 'Psalm 23:1-3'
            }
        ];

        test.each(testCases)('formats "$input" to "$expected"', ({ input, expected }) => {
            expect(plugin['formatBibleText'](input)).toBe(expected);
        });
    });
}); 