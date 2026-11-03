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
import { CreatedLinkTracker } from '@/utils/createdLinkTracker';
import { initializeTestBibleBooks } from '../__tests__/__helpers__/initializeBibleBooksForTests';
import { beforeAll, beforeEach, describe, expect, test, vi, type Mock } from 'vitest';

const JOHN_3_16: BibleReference = { book: 43, chapter: 3, verseRanges: [{ start: 16, end: 16 }] };
const QUOTE = 'For God loved the world so much.';

const t = (key: string) => key;

let settings: LinkReplacerSettings;
let provider: BibleCitationProvider;
let getCitation: Mock;
let tracker: CreatedLinkTracker;

beforeAll(() => {
  initializeTestBibleBooks();
});

beforeEach(() => {
  vi.clearAllMocks();
  tracker = new CreatedLinkTracker();

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

/** A fake editor whose edits are reported to the tracker, as CodeMirror does. */
function createEditor(...args: Parameters<typeof createFakeEditor>) {
  const editor = createFakeEditor(...args);
  editor.onChange((mapPosition) => tracker.mapChanges(editor, mapPosition));
  return editor;
}

function createInserter(withTracker = true): AutoBibleQuoteInserter {
  return new AutoBibleQuoteInserter(
    () => settings,
    provider,
    t,
    () => 'note.md',
    withTracker ? tracker : undefined,
  );
}

describe('AutoBibleQuoteInserter', () => {
  test('inserts the quote for a link the suggester just created', async () => {
    const link = convertBibleTextToMarkdownLink(JOHN_3_16, settings)!;
    const editor = createEditor(link);

    createInserter().scheduleForCreatedLink(editor, JOHN_3_16, link, { line: 0, ch: 0 });

    await vi.waitFor(() => expect(editor.getContent()).toBe(`${link.trim()}\n> ${QUOTE}\n`));
  });

  test('does nothing when the setting is off', async () => {
    settings.bibleQuote.autoInsertOnLinkCreation = false;

    const link = convertBibleTextToMarkdownLink(JOHN_3_16, settings)!;
    const editor = createEditor(link);

    createInserter().scheduleForCreatedLink(editor, JOHN_3_16, link, { line: 0, ch: 0 });

    await Promise.resolve();
    expect(getCitation).not.toHaveBeenCalled();
    expect(editor.getContent()).toBe(link);
  });

  test('returns before the citation is fetched, so typing is never blocked', () => {
    const link = convertBibleTextToMarkdownLink(JOHN_3_16, settings)!;
    const editor = createEditor(link);

    createInserter().scheduleForCreatedLink(editor, JOHN_3_16, link, { line: 0, ch: 0 });

    // The editor is only touched once the (async) citation has arrived.
    expect(editor.getContent()).toBe(link);
  });

  test('does not quote the same link twice while an insertion is in flight', async () => {
    const link = convertBibleTextToMarkdownLink(JOHN_3_16, settings)!;
    const editor = createEditor(link);
    const inserter = createInserter();

    inserter.scheduleForCreatedLink(editor, JOHN_3_16, link, { line: 0, ch: 0 });
    inserter.scheduleForCreatedLink(editor, JOHN_3_16, link, { line: 0, ch: 0 });

    await vi.waitFor(() => expect(editor.getContent()).toBe(`${link.trim()}\n> ${QUOTE}\n`));
    expect(getCitation).toHaveBeenCalledTimes(1);
  });

  test('writes nothing when another note is opened in the editor during the fetch', async () => {
    const link = convertBibleTextToMarkdownLink(JOHN_3_16, settings)!;
    const editor = createEditor(link);
    let filePath = 'first.md';
    const inserter = new AutoBibleQuoteInserter(
      () => settings,
      provider,
      t,
      () => filePath,
    );

    inserter.scheduleForCreatedLink(editor, JOHN_3_16, link, { line: 0, ch: 0 });
    // The other note cites the same verse on the same line.
    filePath = 'second.md';

    await vi.waitFor(() => expect(getCitation).toHaveBeenCalled());
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    expect(editor.getContent()).toBe(link);
  });

  test('ignores text without a JW Library link', () => {
    const editor = createEditor('John 3:16');

    createInserter().scheduleForCreatedLink(editor, JOHN_3_16, 'John 3:16', { line: 0, ch: 0 });

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
    const editor = createEditor(link);

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
    const editor = createEditor(link);

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
      const first = createEditor(link);
      const second = createEditor(link);
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

      inserter.scheduleForCreatedLink(first, JOHN_3_16, link, { line: 0, ch: 0 });
      inserter.scheduleForCreatedLink(second, JOHN_3_16, link, { line: 0, ch: 0 });

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
      const editor = createEditor(link);
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
      const editor = createEditor(link);
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
    const editor = createEditor(`${john}\n${rom}`, { line: 1, ch: rom.length });
    const inserter = createInserter();

    // Both links are created before the first text arrives; quoting John
    // pushes Romans down.
    inserter.scheduleForCreatedLink(editor, JOHN_3_16, john, { line: 0, ch: 0 });
    inserter.scheduleForCreatedLink(editor, romans, rom, { line: 1, ch: 0 });

    await vi.waitFor(() =>
      expect(editor.getContent()).toBe(`${john}\n> ${QUOTE}\n\n${rom}\n> ${QUOTE}\n`),
    );
  });

  test('writes nothing when the editor is no longer matched to its note', async () => {
    const link = convertBibleTextToMarkdownLink(JOHN_3_16, settings)!;
    const editor = createEditor(link);
    let filePath: string | null = 'board.canvas';
    const inserter = new AutoBibleQuoteInserter(
      () => settings,
      provider,
      t,
      () => filePath,
      tracker,
    );

    inserter.scheduleForCreatedLink(editor, JOHN_3_16, link, { line: 0, ch: 0 });
    // The note can no longer be told: it may be another one now.
    filePath = null;

    await vi.waitFor(() => expect(getCitation).toHaveBeenCalled());
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    expect(editor.getContent()).toBe(link);
  });

  test('does not quote at all when the note of the editor is unknown', async () => {
    const link = convertBibleTextToMarkdownLink(JOHN_3_16, settings)!;
    const editor = createEditor(link);
    let filePath: string | null = null;
    const inserter = new AutoBibleQuoteInserter(
      () => settings,
      provider,
      t,
      () => filePath,
      tracker,
    );

    inserter.scheduleForCreatedLink(editor, JOHN_3_16, link, { line: 0, ch: 0 });
    // Even a note known later is not proof it is the one the link went into.
    filePath = 'other.md';

    await new Promise((resolve) => window.setTimeout(resolve, 0));
    expect(getCitation).not.toHaveBeenCalled();
    expect(editor.getContent()).toBe(link);
  });

  describe('with a delayed response and edits during the lookup', () => {
    let release: () => void;

    beforeEach(() => {
      // Every lookup, including the later parts of a split reference, waits
      // until the test releases the responses.
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      getCitation.mockImplementation(async () => {
        await gate;
        return { success: true, source: 'online', text: QUOTE, citation: 'John 3:16' };
      });
    });

    const insertLineAbove = (editor: ReturnType<typeof createEditor>) =>
      editor.transaction({
        changes: [{ from: { line: 0, ch: 0 }, to: { line: 0, ch: 0 }, text: 'New first line\n' }],
      });

    test('quotes the created occurrence when an older one moves onto its line', async () => {
      const link = convertBibleTextToMarkdownLink(JOHN_3_16, settings)!.trim();
      const older = `Earlier: ${link} was read.`;
      const created = `Today ${link} again`;
      const editor = createEditor(`${older}\n${created}`);
      const inserter = createInserter();

      inserter.scheduleForCreatedLink(editor, JOHN_3_16, link, { line: 1, ch: 'Today '.length });
      // The older mention now sits on the line the created link was written to.
      insertLineAbove(editor);
      release();

      await vi.waitFor(() =>
        expect(editor.getContent()).toBe(
          `New first line\n${older}\n${created}\n\n${link}\n> ${QUOTE}`,
        ),
      );
    });

    test('quotes nothing without tracking when the verse is cited twice', async () => {
      const link = convertBibleTextToMarkdownLink(JOHN_3_16, settings)!.trim();
      const content = `Earlier: ${link} was read.\nToday ${link} again`;
      const editor = createEditor(content);
      const pending = createInserter(false).insertNow(editor, JOHN_3_16, {
        line: 1,
        linkUrl: 'jwlibrary:///finder?bible=43003016&wtlocale=E',
        createdLink: link,
        uniqueInNote: false,
      });

      insertLineAbove(editor);
      release();

      expect((await pending).anchorLost).toBe(true);
      expect(editor.getContent()).toBe(`New first line\n${content}`);
    });

    test('quotes the created occurrence when a quote above pushes it down', async () => {
      const link = convertBibleTextToMarkdownLink(JOHN_3_16, settings)!.trim();
      const created = `Today ${link} again`;
      const editor = createEditor(`${link}\n${created}`);
      const inserter = createInserter();

      inserter.scheduleForCreatedLink(editor, JOHN_3_16, link, { line: 1, ch: 'Today '.length });
      // The older mention is quoted by hand meanwhile: two lines appear above.
      editor.transaction({
        changes: [
          {
            from: { line: 0, ch: link.length },
            to: { line: 0, ch: link.length },
            text: '\n> Old quote.',
          },
        ],
      });
      release();

      await vi.waitFor(() =>
        expect(editor.getContent()).toBe(
          `${link}\n> Old quote.\n${created}\n\n${link}\n> ${QUOTE}`,
        ),
      );
    });

    test('keeps following the link while the user types around it', async () => {
      const link = convertBibleTextToMarkdownLink(JOHN_3_16, settings)!.trim();
      const editor = createEditor(link, { line: 0, ch: link.length });

      createInserter().scheduleForCreatedLink(editor, JOHN_3_16, link, { line: 0, ch: 0 });
      editor.transaction({
        changes: [
          { from: { line: 0, ch: link.length }, to: { line: 0, ch: link.length }, text: ' says' },
          { from: { line: 0, ch: 0 }, to: { line: 0, ch: 0 }, text: 'Read ' },
        ],
      });
      release();

      await vi.waitFor(() =>
        expect(editor.getContent()).toBe(`Read ${link} says\n\n${link}\n> ${QUOTE}`),
      );
    });

    describe.each([
      ['with tracking', true],
      ['without tracking', false],
    ])('a multi-range reference %s', (_label, withTracker) => {
      const reference: BibleReference = {
        book: 43,
        chapter: 3,
        verseRanges: [
          { start: 16, end: 16 },
          { start: 18, end: 18 },
        ],
      };

      test('is not quoted once one of its ranges was removed', async () => {
        const link = convertBibleTextToMarkdownLink(reference, settings)!.trim();
        const first = link.slice(0, link.indexOf('),') + 1);
        expect(link).toContain('43003018');
        const editor = createEditor(link);

        createInserter(withTracker).scheduleForCreatedLink(editor, reference, link, {
          line: 0,
          ch: 0,
        });
        // The user removes the verse 18 link while the text is loading.
        editor.transaction({
          changes: [
            { from: { line: 0, ch: first.length }, to: { line: 0, ch: link.length }, text: '' },
          ],
        });
        release();

        await vi.waitFor(() => expect(getCitation).toHaveBeenCalledTimes(2));
        await new Promise((resolve) => window.setTimeout(resolve, 0));
        expect(editor.getContent()).toBe(first);
        expect(editor.getContent()).not.toContain('43003018');
      });
    });
  });
});
