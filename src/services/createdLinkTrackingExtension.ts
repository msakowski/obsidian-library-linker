import { ViewPlugin, type EditorView, type ViewUpdate } from '@codemirror/view';
import { editorInfoField, type Editor, type MarkdownFileInfo } from 'obsidian';
import type { CreatedLinkTracker } from '@/utils/createdLinkTracker';

/**
 * Editor plumbing for automatic quotes, registered with
 * `registerEditorExtension()`.
 *
 * - Maps every edit of a note through the {@link CreatedLinkTracker}, so a
 *   created link is followed by position rather than by line number.
 * - Remembers which CodeMirror view backs each Obsidian `Editor`, so the note
 *   an editor shows can be read from the editor itself (`editorInfoField`),
 *   including a Canvas card that no longer has focus.
 */
export function createCreatedLinkTrackingExtension(tracker: CreatedLinkTracker) {
  const views = new WeakMap<Editor, EditorView>();

  const infoOf = (view: EditorView): MarkdownFileInfo | undefined =>
    view.state.field(editorInfoField, false);

  const extension = ViewPlugin.define((view) => {
    const editor = infoOf(view)?.editor;
    if (editor) views.set(editor, view);

    return {
      update(update: ViewUpdate) {
        const current = infoOf(update.view)?.editor;
        if (!current) return;

        views.set(current, update.view);
        if (update.docChanged && tracker.isTracking(current)) {
          tracker.mapChanges(current, (position, assoc) => update.changes.mapPos(position, assoc));
        }
      },
    };
  });

  /**
   * Path of the note `editor` shows, read from the editor's own state; null
   * when the editor was never seen or has no file.
   */
  const getFilePath = (editor: Editor): string | null => {
    const view = views.get(editor);
    if (!view) return null;

    const info = infoOf(view);
    return info?.editor === editor ? (info.file?.path ?? null) : null;
  };

  return { extension, getFilePath };
}
