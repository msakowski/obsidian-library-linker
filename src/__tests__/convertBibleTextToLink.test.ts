import {
  convertBibleTextToLink,
  convertBibleTextToMarkdownLink,
} from '@/utils/convertBibleTextToLink';

describe('convertBibleTextToLink', () => {
  test('converts valid Bible reference to link', () => {
    expect(convertBibleTextToLink('joh3:16', 'E')).toBe(
      'jwlibrary:///finder?bible=43003016&wtlocale=E',
    );
    expect(convertBibleTextToLink('ps23:1', 'X')).toBe(
      'jwlibrary:///finder?bible=19023001&wtlocale=X',
    );
  });

  test('handles verse ranges', () => {
    expect(convertBibleTextToLink('ps23:1-3', 'X')).toBe(
      'jwlibrary:///finder?bible=19023001-19023003&wtlocale=X',
    );
    expect(convertBibleTextToLink('off21:3-4', 'X')).toBe(
      'jwlibrary:///finder?bible=66021003-66021004&wtlocale=X',
    );
  });

  test('handles complex verse references', () => {
    expect(convertBibleTextToLink('joh1:1,2,4,6,7-8,12-14', 'E')).toEqual([
      'jwlibrary:///finder?bible=43001001-43001002&wtlocale=E',
      'jwlibrary:///finder?bible=43001004&wtlocale=E',
      'jwlibrary:///finder?bible=43001006-43001008&wtlocale=E',
      'jwlibrary:///finder?bible=43001012-43001014&wtlocale=E',
    ]);
    expect(convertBibleTextToLink('1mo3:1-5,7,9', 'X')).toEqual([
      'jwlibrary:///finder?bible=01003001-01003005&wtlocale=X',
      'jwlibrary:///finder?bible=01003007&wtlocale=X',
      'jwlibrary:///finder?bible=01003009&wtlocale=X',
    ]);
  });

  test('returns input on invalid reference', () => {
    console.error = jest.fn(); // Silence console.error for this test
    expect(convertBibleTextToLink('invalid', 'E')).toBe('invalid');
    expect(convertBibleTextToLink('xyz1:1', 'E')).toBe('xyz1:1');
  });
});

describe('convertBibleTextToMarkdownLink', () => {
  describe('with long format', () => {
    test('converts single verse to markdown link', () => {
      expect(convertBibleTextToMarkdownLink('joh3:16', false, 'E')).toBe(
        '[John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)',
      );
      expect(convertBibleTextToMarkdownLink('ps23:1', false, 'X')).toBe(
        '[Psalm 23:1](jwlibrary:///finder?bible=19023001&wtlocale=X)',
      );
    });

    test('converts verse range to markdown link', () => {
      expect(convertBibleTextToMarkdownLink('ps23:1-3', false, 'X')).toBe(
        '[Psalm 23:1-3](jwlibrary:///finder?bible=19023001-19023003&wtlocale=X)',
      );
      expect(convertBibleTextToMarkdownLink('off21:3-4', false, 'X')).toBe(
        '[Offenbarung 21:3-4](jwlibrary:///finder?bible=66021003-66021004&wtlocale=X)',
      );
    });

    test('converts complex verse reference to multiple markdown links', () => {
      expect(convertBibleTextToMarkdownLink('joh1:1,2,4,6,7-8,12-14', false, 'E')).toBe(
        '[John 1:1-2](jwlibrary:///finder?bible=43001001-43001002&wtlocale=E),' +
          '[4](jwlibrary:///finder?bible=43001004&wtlocale=E),' +
          '[6-8](jwlibrary:///finder?bible=43001006-43001008&wtlocale=E),' +
          '[12-14](jwlibrary:///finder?bible=43001012-43001014&wtlocale=E)',
      );
      expect(convertBibleTextToMarkdownLink('1mo3:1-5,7,9', false, 'X')).toBe(
        '[1. Mose 3:1-5](jwlibrary:///finder?bible=01003001-01003005&wtlocale=X),' +
          '[7](jwlibrary:///finder?bible=01003007&wtlocale=X),' +
          '[9](jwlibrary:///finder?bible=01003009&wtlocale=X)',
      );
    });
  });

  describe('with short format', () => {
    test('converts single verse to markdown link', () => {
      expect(convertBibleTextToMarkdownLink('joh3:16', true, 'E')).toBe(
        '[Joh 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)',
      );
      expect(convertBibleTextToMarkdownLink('ps23:1', true, 'X')).toBe(
        '[Ps 23:1](jwlibrary:///finder?bible=19023001&wtlocale=X)',
      );
    });

    test('converts verse range to markdown link', () => {
      expect(convertBibleTextToMarkdownLink('ps23:1-3', true, 'X')).toBe(
        '[Ps 23:1-3](jwlibrary:///finder?bible=19023001-19023003&wtlocale=X)',
      );
      expect(convertBibleTextToMarkdownLink('off21:3-4', true, 'X')).toBe(
        '[Off 21:3-4](jwlibrary:///finder?bible=66021003-66021004&wtlocale=X)',
      );
    });

    test('converts complex verse reference to multiple markdown links', () => {
      expect(convertBibleTextToMarkdownLink('joh1:1,2,4,6,7-8,12-14', true, 'E')).toBe(
        '[Joh 1:1-2](jwlibrary:///finder?bible=43001001-43001002&wtlocale=E),' +
          '[4](jwlibrary:///finder?bible=43001004&wtlocale=E),' +
          '[6-8](jwlibrary:///finder?bible=43001006-43001008&wtlocale=E),' +
          '[12-14](jwlibrary:///finder?bible=43001012-43001014&wtlocale=E)',
      );
      expect(convertBibleTextToMarkdownLink('1mo3:1-5,7,9', true, 'X')).toBe(
        '[1Mo 3:1-5](jwlibrary:///finder?bible=01003001-01003005&wtlocale=X),' +
          '[7](jwlibrary:///finder?bible=01003007&wtlocale=X),' +
          '[9](jwlibrary:///finder?bible=01003009&wtlocale=X)',
      );
    });
  });

  test('returns input on invalid reference', () => {
    expect(convertBibleTextToMarkdownLink('invalid', true, 'E')).toBe('invalid');
    expect(convertBibleTextToMarkdownLink('xyz1:1', true, 'E')).toBe('xyz1:1');
  });
});

export {};
