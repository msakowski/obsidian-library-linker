import { beforeAll, describe, expect, test } from 'vitest';
import { initializeTestBibleBooks } from '../__tests__/__helpers__/initializeBibleBooksForTests';
import { createSettings } from '../__tests__/__helpers__/createSettings';
import { linkUnlinkedBibleReferences } from './linkUnlinkedBibleReferences';

beforeAll((): void => {
  initializeTestBibleBooks(['IN', 'INI', 'N', 'NDF']);
});

describe.each(['N', 'NDF'] as const)('Norwegian references in %s', (language): void => {
  test.each([
    { text: '1. Mosebok 1:1', bibleId: '01001001' },
    { text: '1. Mos. 1:1', bibleId: '01001001' },
    { text: '1Mo 1:1', bibleId: '01001001' },
    { text: 'Rut 1:1', bibleId: '08001001' },
    { text: 'Ru 1:1', bibleId: '08001001' },
    { text: 'Am 1:1', bibleId: '30001001' },
    { text: 'Ob 1:1', bibleId: '31001001' },
    { text: 'Obad. 1:1', bibleId: '31001001' },
    { text: 'Mi 1:1', bibleId: '33001001' },
    { text: 'Mik 1:1', bibleId: '33001001' },
    { text: 'Apostlenes gjerninger 1:1', bibleId: '44001001' },
    { text: 'Ap.gj. 1:1', bibleId: '44001001' },
    { text: 'Fil 1:1', bibleId: '50001001' },
    { text: 'Filip. 1:1', bibleId: '50001001' },
    { text: '1Te 1:1', bibleId: '52001001' },
    { text: '1Ts 1:1', bibleId: '52001001' },
    { text: '2Te 1:1', bibleId: '53001001' },
    { text: '2Ts 1:1', bibleId: '53001001' },
    { text: 'Åp. 1:1', bibleId: '66001001' },
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
