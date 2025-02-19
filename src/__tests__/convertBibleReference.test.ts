import { convertBibleReference } from '@/utils/convertBibleReference';

describe('convertBibleReference', () => {
  test('converts jwpub to jwlibrary format', () => {
    expect(convertBibleReference('jwpub://b/NWTR/20:1:8-20:1:8')).toBe(
      'jwlibrary:///finder?bible=20001008',
    );
  });

  test('handles single digit chapter and verse', () => {
    expect(convertBibleReference('jwpub://b/NWTR/1:1:5-1:1:7')).toBe(
      'jwlibrary:///finder?bible=1001005-1001007',
    );
  });

  test('handles double digit chapter and verse', () => {
    expect(convertBibleReference('jwpub://b/NWTR/1:12:15-1:12:20')).toBe(
      'jwlibrary:///finder?bible=1012015-1012020',
    );
  });

  test('handles triple digit chapter and verse', () => {
    expect(convertBibleReference('jwpub://b/NWTR/19:119:119-19:119:126')).toBe(
      'jwlibrary:///finder?bible=19119119-19119126',
    );
  });
});
