import { Notice } from 'obsidian';

// The Obsidian mock exports a real Notice class — replace it with a spy so the
// user-facing failure messages can be asserted on.
vi.mock('obsidian', async () => ({
  ...(await vi.importActual<typeof import('obsidian')>('obsidian')),
  Notice: vi.fn(),
}));

import { AutoBibleQuoteInserter } from '@/services/AutoBibleQuoteInserter';
import { convertBibleTextToMarkdownLink } from '@/utils/convertBibleTextToMarkdownLink';
import type { BibleCitationProvider, BibleReference, LinkReplacerSettings } from '@/types';
import { BIBLE_QUOTE_TEMPLATES } from '@/types';
import { createSettings } from './__helpers__/createSettings';
import { createFakeEditor } from './__helpers__/createFakeEditor';
import { initializeTestBibleBooks } from './__helpers__/initializeBibleBooksForTests';
import type { Mock } from 'vitest';

const JOHN_3_16: BibleReference = { book: 43, chapter: 3, verseRanges: [{ start: 16, end: 16 }] };
const QUOTE = 'For God loved the world so much.';

const t = (key: string) => key;

let settings: LinkReplacerSettings;
let provider: BibleCitationProvider;
let getCitation: Mock;

beforeAll(() => {
  initializeTestBibleBooks();
});

beforeEach(() => {
  vi.clearAllMocks();

  settings = createSettings({
    bibleQuote: {
      template: BIBLE_QUOTE_TEMPLATES.short,
      autoInsertOnLinkCreation: true,
    },
  });

  getCitation = vi.fn().mockResolvedValue({
    success: true,
    source: 'online',
    text: QUOTE,
    citation: 'John 3:16',
  });

  provider = {
    getCitation,
    isLanguageAvailable: vi.fn().mockResolvedValue(true),
  };
});

function createInserter(): AutoBibleQuoteInserter {
  return new AutoBibleQuoteInserter(() => settings, provider, t);
}

describe('AutoBibleQuoteInserter', () => {
  test('inserts the quote for a link the suggester just created', async () => {
    const link = convertBibleTextToMarkdownLink(JOHN_3_16, settings)!;
    const editor = createFakeEditor(link);

    createInserter().scheduleForCreatedLink(editor, JOHN_3_16, link, 0);

    await vi.waitFor(() => expect(editor.getContent()).toBe(`${link.trim()}\n> ${QUOTE}\n`));
  });

  test('does nothing when the setting is off', async () => {
    settings.bibleQuote.autoInsertOnLinkCreation = false;

    const link = convertBibleTextToMarkdownLink(JOHN_3_16, settings)!;
    const editor = createFakeEditor(link);

    createInserter().scheduleForCreatedLink(editor, JOHN_3_16, link, 0);

    await Promise.resolve();
    expect(getCitation).not.toHaveBeenCalled();
    expect(editor.getContent()).toBe(link);
  });

  test('returns before the citation is fetched, so typing is never blocked', () => {
    const link = convertBibleTextToMarkdownLink(JOHN_3_16, settings)!;
    const editor = createFakeEditor(link);

    createInserter().scheduleForCreatedLink(editor, JOHN_3_16, link, 0);

    // The editor is only touched once the (async) citation has arrived.
    expect(editor.getContent()).toBe(link);
  });

  test('does not quote the same link twice while an insertion is in flight', async () => {
    const link = convertBibleTextToMarkdownLink(JOHN_3_16, settings)!;
    const editor = createFakeEditor(link);
    const inserter = createInserter();

    inserter.scheduleForCreatedLink(editor, JOHN_3_16, link, 0);
    inserter.scheduleForCreatedLink(editor, JOHN_3_16, link, 0);

    await vi.waitFor(() => expect(editor.getContent()).toBe(`${link.trim()}\n> ${QUOTE}\n`));
    expect(getCitation).toHaveBeenCalledTimes(1);
  });

  test('ignores text without a JW Library link', () => {
    const editor = createFakeEditor('John 3:16');

    createInserter().scheduleForCreatedLink(editor, JOHN_3_16, 'John 3:16', 0);

    expect(getCitation).not.toHaveBeenCalled();
  });

  test('shows a notice and leaves the note untouched when the fetch fails', async () => {
    getCitation.mockResolvedValue({
      success: false,
      source: 'online',
      text: '',
      citation: '',
      error: 'no connection',
    });

    const link = convertBibleTextToMarkdownLink(JOHN_3_16, settings)!;
    const editor = createFakeEditor(link);

    const result = await createInserter().insertNow(editor, JOHN_3_16, {
      line: 0,
      linkUrl: 'jwlibrary:///finder?bible=43003016&wtlocale=E',
    });

    expect(result.fetchFailed).toBe(true);
    expect(editor.getContent()).toBe(link);
    expect(Notice).toHaveBeenCalledWith('notices.bibleQuoteFetchFailed');
  });

  test('shows a notice and does not throw when the insertion errors', async () => {
    getCitation.mockRejectedValue(new Error('boom'));

    const link = convertBibleTextToMarkdownLink(JOHN_3_16, settings)!;
    const editor = createFakeEditor(link);

    const result = await createInserter().insertNow(editor, JOHN_3_16, {
      line: 0,
      linkUrl: 'jwlibrary:///finder?bible=43003016&wtlocale=E',
    });

    expect(result.inserted).toBe(false);
    expect(editor.getContent()).toBe(link);
    expect(Notice).toHaveBeenCalled();
  });
});
