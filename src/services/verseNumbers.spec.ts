import { Platform, requestUrl } from 'obsidian';
import { BibleTextFetcher } from '@/services/BibleTextFetcher';
import { ConfiguredBibleCitationProvider } from '@/services/ConfiguredBibleCitationProvider';
import { OfflineBibleCitationProvider } from '@/services/OfflineBibleCitationProvider';
import { OnlineBibleCitationProvider } from '@/services/OnlineBibleCitationProvider';
import { VaultOfflineBibleRepository } from '@/services/VaultOfflineBibleRepository';
import { DEFAULT_SETTINGS } from '@/main';
import { createInMemoryAdapter } from '@/__tests__/__helpers__/createInMemoryAdapter';
import { initializeTestBibleBooks } from '@/__tests__/__helpers__/initializeBibleBooksForTests';
import type { BibleReference } from '@/types';

const reference: BibleReference = { book: 1, chapter: 1, verseRanges: [{ start: 1, end: 2 }] };
const wol =
  '<span id="v1-1-1-2">continued.</span><span id="v1-1-1-1"><a class="vl">1</a>First<a class="fn">*</a></span><span id="v1-1-2-1"><a class="vl">2</a>Second.</span><span id="v1-1-4-1"><a class="vl">4</a>Fourth.</span>';
const jw =
  '<span id="v1001001"><span class="chapterNum">1</span>First continued.</span><span id="v1001002"><sup class="verseNum">2</sup>Second.</span><span id="v1001004"><sup class="verseNum">4</sup>Fourth.</span>';

beforeAll(() => initializeTestBibleBooks());
beforeEach(() => {
  vi.clearAllMocks();
  BibleTextFetcher.clearCache();
  Object.assign(Platform, { isDesktopApp: false, isMobileApp: true });
});

async function setup(offline: boolean) {
  const settings = structuredClone(DEFAULT_SETTINGS);
  const repository = new VaultOfflineBibleRepository(createInMemoryAdapter(), 'offline');
  if (offline) {
    await repository.saveCorpus(
      {
        language: 'E',
        sourceFileName: 'test.epub',
        sourceFileChecksum: 'test',
        importedAt: '',
        bookCount: 1,
        chapterCount: 1,
        verseCount: 3,
      },
      [
        {
          language: 'E',
          book: 1,
          chapter: 1,
          verses: { '1': 'First continued.', '2': 'Second.', '4': 'Fourth.' },
          source: { sourceFileChecksum: 'test', importedAt: '' },
        },
      ],
    );
  }
  const provider = new ConfiguredBibleCitationProvider(
    () => settings,
    new OfflineBibleCitationProvider(repository, (key) => key),
    new OnlineBibleCitationProvider(),
    (key) => key,
  );
  return { settings, provider };
}

describe.each(['offline', 'WOL fallback', 'jw.org fallback'])('%s verse numbers', (source) => {
  beforeEach(() => {
    vi.mocked(requestUrl).mockResolvedValue({
      status: 200,
      text: source === 'WOL fallback' ? wol : jw,
    } as Awaited<ReturnType<typeof requestUrl>>);
  });

  test('defaults to plain text and applies setting changes without reimporting or refetching', async () => {
    const { settings, provider } = await setup(source === 'offline');
    expect((await provider.getCitation(reference, 'E')).text).toBe('First continued. Second.');
    settings.bibleQuote.includeVerseNumbers = true;
    expect(await provider.getCitation(reference, 'E')).toMatchObject({
      success: true,
      source: source === 'offline' ? 'offline' : 'online',
      text: '1 First continued. 2 Second.',
    });
    settings.bibleQuote.includeVerseNumbers = false;
    expect((await provider.getCitation(reference, 'E')).text).toBe('First continued. Second.');
    expect(requestUrl).toHaveBeenCalledTimes(source === 'offline' ? 0 : 1);
  });

  test('keeps single verses unnumbered and preserves numbers across gaps', async () => {
    const { settings, provider } = await setup(source === 'offline');
    settings.bibleQuote.includeVerseNumbers = true;
    expect(
      (await provider.getCitation({ ...reference, verseRanges: [{ start: 2, end: 2 }] }, 'E')).text,
    ).toBe('Second.');
    expect(
      (
        await provider.getCitation(
          {
            ...reference,
            verseRanges: [
              { start: 1, end: 2 },
              { start: 4, end: 4 },
            ],
          },
          'E',
        )
      ).text,
    ).toBe('1 First continued. 2 Second. 4 Fourth.');
  });

  test('does not insert partial quotes for missing verses or cross-chapter references', async () => {
    const { settings, provider } = await setup(source === 'offline');
    settings.bibleQuote.includeVerseNumbers = true;
    for (const selection of [
      { ...reference, verseRanges: [{ start: 1, end: 3 }] },
      { ...reference, endChapter: 2 },
    ]) {
      expect(await provider.getCitation(selection, 'E')).toMatchObject({
        success: false,
        text: '',
      });
    }
  });
});

test('numbered quotes still respect disabled online fallback', async () => {
  const { settings, provider } = await setup(false);
  settings.bibleQuote.includeVerseNumbers = true;
  settings.offlineBible.allowOnlineFallback = false;
  expect(await provider.getCitation(reference, 'E')).toMatchObject({
    success: false,
    source: 'offline',
  });
  expect(requestUrl).not.toHaveBeenCalled();
});
