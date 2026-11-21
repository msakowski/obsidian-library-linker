import type { Editor, EditorPosition } from 'obsidian';

interface EditorChange {
  from: EditorPosition;
  to: EditorPosition;
  text: string;
}

/** Maps an offset through one edit, like CodeMirror's `ChangeDesc.mapPos`. */
export type FakeMapPosition = (position: number, assoc: -1 | 1) => number;

export interface FakeEditor extends Editor {
  /** Current document content, joined with newlines. */
  getContent(): string;
  /** Called once per applied change, the way CodeMirror reports edits. */
  onChange(listener: (mapPosition: FakeMapPosition) => void): void;
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
  // Start of the selection; equal to the cursor when nothing is selected.
  let currentAnchor = { ...cursor };

  const toOffset = (position: EditorPosition): number => {
    const line = Math.min(position.line, lines.length - 1);
    const before = lines.slice(0, line).reduce((sum, text) => sum + text.length + 1, 0);
    return before + Math.min(position.ch, lines[line].length);
  };

  const fromOffset = (offset: number): EditorPosition => {
    let remaining = Math.max(0, offset);
    for (let line = 0; line < lines.length; line++) {
      if (remaining <= lines[line].length) return { line, ch: remaining };
      remaining -= lines[line].length + 1;
    }
    const last = lines.length - 1;
    return { line: last, ch: lines[last].length };
  };

  const listeners: ((mapPosition: FakeMapPosition) => void)[] = [];

  const editor = {
    posToOffset: toOffset,
    offsetToPos: fromOffset,
    getRange: (from: EditorPosition, to: EditorPosition) =>
      lines.join('\n').slice(toOffset(from), toOffset(to)),
    onChange: (listener: (mapPosition: FakeMapPosition) => void) => {
      listeners.push(listener);
    },
    getLine: (line: number) => lines[line] ?? '',
    lastLine: () => lines.length - 1,
    getCursor: (side?: 'from' | 'to' | 'head' | 'anchor') =>
      side === 'anchor' ? { ...currentAnchor } : { ...currentCursor },
    setCursor: (position: EditorPosition) => {
      currentCursor = { ...position };
      currentAnchor = { ...position };
    },
    setSelection: (anchor: EditorPosition, head: EditorPosition = anchor) => {
      currentAnchor = { ...anchor };
      currentCursor = { ...head };
    },
    transaction: ({ changes }: { changes?: EditorChange[] }) => {
      if (!changes?.length) return;

      let document = lines.join('\n');

      // Apply back to front so earlier offsets stay valid.
      const ordered = [...changes].sort((a, b) => toOffset(b.from) - toOffset(a.from));

      for (const change of ordered) {
        const from = toOffset(change.from);
        const to = toOffset(change.to);
        document = document.slice(0, from) + change.text + document.slice(to);

        // Later changes come first, so offsets before them are still valid.
        const delta = change.text.length - (to - from);
        const mapPosition: FakeMapPosition = (position, assoc) => {
          if (position < from || (position === from && assoc < 0 && from === to)) return position;
          if (position > to || (position === to && from !== to)) return position + delta;
          // Inside the replaced text, or at an insertion point with assoc 1.
          return assoc < 0 && from !== to ? from : from + change.text.length;
        };
        listeners.forEach((listener) => listener(mapPosition));
      }

      lines = document.split('\n');
    },
    getContent: () => lines.join('\n'),
  };

  return editor as unknown as FakeEditor;
}
