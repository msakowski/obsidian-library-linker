import type { Editor } from 'obsidian';

/**
 * Maps a document offset through an edit. `assoc` tells on which side of an
 * insertion made exactly at that offset the position ends up: `-1` before it,
 * `1` after it. Same contract as CodeMirror's `ChangeDesc.mapPos`.
 */
export type MapPosition = (position: number, assoc: -1 | 1) => number;

/** Where a created link currently sits in its note, as document offsets. */
export interface TrackedRange {
  readonly from: number;
  readonly to: number;
}

interface MutableTrackedRange {
  from: number;
  to: number;
}

/**
 * Follows the text of freshly created links through the edits made while
 * their quote is being fetched.
 *
 * A line number cannot tell two mentions of the same verse apart once lines
 * move; offsets mapped through every edit can. Text typed right before or
 * right after the link stays outside the tracked range, so the range keeps
 * covering exactly the created link — or, if part of it was edited or
 * deleted, a text that no longer matches it.
 */
export class CreatedLinkTracker {
  private readonly ranges = new WeakMap<Editor, Set<MutableTrackedRange>>();

  /** Starts following `from`–`to` in `editor`. Call {@link release} when done. */
  track(editor: Editor, from: number, to: number): TrackedRange {
    const range: MutableTrackedRange = { from, to };
    const editorRanges = this.ranges.get(editor) ?? new Set<MutableTrackedRange>();
    editorRanges.add(range);
    this.ranges.set(editor, editorRanges);
    return range;
  }

  release(editor: Editor, range: TrackedRange): void {
    this.ranges.get(editor)?.delete(range);
  }

  /** Moves every range tracked in `editor` through an edit of its document. */
  mapChanges(editor: Editor, mapPosition: MapPosition): void {
    const editorRanges = this.ranges.get(editor);
    if (!editorRanges) return;

    for (const range of editorRanges) {
      range.from = mapPosition(range.from, 1);
      range.to = Math.max(range.from, mapPosition(range.to, -1));
    }
  }

  /** Whether any range is tracked in `editor`, so edits there need mapping. */
  isTracking(editor: Editor): boolean {
    return (this.ranges.get(editor)?.size ?? 0) > 0;
  }
}
