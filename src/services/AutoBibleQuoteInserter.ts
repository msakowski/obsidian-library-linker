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
  /** Links currently being quoted, so the same link is never quoted twice. */
  private readonly inFlight = new Set<string>();

  constructor(
    private readonly getSettings: () => LinkReplacerSettings,
    private readonly provider: BibleCitationProvider,
    private readonly t: TranslateFn,
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

    const key = `${line}:${linkUrl}`;
    if (this.inFlight.has(key)) return;
    this.inFlight.add(key);

    void this.insertNow(editor, reference, { line, linkUrl }).finally(() =>
      this.inFlight.delete(key),
    );
  }

  /**
   * Awaitable counterpart of {@link scheduleForCreatedLink}. Never rejects —
   * failures surface as a notice.
   */
  async insertNow(
    editor: Editor,
    reference: BibleReference,
    anchor: CreatedLinkAnchor,
  ): Promise<CreatedLinkQuoteResult> {
    try {
      const result = await insertBibleQuoteForCreatedLink(
        editor,
        reference,
        this.getSettings(),
        this.provider,
        anchor,
      );

      if (result.fetchFailed) {
        new Notice(this.t('notices.bibleQuoteFetchFailed'));
      }

      return result;
    } catch (error: unknown) {
      logger.error(
        'AutoBibleQuoteInserter: error inserting Bible quote:',
        error instanceof Error ? error.message : String(error),
      );
      new Notice(this.t('notices.errorInsertingQuotes'));

      return { inserted: false, alreadyExists: false, fetchFailed: true, anchorLost: false };
    }
  }
}
