import { beforeAll, describe, expect, test, vi } from 'vitest';
import type { Editor, EditorPosition, EditorTransaction } from 'obsidian';
import { insertAllBibleQuotes, insertBibleQuoteAtCursor } from '@/utils/insertBibleQuotes';
import type { BibleCitationProvider, LinkReplacerSettings } from '@/types';
import { BIBLE_QUOTE_TEMPLATES } from '@/types';
import { createSettings } from '../__tests__/__helpers__/createSettings';
import { initializeTestBibleBooks } from '../__tests__/__helpers__/initializeBibleBooksForTests';

const LINK = '[John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)';
const QUOTE = 'For God loved the world so much.';
// The quote repeats the link in the format of the settings
const QUOTED_LINK = LINK.replace('[John', '[Joh');

beforeAll(() => {
  initializeTestBibleBooks();
});

/** An editor over `content` that applies transactions the way Obsidian does. */
function createEditor(content: string, cursor: EditorPosition = { line: 0, ch: 0 }) {
  let lines = content.split('\n');
  const offset = ({ line, ch }: EditorPosition) =>
    lines.slice(0, line).reduce((sum, text) => sum + text.length + 1, 0) + ch;

  const editor = {
    getLine: (line: number) => lines[line] ?? '',
    lastLine: () => lines.length - 1,
    getCursor: () => cursor,
    transaction: ({ changes = [] }: EditorTransaction) => {
      let text = lines.join('\n');
      // Positions refer to the text before the transaction: apply from the end
      const sorted = [...changes].sort((a, b) => offset(b.from) - offset(a.from));
      for (const change of sorted) {
        const from = offset(change.from);
        const to = change.to ? offset(change.to) : from;
        text = text.slice(0, from) + change.text + text.slice(to);
      }
      lines = text.split('\n');
    },
  };

  return Object.assign(editor as unknown as Editor, { content: () => lines.join('\n') });
}

function createProvider(): BibleCitationProvider {
  return {
    getCitation: vi.fn().mockResolvedValue({
      success: true,
      source: 'online',
      text: QUOTE,
      citation: 'John 3:16',
    }),
    isLanguageAvailable: vi.fn().mockResolvedValue(true),
  };
}

function settingsWith(template: string): LinkReplacerSettings {
  const defaults = createSettings();
  return createSettings({ bibleQuote: { ...defaults.bibleQuote, template } });
}

describe('quotes keep the nesting of their link', () => {
  test('nest the quote inside a list item and keep the list tight', async () => {
    const editor = createEditor(`- See ${LINK}\n- Next item`);

    await insertAllBibleQuotes(editor, settingsWith(BIBLE_QUOTE_TEMPLATES.short), createProvider());

    expect(editor.content()).toBe(`- See ${LINK}\n  ${QUOTED_LINK}\n  > ${QUOTE}\n- Next item`);
  });

  test('nest the quote inside an indented list item', async () => {
    const editor = createEditor(`- Parent\n\t- See ${LINK}`);

    await insertAllBibleQuotes(editor, settingsWith(BIBLE_QUOTE_TEMPLATES.short), createProvider());

    expect(editor.content()).toBe(`- Parent\n\t- See ${LINK}\n\t  ${QUOTED_LINK}\n\t  > ${QUOTE}`);
  });

  test('indent to the text of a numbered item', async () => {
    const editor = createEditor(`10. See ${LINK}`, { line: 0, ch: 3 });

    await insertBibleQuoteAtCursor(
      editor,
      settingsWith(BIBLE_QUOTE_TEMPLATES.short),
      createProvider(),
    );

    expect(editor.content()).toBe(`10. See ${LINK}\n    ${QUOTED_LINK}\n    > ${QUOTE}`);
  });

  test('keep a blank line before a paragraph that follows a list item', async () => {
    const editor = createEditor(`- See ${LINK}\nParagraph`);

    await insertAllBibleQuotes(editor, settingsWith(BIBLE_QUOTE_TEMPLATES.short), createProvider());

    expect(editor.content()).toBe(`- See ${LINK}\n  ${QUOTED_LINK}\n  > ${QUOTE}\n\nParagraph`);
  });

  test('keep the indentation of a line holding only the link', async () => {
    const editor = createEditor(`- Parent\n\n  ${LINK}`);

    await insertAllBibleQuotes(editor, settingsWith(BIBLE_QUOTE_TEMPLATES.short), createProvider());

    expect(editor.content()).toBe(`- Parent\n\n  ${QUOTED_LINK}\n  > ${QUOTE}`);
  });

  test('leave a link outside any list as before', async () => {
    const editor = createEditor(`See ${LINK}\nNext`);

    await insertAllBibleQuotes(editor, settingsWith(BIBLE_QUOTE_TEMPLATES.short), createProvider());

    expect(editor.content()).toBe(`See ${LINK}\n\n${QUOTED_LINK}\n> ${QUOTE}\n\nNext`);
  });
});
