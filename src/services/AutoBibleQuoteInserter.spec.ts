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
import { createSettings } from '../__tests__/__helpers__/createSettings';
import { createFakeEditor } from '../__tests__/__helpers__/createFakeEditor';
import { initializeTestBibleBooks } from '../__tests__/__helpers__/initializeBibleBooksForTests';
import { beforeAll, beforeEach, describe, expect, test, vi, type Mock } from 'vitest';

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
  return new AutoBibleQuoteInserter(
    () => settings,
    provider,
    t,
    () => 'note.md',
  );
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

  test('writes nothing when another note is opened in the editor during the fetch', async () => {
    const link = convertBibleTextToMarkdownLink(JOHN_3_16, settings)!;
    const editor = createFakeEditor(link);
    let filePath = 'first.md';
    const inserter = new AutoBibleQuoteInserter(
      () => settings,
      provider,
      t,
      () => filePath,
    );

    inserter.scheduleForCreatedLink(editor, JOHN_3_16, link, 0);
    // The other note cites the same verse on the same line.
    filePath = 'second.md';

    await vi.waitFor(() => expect(getCitation).toHaveBeenCalled());
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    expect(editor.getContent()).toBe(link);
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

  describe('while a lookup is pending', () => {
    let resolvers: (() => void)[];

    beforeEach(() => {
      resolvers = [];
      getCitation.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvers.push(() =>
              resolve({ success: true, source: 'online', text: QUOTE, citation: 'John 3:16' }),
            );
          }),
      );
    });

    test('quotes the same verse on the same line of two different notes', async () => {
      const link = convertBibleTextToMarkdownLink(JOHN_3_16, settings)!;
      const first = createFakeEditor(link);
      const second = createFakeEditor(link);
      const paths = new Map([
        [first, 'first.md'],
        [second, 'second.md'],
      ]);
      const inserter = new AutoBibleQuoteInserter(
        () => settings,
        provider,
        t,
        (editor) => paths.get(editor as typeof first) ?? null,
      );

      inserter.scheduleForCreatedLink(first, JOHN_3_16, link, 0);
      inserter.scheduleForCreatedLink(second, JOHN_3_16, link, 0);

      expect(getCitation).toHaveBeenCalledTimes(2);
      resolvers.forEach((resolve) => resolve());

      const quoted = `${link.trim()}\n> ${QUOTE}\n`;
      await vi.waitFor(() => {
        expect(first.getContent()).toBe(quoted);
        expect(second.getContent()).toBe(quoted);
      });
    });

    test('writes nothing once automatic insertion is turned off', async () => {
      const link = convertBibleTextToMarkdownLink(JOHN_3_16, settings)!;
      const editor = createFakeEditor(link);
      const pending = createInserter().insertNow(editor, JOHN_3_16, {
        line: 0,
        linkUrl: 'jwlibrary:///finder?bible=43003016&wtlocale=E',
      });

      settings.bibleQuote.autoInsertOnLinkCreation = false;
      resolvers.forEach((resolve) => resolve());

      expect((await pending).inserted).toBe(false);
      expect(editor.getContent()).toBe(link);
    });

    test('writes nothing once the plugin is unloaded', async () => {
      const link = convertBibleTextToMarkdownLink(JOHN_3_16, settings)!;
      const editor = createFakeEditor(link);
      const inserter = createInserter();
      const pending = inserter.insertNow(editor, JOHN_3_16, {
        line: 0,
        linkUrl: 'jwlibrary:///finder?bible=43003016&wtlocale=E',
      });

      inserter.dispose();
      resolvers.forEach((resolve) => resolve());

      expect((await pending).inserted).toBe(false);
      expect(editor.getContent()).toBe(link);
      expect(Notice).not.toHaveBeenCalled();
    });
  });

  test('quotes each link of a list written one per line', async () => {
    const romans: BibleReference = { book: 45, chapter: 5, verseRanges: [{ start: 12, end: 12 }] };
    const john = convertBibleTextToMarkdownLink(JOHN_3_16, settings)!.trim();
    const rom = convertBibleTextToMarkdownLink(romans, settings)!.trim();
    const editor = createFakeEditor(`${john}\n${rom}`, { line: 1, ch: rom.length });
    const inserter = createInserter();

    // Both links are created before the first text arrives; quoting John
    // pushes Romans down.
    inserter.scheduleForCreatedLink(editor, JOHN_3_16, john, 0);
    inserter.scheduleForCreatedLink(editor, romans, rom, 1);

    await vi.waitFor(() =>
      expect(editor.getContent()).toBe(`${john}\n> ${QUOTE}\n\n${rom}\n> ${QUOTE}\n`),
    );
  });

  test('quotes a link in an editor that is not matched to a note any more', async () => {
    const link = convertBibleTextToMarkdownLink(JOHN_3_16, settings)!;
    const editor = createFakeEditor(link);
    let filePath: string | null = 'board.canvas';
    const inserter = new AutoBibleQuoteInserter(
      () => settings,
      provider,
      t,
      () => filePath,
    );

    inserter.scheduleForCreatedLink(editor, JOHN_3_16, link, 0);
    // Like a Canvas card once another card is focused.
    filePath = null;

    await vi.waitFor(() => expect(editor.getContent()).toBe(`${link.trim()}\n> ${QUOTE}\n`));
  });
});
