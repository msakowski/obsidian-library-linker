import { beforeAll, describe, expect, test } from 'vitest';
import { initializeTestBibleBooks } from '../__tests__/__helpers__/initializeBibleBooksForTests';
import { createSettings } from '../__tests__/__helpers__/createSettings';
import { linkUnlinkedBibleReferences } from './linkUnlinkedBibleReferences';

beforeAll((): void => {
  initializeTestBibleBooks(['IN', 'INI']);
});

describe.each(['IN', 'INI'] as const)('Indonesian references in %s', (language): void => {
  test.each([
    { text: 'Kisah Para Rasul 1:1', bibleId: '44001001' },
    { text: 'KisahParaRasul 1:1', bibleId: '44001001' },
    { text: 'Kisah 1:1', bibleId: '44001001' },
    { text: 'Hakim-Hakim 3:1', bibleId: '07003001' },
    { text: 'HakimHakim 3:1', bibleId: '07003001' },
    { text: 'Hakim 3:1', bibleId: '07003001' },
  ])('links the complete reference $text to the correct book', ({ text, bibleId }): void => {
    const settings = createSettings({ language, updatedLinkStructure: 'keepCurrentStructure' });
    let callbackCalled = false;

    linkUnlinkedBibleReferences(text, settings, (result): void => {
      callbackCalled = true;
      expect(result.error).toBeUndefined();
      expect(result.changes).toEqual([
        {
          from: { line: 0, ch: 0 },
          to: { line: 0, ch: text.length },
          text: `[${text}](jwlibrary:///finder?bible=${bibleId}&wtlocale=${language})`,
        },
      ]);
    });

    expect(callbackCalled).toBe(true);
  });
});
