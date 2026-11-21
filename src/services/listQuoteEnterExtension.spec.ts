import { EditorState } from '@codemirror/state';
import { describe, expect, test } from 'vitest';
import { continueListAfterQuote } from '@/services/listQuoteEnterExtension';

const LINK = '[John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)';

// Presses Enter with the cursor where `|` is and returns the note, cursor shown as `|`.
function enter(textWithCursor: string): string | null {
  const cursor = textWithCursor.indexOf('|');
  const state = EditorState.create({
    doc: textWithCursor.replace('|', ''),
    selection: { anchor: cursor },
  });
  const spec = continueListAfterQuote(state);
  if (!spec) return null;

  const next = state.update(spec).state;
  const head = next.selection.main.head;
  const doc = next.doc.toString();
  return doc.slice(0, head) + '|' + doc.slice(head);
}

describe('continueListAfterQuote', () => {
  test('adds the next item after the quote of the item', () => {
    expect(enter(`- ${LINK}|\n  > [!quote]+ ${LINK}\n  > For God loved the world.\n- Next`)).toBe(
      `- ${LINK}\n  > [!quote]+ ${LINK}\n  > For God loved the world.\n- |\n- Next`,
    );
  });

  test('keeps the indentation, the marker and the task box of the item', () => {
    expect(enter(`\t- [x] See ${LINK}|\n\t  > [!quote]+ ${LINK}\n\t  > Text.`)).toBe(
      `\t- [x] See ${LINK}\n\t  > [!quote]+ ${LINK}\n\t  > Text.\n\t- [ ] |`,
    );
  });

  test('numbers the next item of an ordered list', () => {
    expect(enter(`9) ${LINK}|\n   ${LINK}\n   > Text.`)).toBe(
      `9) ${LINK}\n   ${LINK}\n   > Text.\n10) |`,
    );
  });

  test('renumbers the items that follow, as Obsidian does', () => {
    expect(
      enter(
        `1. ${LINK}|\n   > ${LINK}\n   > Text.\n2. b\n   - nested\n3. c\n\nAfter\n1. other list`,
      ),
    ).toBe(
      `1. ${LINK}\n   > ${LINK}\n   > Text.\n2. |\n3. b\n   - nested\n4. c\n\nAfter\n1. other list`,
    );
  });

  test('goes past several quotes of the item', () => {
    expect(enter(`- ${LINK}|\n  > ${LINK}\n  > One.\n\n  > ${LINK}\n  > Two.\n\nAfter`)).toBe(
      `- ${LINK}\n  > ${LINK}\n  > One.\n\n  > ${LINK}\n  > Two.\n- |\n\nAfter`,
    );
  });

  test('leaves Enter alone without a quote below the item', () => {
    expect(enter(`- ${LINK}|\n- Next`)).toBeNull();
    expect(enter(`- Parent|\n  - Child`)).toBeNull();
    expect(enter(`- Parent|\n  > A quote without a link`)).toBeNull();
  });

  test('leaves Enter alone before the end of the line or outside a list', () => {
    expect(enter(`- ${LINK.slice(0, 5)}|${LINK.slice(5)}\n  > ${LINK}\n  > Text.`)).toBeNull();
    expect(enter(`${LINK}|\n> ${LINK}\n> Text.`)).toBeNull();
  });
});
