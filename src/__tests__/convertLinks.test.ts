import { convertLinks } from '@/utils/convertLinks';

describe('convertLinks', () => {
  test('converts Bible references', () => {
    const input = '[John 3:16](jwpub://b/NWTR/43:3:16-43:3:16)';
    expect(convertLinks(input, 'bible')).toBe('[John 3:16](jwlibrary:///finder?bible=43003016)');
  });

  test('converts publication references', () => {
    const input = '[Study Article](jwpub://p/X:102021001/15)';
    expect(convertLinks(input, 'publication')).toBe(
      '[Study Article](jwlibrary:///finder?wtlocale=X&docid=102021001&par=15)',
    );
  });

  test('converts both types when type is "all"', () => {
    const input = `
      [John 3:16](jwpub://b/NWTR/43:3:16-43:3:16)
      [Study Article](jwpub://p/X:102021001/15)
    `;
    const expected = `
      [John 3:16](jwlibrary:///finder?bible=43003016)
      [Study Article](jwlibrary:///finder?wtlocale=X&docid=102021001&par=15)
    `;
    expect(convertLinks(input, 'all')).toBe(expected);
  });

  test('converts both types by default', () => {
    const input = `
      [John 3:16](jwpub://b/NWTR/43:3:16-43:3:16)
      [Study Article](jwpub://p/X:102021001/15)
    `;
    const expected = `
      [John 3:16](jwlibrary:///finder?bible=43003016)
      [Study Article](jwlibrary:///finder?wtlocale=X&docid=102021001&par=15)
    `;
    expect(convertLinks(input)).toBe(expected);
  });

  test('ignores non-matching links', () => {
    const input = '[Regular Link](https://example.com)';
    expect(convertLinks(input)).toBe(input);
  });

  test('handles multiple links in the same line', () => {
    const input =
      '[John 3:16](jwpub://b/NWTR/43:3:16-43:3:16) and [Study Article](jwpub://p/X:102021001/15)';
    const expected =
      '[John 3:16](jwlibrary:///finder?bible=43003016) and [Study Article](jwlibrary:///finder?wtlocale=X&docid=102021001&par=15)';
    expect(convertLinks(input)).toBe(expected);
  });

  test('only converts specified type when type is provided', () => {
    const input = `
      [John 3:16](jwpub://b/NWTR/43:3:16-43:3:16)
      [Study Article](jwpub://p/X:102021001/15)
    `;
    expect(convertLinks(input, 'bible')).toBe(`
      [John 3:16](jwlibrary:///finder?bible=43003016)
      [Study Article](jwpub://p/X:102021001/15)
    `);
    expect(convertLinks(input, 'publication')).toBe(`
      [John 3:16](jwpub://b/NWTR/43:3:16-43:3:16)
      [Study Article](jwlibrary:///finder?wtlocale=X&docid=102021001&par=15)
    `);
  });
});

export {};
