import { Notice, type Editor, type EditorPosition } from 'obsidian';
import type {
  BibleCitationProvider,
  BibleReference,
  Language,
  LinkReplacerSettings,
} from '@/types';
import { findJWLibraryLinksInLine } from '@/utils/findJWLibraryLinks';
import {
  insertBibleQuoteForCreatedLink,
  isLinkUrlUniqueInNote,
  type CreatedLinkAnchor,
  type CreatedLinkQuoteResult,
} from '@/utils/insertBibleQuotes';
import { logger } from '@/utils/logger';
import { getBookLanguage } from '@/utils/signLanguage';
import {
  exceedsQuoteChapterLimit,
  MAX_QUOTE_CHAPTERS,
} from '@/utils/splitBibleReferenceForCitation';
import type { CreatedLinkTracker, TrackedRange } from '@/utils/createdLinkTracker';

type TranslateFn = (key: string, variables?: Record<string, string>) => string;

/** A link whose quote is being fetched. */
interface PendingLink {
  /** The created text, without its surrounding whitespace. */
  text: string;
  /** Where that text currently sits, when it is tracked. */
  range?: TrackedRange;
}

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
  private readonly inFlight = new WeakMap<Editor, Map<string, PendingLink>>();

  /** Set on plugin unload: lookups still pending must not touch any note. */
  private disposed = false;

  /**
   * Whether the failure notice was shown while no Bible text is available at
   * all (offline only, with no Bible imported): every created link would fail
   * the same way, so it is shown once per session and language, until text
   * becomes available for that language again.
   */
  private readonly unavailableNoticeShown = new Set<Language>();

  constructor(
    private readonly getSettings: () => LinkReplacerSettings,
    private readonly provider: BibleCitationProvider,
    private readonly t: TranslateFn,
    /** Path of the note shown in `editor`, or null when it cannot be told. */
    private readonly getEditorFilePath: (editor: Editor) => string | null,
    /**
     * Follows created links through edits. Without it, a link is found again
     * by line, which is only safe while its verse is cited once in the note.
     */
    private readonly tracker?: CreatedLinkTracker,
  ) {}

  /**
   * Starts the insertion for a link that was just written to the editor.
   * Returns immediately — typing must never wait for a citation lookup.
   */
  scheduleForCreatedLink(
    editor: Editor,
    reference: BibleReference,
    createdLink: string,
    at: EditorPosition,
  ): void {
    if (!this.getSettings().bibleQuote.autoInsertOnLinkCreation) return;

    // A whole-chapter link (`John 3`) names no verses to quote.
    if (!reference.verseRanges?.length) return;

    if (exceedsQuoteChapterLimit(reference)) {
      new Notice(this.t('notices.bibleQuoteTooManyChapters', { max: String(MAX_QUOTE_CHAPTERS) }));
      return;
    }

    const { line } = at;
    // A multi-range reference produces several links; the first one anchors
    // the quote, which covers the whole reference anyway.
    const linkUrl = findJWLibraryLinksInLine(createdLink, line)[0]?.url;

    if (!linkUrl) {
      logger.warn('AutoBibleQuoteInserter: no JW Library URL in created link', createdLink);
      return;
    }

    // Obsidian reuses the editor when another note is opened in the same tab,
    // so the note is recorded now and checked again once the text arrives.
    // When the note cannot be established, the edit is not risked at all.
    const filePath = this.getEditorFilePath(editor);
    if (filePath === null) {
      logger.warn('AutoBibleQuoteInserter: note of the editor unknown, not quoting');
      return;
    }
    const isSameNote = () => this.getEditorFilePath(editor) === filePath;

    const key = `${filePath}:${line}:${linkUrl}`;
    const editorInFlight = this.inFlight.get(editor) ?? new Map<string, PendingLink>();
    const previous = editorInFlight.get(key);
    // A lookup whose link was removed meanwhile (undone, then created again
    // on the same line) can no longer quote it: this creation gets its own.
    if (previous && this.isStillWritten(editor, previous)) return;

    const range = this.trackCreatedLink(editor, createdLink, at);
    const pending: PendingLink = { text: createdLink.trim(), range };
    editorInFlight.set(key, pending);
    this.inFlight.set(editor, editorInFlight);

    void this.insertNow(
      editor,
      reference,
      { line, linkUrl, createdLink, uniqueInNote: isLinkUrlUniqueInNote(editor, linkUrl), range },
      isSameNote,
    ).finally(() => {
      if (editorInFlight.get(key) === pending) editorInFlight.delete(key);
      if (range) this.tracker?.release(editor, range);
    });
  }

  /** Whether a pending link is still in the note as it was written. */
  private isStillWritten(editor: Editor, pending: PendingLink): boolean {
    // Without tracking, the link cannot be told apart from a new one.
    if (!pending.range) return true;

    const { from, to } = pending.range;
    return editor.getRange(editor.offsetToPos(from), editor.offsetToPos(to)) === pending.text;
  }

  /**
   * Starts following the created link, without its surrounding whitespace, so
   * the quote goes next to this very occurrence even when the same verse is
   * cited elsewhere in the note.
   */
  private trackCreatedLink(
    editor: Editor,
    createdLink: string,
    at: EditorPosition,
  ): TrackedRange | undefined {
    if (!this.tracker) return undefined;

    const trimmed = createdLink.trim();
    const from = editor.posToOffset(at) + createdLink.indexOf(trimmed);
    const to = from + trimmed.length;

    if (editor.getRange(editor.offsetToPos(from), editor.offsetToPos(to)) !== trimmed) {
      logger.warn('AutoBibleQuoteInserter: created link not found where it was written');
      return undefined;
    }

    return this.tracker.track(editor, from, to);
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
   * Shows why the quote could not be fetched: the provider's reason when it
   * gave one (offline Bible missing or lacking the verses, with online
   * fallback off), the generic notice otherwise.
   */
  private async notifyFetchFailed(reason?: string): Promise<void> {
    const language = getBookLanguage(this.getSettings().language);
    const available = await this.provider.isLanguageAvailable(language).catch(() => true);

    if (available) {
      this.unavailableNoticeShown.delete(language);
    } else {
      if (this.unavailableNoticeShown.has(language)) return;
      this.unavailableNoticeShown.add(language);
    }

    new Notice(reason ?? this.t('notices.bibleQuoteFetchFailed'));
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
        await this.notifyFetchFailed(result.fetchError);
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
