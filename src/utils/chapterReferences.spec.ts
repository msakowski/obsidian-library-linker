import { insertAllBibleQuotes } from '@/utils/insertBibleQuotes';
import { convertLinks } from '@/utils/convertLinks';
import type { App, Editor, PluginManifest, TFile } from 'obsidian';
import { BibleReferenceSuggester } from '@/BibleReferenceSuggester';
import JWLibraryLinkerPlugin from '@/main';
import type { BibleCitationProvider } from '@/types';
import type { TranslationService } from '@/services/TranslationService';
import { linkUnlinkedBibleReferences } from '@/utils/linkUnlinkedBibleReferences';
import { initializeTestBibleBooks } from '@/__tests__/__helpers__/initializeBibleBooksForTests';
import { createSettings } from '@/__tests__/__helpers__/createSettings';
import { parseBibleReference } from '@/utils/parseBibleReference';
import { convertBibleTextToMarkdownLink } from '@/utils/convertBibleTextToMarkdownLink';

beforeAll(() => initializeTestBibleBooks());

test('converts a chapter reference without inventing a verse range', () => {
  const reference = parseBibleReference('1 Kings 1', 'E');
  expect(convertBibleTextToMarkdownLink(reference, createSettings({ bookLength: 'long' }))).toBe(
    '[1 Kings 1](jwlibrary:///finder?bible=11001000&wtlocale=E)',
  );
});

test('offers explicit whole chapters for single-chapter books without changing verse shorthand', () => {
  const settings = createSettings({ bookLength: 'long' });
  expect(convertBibleTextToMarkdownLink(parseBibleReference('Jude 1:*', 'E'), settings)).toBe(
    '[Jude 1:*](jwlibrary:///finder?bible=65001000&wtlocale=E)',
  );
  expect(convertBibleTextToMarkdownLink(parseBibleReference('Jude 5', 'E'), settings)).toBe(
    '[Jude 5](jwlibrary:///finder?bible=65001005&wtlocale=E)',
  );
});

test('finds full chapters for bulk linking without consuming partial references or words', () => {
  const settings = createSettings({ bookLength: 'long' });
  linkUnlinkedBibleReferences('Read John 3; Jude 1:*; John 3:16.', settings, (result) => {
    expect(result.changes.map((change) => change.text)).toEqual([
      '[John 3](jwlibrary:///finder?bible=43003000&wtlocale=E)',
      '[Jude 1:*](jwlibrary:///finder?bible=65001000&wtlocale=E)',
      '[John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)',
    ]);
  });
  for (const text of ['John 3:', 'John 3-', 'John 3a', 'LongJohn 3', 'John 30', 'John 0']) {
    linkUnlinkedBibleReferences(text, settings, (result) => {
      expect(result.changes, text).toEqual([]);
    });
  }
});

test('offers chapter suggestions after the editor trigger', () => {
  const plugin = new JWLibraryLinkerPlugin({} as App, {} as PluginManifest);
  plugin.settings = createSettings({ bookLength: 'long' });
  vi.spyOn(plugin, 'getTranslationService').mockReturnValue({
    t: (key: string) => key,
  } as TranslationService);
  const suggester = new BibleReferenceSuggester(plugin);
  const editor = { getLine: () => 'Read John 3' } as unknown as Editor;
  const trigger = suggester.onTrigger({ line: 0, ch: 11 }, editor);
  expect(trigger?.query).toBe('John 3');
  expect(
    suggester
      .getSuggestions({ ...trigger!, editor, file: {} as TFile })
      .map((item) => item.command),
  ).toEqual(['link', 'open']);
});

test('preserves chapter links beside quoted verses without requesting a verse-zero quote', async () => {
  const line =
    '[John 3](jwlibrary:///finder?bible=43003000&wtlocale=E),[John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)';
  const transaction = vi.fn<Editor['transaction']>();
  const editor = {
    lastLine: () => 0,
    getLine: () => line,
    transaction,
  } as unknown as Editor;
  const provider = {
    getCitation: vi
      .fn<BibleCitationProvider['getCitation']>()
      .mockResolvedValue({ success: true, text: 'Verse text', citation: '', source: 'online' }),
    isLanguageAvailable: vi
      .fn<BibleCitationProvider['isLanguageAvailable']>()
      .mockResolvedValue(true),
  };
  const result = await insertAllBibleQuotes(editor, createSettings(), provider);
  expect(provider.getCitation).toHaveBeenCalledTimes(1);
  expect(provider.getCitation.mock.calls[0][0]).toEqual({
    book: 43,
    chapter: 3,
    verseRanges: [{ start: 16, end: 16 }],
  });
  expect(result.inserted).toBe(1);
  expect(transaction.mock.calls[0][0].changes?.[0].from).toEqual({ line: 0, ch: line.length });
  expect(
    convertLinks(
      '[John 3](jwlibrary:///finder?bible=43003000&wtlocale=E)',
      'bible',
      createSettings({ reconvertExistingLinks: true, bookLength: 'long' }),
    ),
  ).toBe('[John 3](jwlibrary:///finder?bible=43003000&wtlocale=E)');
});

test('supports localized chapter references and rejects invalid chapters', () => {
  expect(
    convertBibleTextToMarkdownLink(
      parseBibleReference('요한 1서 3', 'KO'),
      createSettings({ language: 'KO', bookLength: 'long', noLanguageParameter: true }),
    ),
  ).toBe('[요한 1서 3](jwlibrary:///finder?bible=62003000)');
  for (const input of ['John 22', 'John 0', 'Jude 2:*', 'John 1-2', 'John 1x:*']) {
    expect(() => parseBibleReference(input, 'E'), input).toThrow();
  }
});

test('detects chapter references followed by punctuation', () => {
  linkUnlinkedBibleReferences(
    'John 3, John 4; Jude 1:*, then continue.',
    createSettings(),
    (result) => {
      expect(result.changes).toHaveLength(3);
    },
  );
});
