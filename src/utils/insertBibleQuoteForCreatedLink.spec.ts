import { insertBibleQuoteForCreatedLink } from '@/utils/insertBibleQuotes';
import { convertBibleTextToMarkdownLink } from '@/utils/convertBibleTextToMarkdownLink';
import { MAX_VERSES_IN_CHAPTER } from '@/utils/splitBibleReferenceForCitation';
import type { BibleCitationProvider, BibleReference, LinkReplacerSettings } from '@/types';
import { BIBLE_QUOTE_TEMPLATES } from '@/types';
import { createSettings } from '../__tests__/__helpers__/createSettings';
import { createFakeEditor } from '../__tests__/__helpers__/createFakeEditor';
import { initializeTestBibleBooks } from '../__tests__/__helpers__/initializeBibleBooksForTests';
import { beforeAll, beforeEach, describe, expect, test, vi, type Mock } from 'vitest';

const JOHN_3_16: BibleReference = { book: 43, chapter: 3, verseRanges: [{ start: 16, end: 16 }] };
const JOHN_3_16_URL = 'jwlibrary:///finder?bible=43003016&wtlocale=E';
const QUOTE = 'For God loved the world so much.';

let settings: LinkReplacerSettings;
let provider: BibleCitationProvider;
let getCitation: Mock;

beforeAll(() => {
  initializeTestBibleBooks();
});

