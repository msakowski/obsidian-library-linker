import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { Editor, EditorPosition } from 'obsidian';
import { BibleReferenceSuggester } from '@/BibleReferenceSuggester';
import type JWLibraryLinkerPlugin from '@/main';
import { createSettings } from './__tests__/__helpers__/createSettings';
import { initializeTestBibleBooks } from './__tests__/__helpers__/initializeBibleBooksForTests';

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

  describe('/b command', () => {
    it('is only a command at the start of the line or after a space', () => {
      const result = trigger('km/b John 3:16|');

      // A command would replace "/b John 3:16"; the reference keeps "km/b "
      expect(result?.query).toBe('John 3:16');
      expect(result?.start.ch).toBe('km/b '.length);
    });

    it.each(['(', '[', '*', '**', '_', '> ', '"', '“', '«'])(
      'is a command right after %s',
      (before) => {
        const result = trigger(`${before}/b John 3:16|`);

        expect(result?.query).toBe('John 3:16');
        expect(result?.start.ch).toBe(before.length);
      },
    );

    it.each([
      ['(/b John 3:16|)', ')'],
      ['**/b John 3:16|**', '**'],
      ['[/b John 3:16|]', ']'],
    ])('leaves the closing markup of %s in the note', (line, closing) => {
      const result = trigger(line);
      const text = line.replace('|', '');

      expect(result?.query).toBe('John 3:16');
      expect(text.slice(result!.end.ch)).toBe(closing);
    });

    it('covers the rest of a reference edited in the middle', () => {
      const result = trigger('/b John 3:1|6 and more');

      expect(result?.query).toBe('John 3:16');
      expect(result?.end.ch).toBe('/b John 3:16'.length);
    });

    it('does not stop detecting references typed before it', () => {
      expect(trigger('John 3:16| /b Matt 5')?.query).toBe('John 3:16');
    });

    it('offers to keep typing when the text is not a reference yet', () => {
      const suggester = createSuggester();
      const editor = {} as Editor;
      const result = show(suggester, editor, '- /b Jo|');
      const suggestions = suggester.getSuggestions({ ...result!, editor, file: null } as never);

      expect(suggestions.map((s) => s.command)).toEqual(['typing']);
    });

    it('does not log an error for each keystroke of a partial reference', () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      const suggester = createSuggester();
      const editor = {} as Editor;

      for (const line of ['/b J|', '/b Jo|', '/b Joh|', '/b John 3:|']) {
        const result = show(suggester, editor, line);
        suggester.getSuggestions({ ...result!, editor, file: null } as never);
      }

      expect(error).not.toHaveBeenCalled();
      error.mockRestore();
    });
  });
});

describe('BibleReferenceSuggester.selectSuggestion', () => {
  // Chooses the link suggestion for the command in `line`, which ends at `endCh`
  function choose(line: string, endCh: number): string {
    const replaceRange = vi.fn();
    const editor = { getLine: () => line, replaceRange } as unknown as Editor;
    const suggester = createSuggester();
    // The default setting: a space after the link to keep typing
    suggester.plugin.settings.suffixOutsideLink = ' ';
    suggester.context = {
      editor,
      start: { line: 0, ch: line.indexOf('/b') },
      end: { line: 0, ch: endCh },
      query: 'John 3:16',
      file: null,
    } as never;

    suggester.selectSuggestion({ text: 'John 3:16', command: 'link', description: '' });
    return replaceRange.mock.calls[0][0] as string;
  }

  it('keeps the space after the link at the end of the line', () => {
    expect(choose('/b John 3:16', '/b John 3:16'.length)).toMatch(/\) $/);
  });

  it.each(['(/b John 3:16)', '**/b John 3:16**', '/b John 3:16 and more'])(
    'drops the space after the link before what follows in %s',
    (line) => {
      expect(choose(line, line.indexOf('16') + 2)).toMatch(/\)$/);
    },
  );
});
