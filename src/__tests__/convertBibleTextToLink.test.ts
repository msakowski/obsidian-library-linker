import {
  convertBibleTextToLink,
  convertBibleTextToMarkdownLink,
} from '@/utils/convertBibleTextToLink';

describe('convertBibleTextToLink', () => {
  test('converts valid Bible reference to link', () => {
    expect(convertBibleTextToLink('joh3:16')).toBe('jwlibrary:///finder?bible=43003016');
    expect(convertBibleTextToLink('ps23:1')).toBe('jwlibrary:///finder?bible=19023001');
  });

  test('handles verse ranges', () => {
    expect(convertBibleTextToLink('ps23:1-3')).toBe('jwlibrary:///finder?bible=19023001-19023003');
    expect(convertBibleTextToLink('off21:3-4')).toBe('jwlibrary:///finder?bible=66021003-66021004');
  });

  test('handles complex verse references', () => {
    expect(convertBibleTextToLink('joh1:1,2,4,6,7-8,12-14')).toEqual([
      'jwlibrary:///finder?bible=43001001-43001002',
      'jwlibrary:///finder?bible=43001004',
      'jwlibrary:///finder?bible=43001006-43001008',
      'jwlibrary:///finder?bible=43001012-43001014',
    ]);
    expect(convertBibleTextToLink('1mo3:1-5,7,9')).toEqual([
      'jwlibrary:///finder?bible=01003001-01003005',
      'jwlibrary:///finder?bible=01003007',
      'jwlibrary:///finder?bible=01003009',
    ]);
  });

  test('returns input on invalid reference', () => {
    console.error = jest.fn(); // Silence console.error for this test
    expect(convertBibleTextToLink('invalid')).toBe('invalid');
    expect(convertBibleTextToLink('xyz1:1')).toBe('xyz1:1');
  });
});

describe('convertBibleTextToMarkdownLink', () => {
  describe('with long format', () => {
    test('converts single verse to markdown link', () => {
      expect(convertBibleTextToMarkdownLink('joh3:16')).toBe(
        '[Johannes 3:16](jwlibrary:///finder?bible=43003016)',
      );
      expect(convertBibleTextToMarkdownLink('ps23:1')).toBe(
        '[Psalm 23:1](jwlibrary:///finder?bible=19023001)',
      );
    });

    test('converts verse range to markdown link', () => {
      expect(convertBibleTextToMarkdownLink('ps23:1-3')).toBe(
        '[Psalm 23:1-3](jwlibrary:///finder?bible=19023001-19023003)',
      );
      expect(convertBibleTextToMarkdownLink('off21:3-4')).toBe(
        '[Offenbarung 21:3-4](jwlibrary:///finder?bible=66021003-66021004)',
      );
    });

    test('converts complex verse reference to multiple markdown links', () => {
      expect(convertBibleTextToMarkdownLink('joh1:1,2,4,6,7-8,12-14')).toBe(
        '[Johannes 1:1-2](jwlibrary:///finder?bible=43001001-43001002),' +
          '[4](jwlibrary:///finder?bible=43001004),' +
          '[6-8](jwlibrary:///finder?bible=43001006-43001008),' +
          '[12-14](jwlibrary:///finder?bible=43001012-43001014)',
      );
      expect(convertBibleTextToMarkdownLink('1mo3:1-5,7,9')).toBe(
        '[1. Mose 3:1-5](jwlibrary:///finder?bible=01003001-01003005),' +
          '[7](jwlibrary:///finder?bible=01003007),' +
          '[9](jwlibrary:///finder?bible=01003009)',
      );
    });
  });

  describe('with short format', () => {
    test('converts single verse to markdown link', () => {
      expect(convertBibleTextToMarkdownLink('joh3:16', true)).toBe(
        '[Joh 3:16](jwlibrary:///finder?bible=43003016)',
      );
      expect(convertBibleTextToMarkdownLink('ps23:1', true)).toBe(
        '[Ps 23:1](jwlibrary:///finder?bible=19023001)',
      );
    });

    test('converts verse range to markdown link', () => {
      expect(convertBibleTextToMarkdownLink('ps23:1-3', true)).toBe(
        '[Ps 23:1-3](jwlibrary:///finder?bible=19023001-19023003)',
      );
      expect(convertBibleTextToMarkdownLink('off21:3-4', true)).toBe(
        '[Off 21:3-4](jwlibrary:///finder?bible=66021003-66021004)',
      );
    });

    test('converts complex verse reference to multiple markdown links', () => {
      expect(convertBibleTextToMarkdownLink('joh1:1,2,4,6,7-8,12-14', true)).toBe(
        '[Joh 1:1-2](jwlibrary:///finder?bible=43001001-43001002),' +
          '[4](jwlibrary:///finder?bible=43001004),' +
          '[6-8](jwlibrary:///finder?bible=43001006-43001008),' +
          '[12-14](jwlibrary:///finder?bible=43001012-43001014)',
      );
      expect(convertBibleTextToMarkdownLink('1mo3:1-5,7,9', true)).toBe(
        '[1Mo 3:1-5](jwlibrary:///finder?bible=01003001-01003005),' +
          '[7](jwlibrary:///finder?bible=01003007),' +
          '[9](jwlibrary:///finder?bible=01003009)',
      );
    });
  });

  test('returns input on invalid reference', () => {
    expect(convertBibleTextToMarkdownLink('invalid')).toBe('invalid');
    expect(convertBibleTextToMarkdownLink('xyz1:1', true)).toBe('xyz1:1');
  });
});

export {};