beforeEach(() => {
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

/** The link the suggester would have written for the given reference. */
function createdLink(reference: BibleReference): string {
  return convertBibleTextToMarkdownLink(reference, settings)!;
}

describe('insertBibleQuoteForCreatedLink', () => {
  test('replaces the line when the created link stands alone on it', async () => {
    const link = createdLink(JOHN_3_16);
    const editor = createFakeEditor(link, { line: 0, ch: link.length });

    const result = await insertBibleQuoteForCreatedLink(editor, JOHN_3_16, settings, provider, {
      line: 0,
      linkUrl: JOHN_3_16_URL,
    });

    expect(result).toEqual({
      inserted: true,
      alreadyExists: false,
      fetchFailed: false,
      anchorLost: false,
    });
    expect(editor.getContent()).toBe(`${link.trim()}\n> ${QUOTE}\n`);
  });

  test('appends the quote below the line when the link sits inside a sentence', async () => {
    const link = createdLink(JOHN_3_16);
    const line = `As we read in ${link}the good news is preached.`;
    const editor = createFakeEditor(line, { line: 0, ch: 5 });

    const result = await insertBibleQuoteForCreatedLink(editor, JOHN_3_16, settings, provider, {
      line: 0,
      linkUrl: JOHN_3_16_URL,
    });

    expect(result.inserted).toBe(true);
    expect(editor.getContent()).toBe(`${line}\n\n${link.trim()}\n> ${QUOTE}`);
  });

  test('writes nothing when the link left its line, even if the verse is cited elsewhere', async () => {
    const link = createdLink(JOHN_3_16);
    // The created link on line 2 was undone; line 0 is an earlier mention.
    const content = `${link}\n\nthe link was undone`;
    const editor = createFakeEditor(content, { line: 2, ch: 0 });

    const result = await insertBibleQuoteForCreatedLink(editor, JOHN_3_16, settings, provider, {
      line: 2,
      linkUrl: JOHN_3_16_URL,
    });

    expect(result.anchorLost).toBe(true);
    expect(editor.getContent()).toBe(content);
  });

  test('writes nothing when the editor now shows another note', async () => {
    const link = createdLink(JOHN_3_16);
    const editor = createFakeEditor(link);

    const result = await insertBibleQuoteForCreatedLink(
      editor,
      JOHN_3_16,
      settings,
      provider,
      { line: 0, linkUrl: JOHN_3_16_URL },
      () => false,
    );

    expect(result).toEqual({
      inserted: false,
      alreadyExists: false,
      fetchFailed: false,
      anchorLost: true,
    });
    expect(editor.getContent()).toBe(link);
  });

  test('writes nothing when the created link is gone', async () => {
    const editor = createFakeEditor('the user deleted the link again');

    const result = await insertBibleQuoteForCreatedLink(editor, JOHN_3_16, settings, provider, {
      line: 0,
      linkUrl: JOHN_3_16_URL,
    });

    expect(result).toEqual({
      inserted: false,
      alreadyExists: false,
      fetchFailed: false,
      anchorLost: true,
    });
    expect(editor.getContent()).toBe('the user deleted the link again');
  });

  test('writes nothing when the quote of this link is already below it', async () => {
    const link = createdLink(JOHN_3_16);
    const content = `As we read in ${link}\n> [!quote]+ ${link.trim()}\n> ${QUOTE}`;
    const editor = createFakeEditor(content);

    const result = await insertBibleQuoteForCreatedLink(editor, JOHN_3_16, settings, provider, {
      line: 0,
      linkUrl: JOHN_3_16_URL,
    });

    expect(result.alreadyExists).toBe(true);
    expect(editor.getContent()).toBe(content);
  });

  test('quotes a link that sits right above an unrelated blockquote', async () => {
    const link = createdLink(JOHN_3_16);
    const editor = createFakeEditor(`${link}\n> Something else entirely`, {
      line: 0,
      ch: link.length,
    });

    const result = await insertBibleQuoteForCreatedLink(editor, JOHN_3_16, settings, provider, {
      line: 0,
      linkUrl: JOHN_3_16_URL,
    });

    expect(result.inserted).toBe(true);
    // A blank line keeps the two blockquotes apart.
    expect(editor.getContent()).toBe(`${link.trim()}\n> ${QUOTE}\n\n> Something else entirely`);
  });

  test('puts the quote after a callout that contains the link, not inside it', async () => {
    const link = createdLink(JOHN_3_16);
    const callout = `> [!note]\n> As ${link}says\n> the good news is preached.`;
    const editor = createFakeEditor(callout, { line: 1, ch: 3 });

    const result = await insertBibleQuoteForCreatedLink(editor, JOHN_3_16, settings, provider, {
      line: 1,
      linkUrl: JOHN_3_16_URL,
    });

    expect(result.inserted).toBe(true);
    expect(editor.getContent()).toBe(`${callout}\n\n${link.trim()}\n> ${QUOTE}`);
    expect(editor.getCursor()).toEqual({ line: 1, ch: 3 });
  });

  test('writes nothing when the citation cannot be fetched', async () => {
    getCitation.mockResolvedValue({
      success: false,
      source: 'online',
      text: '',
      citation: '',
      error: 'offline',
    });

    const link = createdLink(JOHN_3_16);
    const editor = createFakeEditor(link);

    const result = await insertBibleQuoteForCreatedLink(editor, JOHN_3_16, settings, provider, {
      line: 0,
      linkUrl: JOHN_3_16_URL,
    });

    expect(result.fetchFailed).toBe(true);
    expect(editor.getContent()).toBe(link);
  });

  test('leaves the cursor where the user left it when they are mid-sentence', async () => {
    const link = createdLink(JOHN_3_16);
    const line = `As we read in ${link}the good news is preached.`;
    const editor = createFakeEditor(line, { line: 0, ch: 5 });

    await insertBibleQuoteForCreatedLink(editor, JOHN_3_16, settings, provider, {
      line: 0,
      linkUrl: JOHN_3_16_URL,
    });

    expect(editor.getCursor()).toEqual({ line: 0, ch: 5 });
  });

  test('puts the cursor on a fresh line after a quote that replaced the reference', async () => {
    const link = createdLink(JOHN_3_16);
    const editor = createFakeEditor(`intro\n${link}`, { line: 1, ch: link.length });

    await insertBibleQuoteForCreatedLink(editor, JOHN_3_16, settings, provider, {
      line: 1,
      linkUrl: JOHN_3_16_URL,
    });

    // intro / link / > quote / <empty, cursor here>
    expect(editor.getContent()).toBe(`intro\n${link.trim()}\n> ${QUOTE}\n`);
    expect(editor.getCursor()).toEqual({ line: 3, ch: 0 });
  });

  test('puts the cursor on a blank line between the quote and the text below', async () => {
    const link = createdLink(JOHN_3_16);
    const editor = createFakeEditor(`${link}\nAn existing paragraph.`, {
      line: 0,
      ch: link.length,
    });

    await insertBibleQuoteForCreatedLink(editor, JOHN_3_16, settings, provider, {
      line: 0,
      linkUrl: JOHN_3_16_URL,
    });

    // link / > quote / <empty, cursor here> / paragraph
    expect(editor.getContent()).toBe(`${link.trim()}\n> ${QUOTE}\n\nAn existing paragraph.`);
    expect(editor.getCursor()).toEqual({ line: 2, ch: 0 });
  });

  test('keeps the cursor on the text it was on, wherever that text moved to', async () => {
    const link = createdLink(JOHN_3_16);
    const editor = createFakeEditor(`${link}\n\nsomewhere else`, { line: 2, ch: 4 });

    await insertBibleQuoteForCreatedLink(editor, JOHN_3_16, settings, provider, {
      line: 0,
      linkUrl: JOHN_3_16_URL,
    });

    // "somewhere else" was pushed one line down by the quote.
    expect(editor.getCursor()).toEqual({ line: 3, ch: 4 });
  });

  test('replaces the line when the reference is wrapped in the configured decorations', async () => {
    // The style the recording used: "(Matthew 24:14)" alone on its line.
    settings = createSettings({
      prefixOutsideLink: '(',
      suffixOutsideLink: ')',
      bibleQuote: {
        template: BIBLE_QUOTE_TEMPLATES.foldable,
        autoInsertOnLinkCreation: true,
      },
    });

    const link = createdLink(JOHN_3_16);

    const editor = createFakeEditor(link, { line: 0, ch: link.length });

    await insertBibleQuoteForCreatedLink(editor, JOHN_3_16, settings, provider, {
      line: 0,
      linkUrl: JOHN_3_16_URL,
    });

    // The reference is not repeated above the quote.
    expect(editor.getContent()).toBe(`> [!quote]+ ${link}\n> ${QUOTE}\n`);
  });

  test('opens a collapsed callout so the quote can be read straight away', async () => {
    settings.bibleQuote.template = BIBLE_QUOTE_TEMPLATES.foldable;

    const link = createdLink(JOHN_3_16);
    const editor = createFakeEditor(link);

    await insertBibleQuoteForCreatedLink(editor, JOHN_3_16, settings, provider, {
      line: 0,
      linkUrl: JOHN_3_16_URL,
    });

    expect(editor.getContent()).toBe(`> [!quote]+ ${link.trim()}\n> ${QUOTE}\n`);
  });

  test('fetches every range of a multi-range reference into one quote', async () => {
    const reference: BibleReference = {
      book: 43,
      chapter: 1,
      verseRanges: [
        { start: 1, end: 2 },
        { start: 4, end: 4 },
      ],
    };
    getCitation
      .mockResolvedValueOnce({ success: true, source: 'online', text: 'First part.', citation: '' })
      .mockResolvedValueOnce({
        success: true,
        source: 'online',
        text: 'Second part.',
        citation: '',
      });

    const link = createdLink(reference);
    const editor = createFakeEditor(link);

    const result = await insertBibleQuoteForCreatedLink(editor, reference, settings, provider, {
      line: 0,
      linkUrl: 'jwlibrary:///finder?bible=43001001-43001002&wtlocale=E',
      createdLink: link,
    });

    expect(result.inserted).toBe(true);
    expect(getCitation).toHaveBeenCalledTimes(2);
    expect(editor.getContent()).toBe(`${link.trim()}\n> First part. Second part.\n`);
  });

  test('fetches every chapter of a multi-chapter reference', async () => {
    const reference: BibleReference = {
      book: 40,
      chapter: 3,
      endChapter: 4,
      verseRanges: [{ start: 1, end: 11 }],
    };
    getCitation
      .mockResolvedValueOnce({
        success: true,
        source: 'online',
        text: 'Chapter three.',
        citation: '',
      })
      .mockResolvedValueOnce({
        success: true,
        source: 'online',
        text: 'Chapter four.',
        citation: '',
      });

    const link = createdLink(reference);
    const editor = createFakeEditor(link);

    const result = await insertBibleQuoteForCreatedLink(editor, reference, settings, provider, {
      line: 0,
      linkUrl: 'jwlibrary:///finder?bible=40003001-40004011&wtlocale=E',
    });

    expect(result.inserted).toBe(true);
    expect(getCitation).toHaveBeenNthCalledWith(
      1,
      { book: 40, chapter: 3, verseRanges: [{ start: 1, end: MAX_VERSES_IN_CHAPTER }] },
      'E',
    );
    expect(getCitation).toHaveBeenNthCalledWith(
      2,
      { book: 40, chapter: 4, verseRanges: [{ start: 1, end: 11 }] },
      'E',
    );
    expect(editor.getContent()).toBe(`${link.trim()}\n> Chapter three. Chapter four.\n`);
  });

  test('writes nothing when only part of a multi-chapter reference can be fetched', async () => {
    const reference: BibleReference = {
      book: 40,
      chapter: 3,
      endChapter: 4,
      verseRanges: [{ start: 1, end: 11 }],
    };
    getCitation
      .mockResolvedValueOnce({
        success: true,
        source: 'online',
        text: 'Chapter three.',
        citation: '',
      })
      .mockResolvedValueOnce({ success: false, source: 'online', text: '', citation: '' });

    const link = createdLink(reference);
    const editor = createFakeEditor(link);

    const result = await insertBibleQuoteForCreatedLink(editor, reference, settings, provider, {
      line: 0,
      linkUrl: 'jwlibrary:///finder?bible=40003001-40004011&wtlocale=E',
    });

    expect(result.fetchFailed).toBe(true);
    expect(editor.getContent()).toBe(link);
  });

  test('keeps every other reference that shares the line with the created link', async () => {
    const matthew: BibleReference = { book: 40, chapter: 5, verseRanges: [{ start: 3, end: 3 }] };
    const link = createdLink(JOHN_3_16).trim();
    const other = createdLink(matthew).trim();
    const line = `${link}, ${other}`;
    const editor = createFakeEditor(line);

    const result = await insertBibleQuoteForCreatedLink(editor, JOHN_3_16, settings, provider, {
      line: 0,
      linkUrl: JOHN_3_16_URL,
      createdLink: link,
    });

    expect(result.inserted).toBe(true);
    // Replacing the line would have removed the Matthew link.
    expect(editor.getContent()).toBe(`${line}\n\n${link}\n> ${QUOTE}`);
  });

  test('keeps a reference added to the line while the text was being fetched', async () => {
    const matthew: BibleReference = { book: 40, chapter: 5, verseRanges: [{ start: 3, end: 3 }] };
    const link = createdLink(JOHN_3_16).trim();
    const other = createdLink(matthew).trim();
    const editor = createFakeEditor(link);

    getCitation.mockImplementation(() => {
      // The user writes another reference next to the link during the lookup.
      editor.transaction({
        changes: [
          {
            from: { line: 0, ch: link.length },
            to: { line: 0, ch: link.length },
            text: ` ${other}`,
          },
        ],
      });
      return Promise.resolve({ success: true, source: 'online', text: QUOTE, citation: '' });
    });

    await insertBibleQuoteForCreatedLink(editor, JOHN_3_16, settings, provider, {
      line: 0,
      linkUrl: JOHN_3_16_URL,
      createdLink: link,
    });

    expect(editor.getContent()).toBe(`${link} ${other}\n\n${link}\n> ${QUOTE}`);
  });

  test('finds the link again when a quote above pushed it down during the lookup', async () => {
    const link = createdLink(JOHN_3_16).trim();
    // Written on line 1, then the quote of the reference above took two lines.
    const content = `> [!quote] Rom 5:12\n> Through one man sin entered.\n${link}`;
    const editor = createFakeEditor(content, { line: 2, ch: link.length });

    const result = await insertBibleQuoteForCreatedLink(editor, JOHN_3_16, settings, provider, {
      line: 1,
      linkUrl: JOHN_3_16_URL,
      createdLink: link,
      uniqueInNote: true,
    });

    expect(result.inserted).toBe(true);
    expect(editor.getContent()).toBe(
      `> [!quote] Rom 5:12\n> Through one man sin entered.\n${link}\n> ${QUOTE}\n`,
    );
  });

  test('keeps the created link when the template does not repeat it', async () => {
    settings.bibleQuote.template = '> {bibleRef}: {quote}';
    const link = createdLink(JOHN_3_16).trim();
    const editor = createFakeEditor(link);

    const result = await insertBibleQuoteForCreatedLink(editor, JOHN_3_16, settings, provider, {
      line: 0,
      linkUrl: JOHN_3_16_URL,
      createdLink: link,
    });

    expect(result.inserted).toBe(true);
    // Replacing the line would have deleted the link the user just created.
    expect(editor.getContent()).toBe(`${link}\n\n> Joh 3:16: ${QUOTE}`);
  });

  test('puts the quote right below a paragraph followed by an unrelated callout', async () => {
    const link = createdLink(JOHN_3_16).trim();
    const paragraph = `Read ${link} today`;
    const callout = '> [!note]\n> Unrelated.';
    const editor = createFakeEditor(`${paragraph}\n${callout}`);

    await insertBibleQuoteForCreatedLink(editor, JOHN_3_16, settings, provider, {
      line: 0,
      linkUrl: JOHN_3_16_URL,
      createdLink: link,
    });

    expect(editor.getContent()).toBe(`${paragraph}\n\n${link}\n> ${QUOTE}\n\n${callout}`);
  });

  test('keeps a selection the user made while the text was loading', async () => {
    const link = createdLink(JOHN_3_16).trim();
    const editor = createFakeEditor(`Some words to make bold\n${link} in a sentence`);
    editor.setSelection({ line: 0, ch: 5 }, { line: 0, ch: 10 });

    await insertBibleQuoteForCreatedLink(editor, JOHN_3_16, settings, provider, {
      line: 1,
      linkUrl: JOHN_3_16_URL,
      createdLink: link,
    });

    expect(editor.getCursor('anchor')).toEqual({ line: 0, ch: 5 });
    expect(editor.getCursor('head')).toEqual({ line: 0, ch: 10 });
  });

  test('does not take the quote of a longer range for the quote of this verse', async () => {
    settings.noLanguageParameter = true;
    const url = 'jwlibrary:///finder?bible=43003016';
    const link = convertBibleTextToMarkdownLink(JOHN_3_16, settings)!.trim();
    expect(link).toContain(`(${url})`);
    const editor = createFakeEditor(
      `${link} in a sentence\n> [Jn 3:16-18](jwlibrary:///finder?bible=43003016-43003018)\n> Text.`,
    );

    const result = await insertBibleQuoteForCreatedLink(editor, JOHN_3_16, settings, provider, {
      line: 0,
      linkUrl: url,
      createdLink: link,
    });

    expect(result.alreadyExists).toBe(false);
    expect(result.inserted).toBe(true);
  });
});
