import { beforeAll, describe, expect, test } from 'vitest';
import type { EditorSuggestContext } from 'obsidian';
import { BibleReferenceSuggester } from '@/BibleReferenceSuggester';
import type JWLibraryLinkerPlugin from '@/main';
import type { Language } from '@/types';
import { createSettings } from './__tests__/__helpers__/createSettings';
import { initializeTestBibleBooks } from './__tests__/__helpers__/initializeBibleBooksForTests';

beforeAll(() => {
  initializeTestBibleBooks(['E', 'F']);
});

function suggestionsFor(query: string, language: Language) {
  const plugin = {
    app: {},
    settings: createSettings({ language }),
    getTranslationService: () => ({ t: (key: string) => key }),
  } as unknown as JWLibraryLinkerPlugin;
  return new BibleReferenceSuggester(plugin).getSuggestions({ query } as EditorSuggestContext);
}

describe('BibleReferenceSuggester silent mode', () => {
  test.each([
    ['Jude 3', 'E'],
    ['Jude 25', 'F'],
    ['Philemon 4', 'E'],
  ] as const)('suggests the single-chapter book reference %s', (query, language) => {
    expect(suggestionsFor(query, language)).not.toHaveLength(0);
  });

  test('suggests nothing for a word that is not a book', () => {
    expect(suggestionsFor('Room 25', 'E')).toHaveLength(0);
  });
});
