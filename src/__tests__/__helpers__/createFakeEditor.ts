import type { Editor, EditorPosition } from 'obsidian';

interface EditorChange {
  from: EditorPosition;
  to: EditorPosition;
  text: string;
}

export interface FakeEditor extends Editor {
  /** Current document content, joined with newlines. */
  getContent(): string;
}

/**
 * Minimal in-memory editor that actually applies transactions, so tests can
 * assert on the resulting document instead of on transaction arguments.
 */
export function createFakeEditor(
  content: string,
  cursor: EditorPosition = { line: 0, ch: 0 },
): FakeEditor {
  let lines = content.split('\n');
  let currentCursor = { ...cursor };

  const toOffset = (position: EditorPosition): number => {
    const line = Math.min(position.line, lines.length - 1);
    const before = lines.slice(0, line).reduce((sum, text) => sum + text.length + 1, 0);
    return before + Math.min(position.ch, lines[line].length);
  };

  const editor = {
    getLine: (line: number) => lines[line] ?? '',
    lastLine: () => lines.length - 1,
    getCursor: () => ({ ...currentCursor }),
    setCursor: (position: EditorPosition) => {
      currentCursor = { ...position };
    },
    transaction: ({ changes }: { changes?: EditorChange[] }) => {
      if (!changes?.length) return;

      let document = lines.join('\n');

      // Apply back to front so earlier offsets stay valid.
      const ordered = [...changes].sort((a, b) => toOffset(b.from) - toOffset(a.from));

      for (const change of ordered) {
        document =
          document.slice(0, toOffset(change.from)) +
          change.text +
          document.slice(toOffset(change.to));
      }

      lines = document.split('\n');
    },
    getContent: () => lines.join('\n'),
  };

  return editor as unknown as FakeEditor;
}
