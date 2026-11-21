import { Prec, type ChangeSpec, type EditorState, type TransactionSpec } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { getQuoteNesting } from '@/utils/insertBibleQuotes';

const LIST_ITEM = /^(\s*)([-*+]|\d+[.)])(\s+)(\[.\]\s+)?/;
const JW_LIBRARY_LINK = 'jwlibrary:///';

/**
 * The edit Enter makes at the end of a list item followed by its quote: a new
 * item after the quote, instead of one between the item and its quote, which
 * would hand the quote over to the new item.
 *
 * Returns null when Enter should keep its usual behaviour: a selection, the
 * cursor before the end of the line, a line that is not a list item, or no
 * quote with a JW Library link nested right below it.
 */
export function continueListAfterQuote(state: EditorState): TransactionSpec | null {
  const { ranges, main } = state.selection;
  if (ranges.length > 1 || !main.empty) return null;

  const line = state.doc.lineAt(main.head);
  if (main.head !== line.to) return null;

  const item = LIST_ITEM.exec(line.text);
  if (!item) return null;

  const [, leading, marker, spacing, task] = item;
  // The indentation the quote inserter gives a quote nested in this item
  const nestedIndent = getQuoteNesting(line.text).indent;
  const isNested = (number: number) => {
    const text = state.doc.line(number).text;
    return text.startsWith(nestedIndent) && text.trim().length > 0;
  };

  if (line.number >= state.doc.lines || !isNested(line.number + 1)) return null;

  // The quote and anything else nested in the item, quotes separated by a blank line included
  let last = line.number;
  let hasLink = false;
  let hasBlockquote = false;
  for (let number = line.number + 1; number <= state.doc.lines; number++) {
    if (isNested(number)) {
      const text = state.doc.line(number).text.trim();
      hasLink ||= text.includes(JW_LIBRARY_LINK);
      hasBlockquote ||= text.startsWith('>');
      last = number;
    } else if (
      state.doc.line(number).text.trim() === '' &&
      number < state.doc.lines &&
      isNested(number + 1)
    ) {
      continue;
    } else {
      break;
    }
  }

  // Only a quote right below the item, such as one this plugin inserted
  const firstNested = state.doc.line(line.number + 1).text.trim();
  if (
    !hasLink ||
    !hasBlockquote ||
    !(firstNested.startsWith('>') || firstNested.includes(JW_LIBRARY_LINK))
  ) {
    return null;
  }

  const ordered = /^(\d+)([.)])$/.exec(marker);
  const nextMarker = ordered ? `${Number(ordered[1]) + 1}${ordered[2]}` : marker;
  const insert = `\n${leading}${nextMarker}${spacing}${task ? '[ ] ' : ''}`;
  const position = state.doc.line(last).to;
  const changes: ChangeSpec[] = [{ from: position, insert }];

  // Like Obsidian's own Enter, renumber the items that follow
  if (ordered) {
    let expected = Number(ordered[1]) + 2;
    for (let number = last + 1; number <= state.doc.lines; number++) {
      const next = state.doc.line(number);
      if (
        next.text.trim() === '' ||
        (next.text.startsWith(leading) && /^\s/.test(next.text.slice(leading.length)))
      ) {
        continue; // a blank line or content nested in an item
      }

      const sibling = /^(\s*)(\d+)([.)])\s/.exec(next.text);
      if (!sibling || sibling[1] !== leading || sibling[3] !== ordered[2]) break;

      const from = next.from + leading.length;
      changes.push({ from, to: from + sibling[2].length, insert: String(expected) });
      expected++;
    }
  }

  return {
    changes,
    selection: { anchor: position + insert.length },
    scrollIntoView: true,
    userEvent: 'input',
  };
}

/** Keymap that runs {@link continueListAfterQuote} before Obsidian's own Enter. */
export const listQuoteEnterExtension = Prec.high(
  keymap.of([
    {
      key: 'Enter',
      run: (view) => {
        const spec = continueListAfterQuote(view.state);
        if (!spec) return false;
        view.dispatch(spec);
        return true;
      },
    },
  ]),
);
