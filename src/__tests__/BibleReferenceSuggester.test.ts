import type { Editor, EditorPosition } from 'obsidian';
import { BibleReferenceSuggester } from '@/BibleReferenceSuggester';
import type JWLibraryLinkerPlugin from '@/main';
import { createSettings } from './__helpers__/createSettings';
import { initializeTestBibleBooks } from './__helpers__/initializeBibleBooksForTests';

beforeAll(() => {
  initializeTestBibleBooks();
});

const LINK = '[John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)';

function createSuggester(): BibleReferenceSuggester {
  const plugin = {
    app: {},
    settings: createSettings(),
    getTranslationService: () => ({ t: (key: string) => key }),
  } as unknown as JWLibraryLinkerPlugin;
  return new BibleReferenceSuggester(plugin);
}

// Calls onTrigger with the cursor where `|` is, as Obsidian does after each edit.
function triggerOn(suggester: BibleReferenceSuggester, editor: Editor, lineWithCursor: string) {
  const ch = lineWithCursor.indexOf('|');
  const line = lineWithCursor.replace('|', '');
  (editor as unknown as { getLine: () => string }).getLine = () => line;
  const cursor: EditorPosition = { line: 0, ch };
  return suggester.onTrigger(cursor, editor);
}

function trigger(lineWithCursor: string) {
  return triggerOn(createSuggester(), {} as Editor, lineWithCursor);
}

// Shows the suggestion as Obsidian does once onTrigger returned it.
function show(suggester: BibleReferenceSuggester, editor: Editor, lineWithCursor: string) {
  const result = triggerOn(suggester, editor, lineWithCursor);
  if (result) suggester.getSuggestions({ ...result, editor, file: null } as never);
  return result;
}

describe('BibleReferenceSuggester.onTrigger', () => {
  it('suggests a reference typed at the cursor', () => {
    expect(trigger('John 3:16|')?.query).toBe('John 3:16');
  });

  it('suggests a reference typed after a link on the same line', () => {
    const result = trigger(`${LINK} and Matt. 5:3|`);
    expect(result?.query).toBe('Matt. 5:3');
    expect(result?.start.ch).toBe(`${LINK} and `.length);
  });

  it('suggests a reference typed after a link in an indented list item', () => {
    expect(trigger(`\t- ${LINK}, Matt. 5:3|`)?.query).toBe('Matt. 5:3');
  });

  it('suggests the reference at the cursor when the line has several', () => {
    expect(trigger('John 3:16 and Matt. 5:3|')?.query).toBe('Matt. 5:3');
    expect(trigger('John 3:1|6 and Matt. 5:3')?.query).toBe('John 3:16');
  });

  it('does not suggest a reference once typing has moved past it', () => {
    expect(trigger('John 3:16 is a |')).toBeNull();
    expect(trigger('\t- John 3:16 is a |')).toBeNull();
  });

  it('does not suggest a reference that is already linked', () => {
    expect(trigger(`${LINK}|`)).toBeNull();
    expect(trigger(`[**John 3:1|6**](jwlibrary:///finder?bible=43003016)`)).toBeNull();
  });

  it('still suggests single-chapter book references', () => {
    expect(trigger('Jude 3|')?.query).toBe('Jude 3');
  });

  it('keeps command mode for text after /b', () => {
    expect(trigger(`${LINK} /b Matt 5|`)?.query).toBe('Matt 5');
  });

  describe('after the user closes the suggestion', () => {
    it('keeps a /b command closed while typing goes on', () => {
      const suggester = createSuggester();
      const editor = {} as Editor;
      expect(show(suggester, editor, '\t- /b John 3:16|')?.query).toBe('John 3:16');

      suggester.close();

      expect(triggerOn(suggester, editor, '\t- /b John 3:16 ok|')).toBeNull();
    });

    it('keeps a reference closed while it is edited', () => {
      const suggester = createSuggester();
      const editor = {} as Editor;
      show(suggester, editor, '- John 3:1|');

      suggester.close();

      expect(triggerOn(suggester, editor, '- John 3:16|')).toBeNull();
    });

    it('suggests again a reference started elsewhere', () => {
      const suggester = createSuggester();
      const editor = {} as Editor;
      show(suggester, editor, '- John 3:16|');

      suggester.close();

      expect(triggerOn(suggester, editor, '- John 3:16 and Matt. 5:3|')?.query).toBe('Matt. 5:3');
    });

    it('suggests the reference again once the cursor left it and came back', () => {
      const suggester = createSuggester();
      const editor = {} as Editor;
      show(suggester, editor, '- John 3:16|');

      suggester.close();
      expect(triggerOn(suggester, editor, '- John 3:16 |')).toBeNull();

      expect(triggerOn(suggester, editor, '- John 3:16|')?.query).toBe('John 3:16');
    });

    it('does not count closing after onTrigger found nothing as a dismissal', () => {
      const suggester = createSuggester();
      const editor = {} as Editor;
      show(suggester, editor, '- John 3:16|');
      expect(triggerOn(suggester, editor, '- John 3:16 |')).toBeNull();

      suggester.close();

      expect(triggerOn(suggester, editor, '- John 3:16|')?.query).toBe('John 3:16');
    });
  });
});
