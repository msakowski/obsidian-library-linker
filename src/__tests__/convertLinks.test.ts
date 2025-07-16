import { LinkReplacerSettings } from '@/types';
import { convertLinks } from '@/utils/convertLinks';
import { TEST_DEFAULT_SETTINGS } from 'mocks/plugin';

describe('convertLinks', () => {
  const settings: LinkReplacerSettings = TEST_DEFAULT_SETTINGS;
  test('converts Bible references', () => {
    const input = '[John 3:16](jwpub://b/NWTR/43:3:16-43:3:16)';
    expect(convertLinks(input, 'bible', settings)).toBe(
      '[John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)',
    );
  });

  test('converts publication references', () => {
    const input = `
      [Study Article](jwpub://p/X:102021001/15)
      [Study Article](jwpub://p/X:102021001)
    `;
    expect(convertLinks(input, 'publication', settings)).toBe(`
      [Study Article](jwlibrary:///finder?wtlocale=X&docid=102021001&par=15)
      [Study Article](jwlibrary:///finder?wtlocale=X&docid=102021001)
    `);
  });

  test('converts both types when type is "all"', () => {
    const input = `
      [John 3:16](jwpub://b/NWTR/43:3:16-43:3:16)
      [Study Article](jwpub://p/X:102021001/15)
    `;
    const expected = `
      [John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)
      [Study Article](jwlibrary:///finder?wtlocale=X&docid=102021001&par=15)
    `;
    expect(convertLinks(input, 'all', settings)).toBe(expected);
  });

  test('converts both types by default', () => {
    const input = `
      [John 3:16](jwpub://b/NWTR/43:3:16-43:3:16)
      [Study Article](jwpub://p/X:102021001/15)
    `;
    const expected = `
      [John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)
      [Study Article](jwlibrary:///finder?wtlocale=X&docid=102021001&par=15)
    `;
    expect(convertLinks(input, 'all', settings)).toBe(expected);
  });

  test('ignores non-matching links', () => {
    const input = '[Regular Link](https://example.com)';
    expect(convertLinks(input, 'all', settings)).toBe(input);
  });

  test('handles multiple links in the same line', () => {
    const input =
      '[John 3:16](jwpub://b/NWTR/43:3:16-43:3:16) and [Study Article](jwpub://p/X:102021001/15)';
    const expected =
      '[John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E) and [Study Article](jwlibrary:///finder?wtlocale=X&docid=102021001&par=15)';
    expect(convertLinks(input, 'all', settings)).toBe(expected);
  });

  test('only converts specified type when type is provided', () => {
    const input = `
      [John 3:16](jwpub://b/NWTR/43:3:16-43:3:16)
      [Study Article](jwpub://p/X:102021001/15)
    `;
    expect(convertLinks(input, 'bible', settings)).toBe(`
      [John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)
      [Study Article](jwpub://p/X:102021001/15)
    `);
    expect(convertLinks(input, 'publication', settings)).toBe(`
      [John 3:16](jwpub://b/NWTR/43:3:16-43:3:16)
      [Study Article](jwlibrary:///finder?wtlocale=X&docid=102021001&par=15)
    `);
  });

  // TODO: Add test for web links, they do not work (never did?)
  // test('converts web links', () => {
  //   const input = '[JW.org](https://www.jw.org/en/library/bible/jwpub/NWTR/43:3:16-43:3:16)';
  //   expect(convertLinks(input, 'web', settings)).toBe(
  //     '[JW.org](jwlibrary:///finder?bible=43003016&wtlocale=E)',
  //   );
  // });

  test('omit language parameter when noLanguageParameter is true', () => {
    const settings: LinkReplacerSettings = {
      ...TEST_DEFAULT_SETTINGS,
      noLanguageParameter: true,
    };
    const input = '[John 3:16](jwpub://b/NWTR/43:3:16-43:3:16)';
    expect(convertLinks(input, 'bible', settings)).toBe(
      '[John 3:16](jwlibrary:///finder?bible=43003016)',
    );
  });
});

export {};
