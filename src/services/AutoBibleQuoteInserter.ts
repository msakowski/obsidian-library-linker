import { Notice, type Editor } from 'obsidian';
import type { BibleCitationProvider, BibleReference, LinkReplacerSettings } from '@/types';
import {
  insertBibleQuoteForCreatedLink,
  type CreatedLinkAnchor,
  type CreatedLinkQuoteResult,
} from '@/utils/insertBibleQuotes';
import { logger } from '@/utils/logger';

type TranslateFn = (key: string, variables?: Record<string, string>) => string;

const JW_LIBRARY_URL = /jwlibrary:\/\/\/finder\?bible=\d{8}(?:-\d{8})?(?:&[^)\s]*)?/;

/**
 * Inserts a Bible quote right after the suggester created a link, when the
 * user opted in to it.
 *
 * Fetching the text can take seconds, so the insertion never runs in the
 * typing path: it is started and forgotten, and the note is only touched once
 * the text is there. Anything that goes wrong is reported with a notice and
 * leaves the note untouched.
 */
export class AutoBibleQuoteInserter {
  /**
   * Links currently being quoted, per editor, so the same link is never quoted
   * twice. Scoped to the editor and note: the same verse on the same line of
   * another note is a different link.
   */
  private readonly inFlight = new WeakMap<Editor, Set<string>>();

  /** Set on plugin unload: lookups still pending must not touch any note. */
  private disposed = false;

  constructor(
    private readonly getSettings: () => LinkReplacerSettings,
    private readonly provider: BibleCitationProvider,
    private readonly t: TranslateFn,
    /** Path of the note shown in `editor`, or null when it cannot be told. */
    private readonly getEditorFilePath: (editor: Editor) => string | null,
  ) {}

  /**
   * Starts the insertion for a link that was just written to the editor.
   * Returns immediately — typing must never wait for a citation lookup.
   */
  scheduleForCreatedLink(
    editor: Editor,
    reference: BibleReference,
    createdLink: string,
    line: number,
  ): void {
    if (!this.getSettings().bibleQuote.autoInsertOnLinkCreation) return;

    // A multi-range reference produces several links; the first one anchors
    // the quote, which covers the whole reference anyway.
    const linkUrl = JW_LIBRARY_URL.exec(createdLink)?.[0];

    if (!linkUrl) {
      logger.warn('AutoBibleQuoteInserter: no JW Library URL in created link', createdLink);
      return;
    }

    // Obsidian reuses the editor when another note is opened in the same tab,
    // so the note is recorded now and checked again once the text arrives.
    const filePath = this.getEditorFilePath(editor);
    const isSameNote = () => this.getEditorFilePath(editor) === filePath;

    const key = `${filePath ?? ''}:${line}:${linkUrl}`;
    const editorInFlight = this.inFlight.get(editor) ?? new Set<string>();
    if (editorInFlight.has(key)) return;
    editorInFlight.add(key);
    this.inFlight.set(editor, editorInFlight);

    void this.insertNow(editor, reference, { line, linkUrl, createdLink }, isSameNote).finally(() =>
      editorInFlight.delete(key),
    );
  }

  /**
   * Drops every pending insertion. Called on plugin unload: a lookup that
   * resolves afterwards leaves the note untouched.
   */
  dispose(): void {
    this.disposed = true;
  }

  /** Whether a pending insertion may still edit the note. */
  private isActive(): boolean {
    return !this.disposed && this.getSettings().bibleQuote.autoInsertOnLinkCreation;
  }

  /**
   * Awaitable counterpart of {@link scheduleForCreatedLink}. Never rejects —
   * failures surface as a notice, unless the insertion is no longer wanted.
   */
  async insertNow(
    editor: Editor,
    reference: BibleReference,
    anchor: CreatedLinkAnchor,
    isSameNote?: () => boolean,
  ): Promise<CreatedLinkQuoteResult> {
    try {
      const result = await insertBibleQuoteForCreatedLink(
        editor,
        reference,
        this.getSettings(),
        this.provider,
        anchor,
        // Checked again once the text arrives: the feature may have been
        // turned off, or the plugin unloaded, during the lookup.
        () => this.isActive() && (isSameNote?.() ?? true),
      );

      if (result.fetchFailed && this.isActive()) {
        new Notice(this.t('notices.bibleQuoteFetchFailed'));
      }

      return result;
    } catch (error: unknown) {
      logger.error(
        'AutoBibleQuoteInserter: error inserting Bible quote:',
        error instanceof Error ? error.message : String(error),
      );
      if (this.isActive()) {
        new Notice(this.t('notices.errorInsertingQuotes'));
      }

      return { inserted: false, alreadyExists: false, fetchFailed: true, anchorLost: false };
    }
  }
}
