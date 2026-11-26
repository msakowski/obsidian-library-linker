import { Editor, EditorPosition } from 'obsidian';
import { convertBibleTextToMarkdownLink } from '@/utils/convertBibleTextToMarkdownLink';
import { formatBibleText } from '@/utils/formatBibleText';
import type {
  BibleCitationProvider,
  BibleCitationResult,
  BibleReference,
  LinkReplacerSettings,
  LinkStyles,
} from '@/types';
import {
  findJWLibraryLinks,
  findJWLibraryLinksInLine,
  parseJWLibraryLink,
  type JWLibraryLinkInfo,
  type ContentSelection,
} from '@/utils/findJWLibraryLinks';
import {
  exceedsQuoteChapterLimit,
  splitBibleReferenceForCitation,
} from '@/utils/splitBibleReferenceForCitation';
import { logger } from '@/utils/logger';
import type { TrackedRange } from '@/utils/createdLinkTracker';
import { getBookLanguage } from './signLanguage';

const MARKDOWN_LINK_WITH_JWLIBRARY =
  /\[[^\]]*\]\(jwlibrary:\/\/\/finder\?bible=\d{8}(?:-\d{8})?(?:&[^)]*?)?\)/g;
const BARE_JWLIBRARY_LINK = /jwlibrary:\/\/\/finder\?bible=\d{8}(?:-\d{8})?(?:&[^\s)]*)?/g;

type LinkDecorations = Pick<LinkStyles, 'prefixOutsideLink' | 'suffixOutsideLink'>;

function isLinkStandaloneOnLine(lineText: string, decorations?: LinkDecorations): boolean {
  let stripped = lineText
    .replace(MARKDOWN_LINK_WITH_JWLIBRARY, '')
    .replace(BARE_JWLIBRARY_LINK, '')
    // A multi-range reference is written as several links joined by commas,
    // which still makes the line nothing but the reference.
    .replace(/[,;]/g, '');

  // The characters configured around the link — brackets, an emoji — belong to
  // the reference, not to any surrounding text.
  for (const decoration of [decorations?.prefixOutsideLink, decorations?.suffixOutsideLink]) {
    if (decoration?.trim()) {
      stripped = stripped.split(decoration).join('');
    }
  }

  return stripped.trim().length === 0;
}

function processTemplate(
  template: string,
  variables: {
    bibleRef: string;
    bibleRefLinked: string;
    quote: string;
  },
): string {
  return template
    .replace(/\{bibleRef\}/g, variables.bibleRef.trim())
    .replace(/\{bibleRefLinked\}/g, variables.bibleRefLinked.trim())
    .replace(/\{quote\}/g, variables.quote.trim());
}

/**
 * The outcome of a lookup: the text, or `null` with the reason to show the
 * user when there is a specific one.
 */
type CitationTextLookup = { text: string; error?: undefined } | { text: null; error?: string };
type QuoteLookup = { quote: string; error?: undefined } | { quote: null; error?: string };

/**
 * The provider's own message for an offline failure: the offline Bible is not
 * imported or lacks the verses, with online fallback turned off. It tells the
 * user what to fix, where "please try again" would not help. An online failure
 * (network, page layout) keeps the generic notice.
 */
function offlineFailureReason(result: BibleCitationResult): string | undefined {
  return result.source === 'offline' ? result.error : undefined;
}

/**
 * Fetches the text of a reference, one provider lookup per part.
 *
 * Multi-range and multi-chapter references cannot be resolved in a single
 * lookup, so they are split up and the parts are stitched back together.
 * A missing part fails the whole citation — a partial quote would silently
 * misrepresent the reference.
 */
async function fetchCitationText(
  reference: BibleReference,
  settings: LinkReplacerSettings,
  provider: BibleCitationProvider,
): Promise<CitationTextLookup> {
  const parts = splitBibleReferenceForCitation(reference);

  if (parts.length === 0) {
    logger.warn('fetchCitationText: reference has no verse ranges', reference);
    return { text: null };
  }

  const texts: string[] = [];

  for (const part of parts) {
    const result = await provider.getCitation(part, getBookLanguage(settings.language));

    if (!result.success || !result.text) {
      logger.warn(
        'fetchCitationText: fetch failed —',
        result.error ?? 'empty text',
        'success:',
        result.success,
      );
      return { text: null, error: offlineFailureReason(result) };
    }

    texts.push(result.text.trim());
  }

  return { text: texts.join(' ') };
}

async function generateBibleQuoteText(
  reference: BibleReference,
  settings: LinkReplacerSettings,
  provider: BibleCitationProvider,
): Promise<QuoteLookup> {
  // Chapter navigation links do not specify verses to quote. Keep them in the note.
  if (!reference.verseRanges?.length) return { quote: null };

  try {
    logger.log('generateBibleQuoteText: fetching text for', reference);
    const { text, error } = await fetchCitationText(reference, settings, provider);

    if (!text) {
      return { quote: null, error };
    }

    logger.log('generateBibleQuoteText: fetched text length:', text.length);

    // The quote is labelled with the reference the user wrote, not with the
    // parts it was fetched in.
    const bibleRefLinked = convertBibleTextToMarkdownLink(reference, settings);
    if (!bibleRefLinked) {
      logger.warn('generateBibleQuoteText: convertBibleTextToMarkdownLink returned falsy');
      return { quote: null };
    }

    const bibleRef = formatBibleText(reference, settings.bookLength, settings.language);

    const quote = processTemplate(settings.bibleQuote.template, {
      bibleRef,
      bibleRefLinked,
      quote: text,
    });

    return { quote };
  } catch (error: unknown) {
    logger.error(
      'generateBibleQuoteText: error:',
      error instanceof Error ? error.message : String(error),
    );
    return { quote: null };
  }
}

interface QuoteChange {
  from: EditorPosition;
  to: EditorPosition;
  text: string;
}

function isBlankLine(editor: Editor, line: number): boolean {
  return line > editor.lastLine() || editor.getLine(line).trim().length === 0;
}

const LIST_ITEM_PREFIX = /^(\s*)([-*+]|\d+[.)])(\s+)/;

/**
 * How a quote keeps the nesting of the line holding its link: the indentation
 * each quote line starts with, and whether the line is a list item.
 *
 * Below a list item the quote is indented to the item's text, which keeps it
 * inside the item. Any other line passes on its own indentation.
 */
function getQuoteNesting(lineText: string): { indent: string; inListItem: boolean } {
  const listItem = LIST_ITEM_PREFIX.exec(lineText);
  if (listItem) {
    const [, leading, marker, spacing] = listItem;
    return { indent: leading + ' '.repeat(marker.length + spacing.length), inListItem: true };
  }

  return { indent: /^\s*/.exec(lineText)?.[0] ?? '', inListItem: false };
}

/** Prefixes every non-empty line of `text` with `indent`. */
function indentLines(text: string, indent: string): string {
  if (!indent) return text;

  return text
    .split('\n')
    .map((line) => (line ? indent + line : line))
    .join('\n');
}

/**
 * Builds the edit that puts a quote next to the reference on `line`.
 *
 * With `replaceLine` the quote takes the place of the reference, otherwise it
 * goes below the line after a blank one. A blank line is kept before any text
 * that follows, so that text is not pulled into the blockquote.
 *
 * Below a list item the quote is nested in the item and no blank lines are
 * added around it, so a tight list stays tight; a following list item cannot
 * be pulled into the blockquote.
 */
function buildQuoteChange(
  editor: Editor,
  line: number,
  quoteText: string,
  replaceLine: boolean,
): QuoteChange {
  const lineText = editor.getLine(line);
  const { indent, inListItem } = getQuoteNesting(lineText);
  const nextLine = line + 1;
  const nextIsListItem =
    nextLine <= editor.lastLine() && LIST_ITEM_PREFIX.test(editor.getLine(nextLine));
  const separator = isBlankLine(editor, nextLine) || (inListItem && nextIsListItem) ? '' : '\n';
  const before = replaceLine ? '' : inListItem ? '\n' : '\n\n';

  return {
    from: { line, ch: replaceLine ? 0 : lineText.length },
    to: { line, ch: lineText.length },
    text: before + indentLines(quoteText, indent) + separator,
  };
}

interface InsertQuotesResult {
  inserted: number;
  linksFound: number;
  fetchFailed: number;
  /** The provider's reason for the first failed lookup, when it gave a specific one. */
  fetchError?: string;
  /** Links not quoted because they span more than `MAX_QUOTE_CHAPTERS` chapters. */
  tooManyChapters: number;
}

interface InsertQuoteAtCursorResult {
  inserted: boolean;
  alreadyExists: boolean;
  fetchFailed: boolean;
  /** The provider's reason for the first failed lookup, when it gave a specific one. */
  fetchError?: string;
  /** A link was not quoted because it spans more than `MAX_QUOTE_CHAPTERS` chapters. */
  tooManyChapters: boolean;
}

export async function insertAllBibleQuotes(
  editor: Editor,
  settings: LinkReplacerSettings,
  provider: BibleCitationProvider,
  selection?: ContentSelection,
): Promise<InsertQuotesResult> {
  const links = findJWLibraryLinks(editor, selection);

  logger.log('insertAllBibleQuotes: found links:', links.length);

  if (links.length === 0) {
    // Log all lines for debugging detection issues
    const totalLines = editor.lastLine() + 1;
    logger.log(`insertAllBibleQuotes: scanned ${totalLines} lines, no links found`);
    for (let i = 0; i <= editor.lastLine(); i++) {
      const line = editor.getLine(i);
      if (line.includes('jwlibrary')) {
        logger.warn(
          `insertAllBibleQuotes: line ${i} contains 'jwlibrary' but regex did not match:`,
          JSON.stringify(line),
        );
      }
    }
    return { inserted: 0, linksFound: 0, fetchFailed: 0, tooManyChapters: 0 };
  }

  // Several links can share a line (a multi-range reference, or references
  // joined by commas). Their quotes are combined into a single change per line:
  // separate changes on the same line would overlap in the transaction.
  const linksByLine = new Map<number, JWLibraryLinkInfo[]>();
  for (const linkInfo of links) {
    const lineLinks = linksByLine.get(linkInfo.lineNumber) ?? [];
    lineLinks.push(linkInfo);
    linksByLine.set(linkInfo.lineNumber, lineLinks);
  }

  const changes: QuoteChange[] = [];

  let inserted = 0;
  let skippedAlreadyQuoted = 0;
  let fetchFailed = 0;
  let fetchError: string | undefined;
  let tooManyChapters = 0;

  for (const [lineNumber, lineLinks] of linksByLine) {
    if (lineNumber > editor.lastLine()) {
      continue;
    }

    const currentLine = editor.getLine(lineNumber);
    const nextLine = lineNumber < editor.lastLine() ? editor.getLine(lineNumber + 1) : '';

    // Skip if quote already exists
    if (
      currentLine &&
      currentLine.trim().startsWith('>') &&
      nextLine &&
      nextLine.trim().startsWith('>')
    ) {
      skippedAlreadyQuoted += lineLinks.length;
      logger.log(`insertAllBibleQuotes: skipping links on line ${lineNumber} — already quoted`);
      continue;
    }

    const quoteTexts: string[] = [];

    for (const linkInfo of lineLinks) {
      // A whole-chapter link names no verses: nothing to quote, nothing failed
      if (!linkInfo.reference.verseRanges?.length) continue;

      if (exceedsQuoteChapterLimit(linkInfo.reference)) {
        tooManyChapters++;
        continue;
      }

      try {
        const { quote, error } = await generateBibleQuoteText(
          linkInfo.reference,
          settings,
          provider,
        );
        if (quote) {
          quoteTexts.push(quote);
        } else {
          fetchFailed++;
          fetchError ??= error;
          logger.warn(
            `insertAllBibleQuotes: generateBibleQuoteText returned null for link on line ${lineNumber}`,
          );
        }
      } catch (error: unknown) {
        fetchFailed++;
        logger.error(
          `Error processing Bible quote for link on line ${lineNumber}:`,
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    if (quoteTexts.length === 0) {
      continue;
    }

    // The line is only replaced when every reference on it got its quote,
    // otherwise the references without one would be lost.
    const replaceLine =
      quoteTexts.length === lineLinks.length && isLinkStandaloneOnLine(currentLine, settings);

    changes.push(buildQuoteChange(editor, lineNumber, quoteTexts.join('\n\n'), replaceLine));
    inserted += quoteTexts.length;
  }

  logger.log(
    `insertAllBibleQuotes: ${links.length} links found, ${inserted} quotes generated, ${skippedAlreadyQuoted} already quoted, ${fetchFailed} failed`,
  );

  if (changes.length > 0) {
    editor.transaction({ changes });
  }

  return { inserted, linksFound: links.length, fetchFailed, fetchError, tooManyChapters };
}

export async function insertBibleQuoteAtCursor(
  editor: Editor,
  settings: LinkReplacerSettings,
  provider: BibleCitationProvider,
): Promise<InsertQuoteAtCursorResult> {
  const cursor = editor.getCursor();
  const cursorLine = cursor.line;

  logger.log('insertBibleQuoteAtCursor', cursorLine);

  if (cursorLine > editor.lastLine()) {
    return { inserted: false, alreadyExists: false, fetchFailed: false, tooManyChapters: false };
  }

  const currentLine = editor.getLine(cursorLine);
  const nextLine = cursorLine < editor.lastLine() ? editor.getLine(cursorLine + 1) : '';

  // Skip if already formatted as callout or if next line is a quote
  if (
    currentLine &&
    currentLine.trim().startsWith('>') &&
    nextLine &&
    nextLine.trim().startsWith('>')
  ) {
    return { inserted: false, alreadyExists: true, fetchFailed: false, tooManyChapters: false };
  }

  const candidateLineNumbers = [
    cursorLine,
    cursorLine > 0 ? cursorLine - 1 : null,
    cursorLine < editor.lastLine() ? cursorLine + 1 : null,
  ].filter((lineNumber): lineNumber is number => lineNumber !== null);

  let linksOnTargetLine: JWLibraryLinkInfo[] = [];
  let targetLineNumber = cursorLine;
  let targetLineText = currentLine;

  for (const lineNumber of candidateLineNumbers) {
    const lineText = editor.getLine(lineNumber);
    const links = findJWLibraryLinksInLine(lineText, lineNumber);
    if (links.length > 0) {
      linksOnTargetLine = links;
      targetLineNumber = lineNumber;
      targetLineText = lineText;
      break;
    }
  }

  if (linksOnTargetLine.length === 0) {
    return { inserted: false, alreadyExists: false, fetchFailed: false, tooManyChapters: false };
  }

  const quoteTexts: string[] = [];
  let tooManyChapters = false;
  let failed = 0;
  let fetchError: string | undefined;
  for (const linkInfo of linksOnTargetLine) {
    const reference = parseJWLibraryLink(linkInfo.url);
    logger.log('reference', reference);
    // A whole-chapter link names no verses: nothing to quote, nothing failed
    if (!reference?.verseRanges?.length) continue;

    if (exceedsQuoteChapterLimit(reference)) {
      tooManyChapters = true;
      continue;
    }

    const { quote, error } = await generateBibleQuoteText(reference, settings, provider);
    if (quote) {
      quoteTexts.push(quote);
    } else {
      failed++;
      fetchError ??= error;
    }
  }

  if (quoteTexts.length > 0) {
    // The line is only replaced when every reference on it got its quote,
    // otherwise the references without one would be lost.
    const replaceLine =
      quoteTexts.length === linksOnTargetLine.length &&
      isLinkStandaloneOnLine(targetLineText, settings);

    editor.transaction({
      changes: [buildQuoteChange(editor, targetLineNumber, quoteTexts.join('\n\n'), replaceLine)],
    });
    return { inserted: true, alreadyExists: false, fetchFailed: false, tooManyChapters };
  }

  return {
    inserted: false,
    alreadyExists: false,
    fetchFailed: failed > 0,
    fetchError,
    tooManyChapters,
  };
}

/** Where a freshly created link was written, so its quote can be placed next to it. */
export interface CreatedLinkAnchor {
  /** Line the link was written to. */
  line: number;
  /** The `jwlibrary:///…` URL of the created link, used to find it again. */
  linkUrl: string;
  /**
   * The exact text that was written, including several comma-joined links for
   * a multi-range reference. Without it, only the markdown link around
   * `linkUrl` counts as the created reference.
   */
  createdLink?: string;
  /**
   * Whether `linkUrl` appeared on a single line of the note right after the
   * link was written. Only then may the link be looked for on another line
   * when lines above it moved during the lookup.
   */
  uniqueInNote?: boolean;
  /**
   * Current offsets of the created text, kept up to date through every edit
   * (see `CreatedLinkTracker`). When set, the link is found by position, and
   * the whole created reference (`createdLink`) must still be there unchanged.
   */
  range?: TrackedRange;
}

export interface CreatedLinkQuoteResult {
  inserted: boolean;
  alreadyExists: boolean;
  fetchFailed: boolean;
  /** The created link was gone by the time the text arrived — nothing was written. */
  anchorLost: boolean;
}

/**
 * Whether `text` contains `linkUrl` as a whole URL.
 *
 * A URL without a language parameter is a prefix of a longer range that starts
 * with the same verse (`bible=43003016` in `bible=43003016-43003018`), and a
 * language code can be a prefix of another one (`wtlocale=F` in `wtlocale=FI`).
 */
function containsLinkUrl(text: string, linkUrl: string): boolean {
  for (let index = text.indexOf(linkUrl); index !== -1; index = text.indexOf(linkUrl, index + 1)) {
    if (!/[\w&=-]/.test(text.charAt(index + linkUrl.length))) return true;
  }

  return false;
}

/** Lines of the note that contain `linkUrl`. */
function findLinesWithLinkUrl(editor: Editor, linkUrl: string): number[] {
  const lines: number[] = [];

  for (let line = 0; line <= editor.lastLine(); line++) {
    if (containsLinkUrl(editor.getLine(line), linkUrl)) lines.push(line);
  }

  return lines;
}

/** Whether `linkUrl` appears on exactly one line of the note. */
export function isLinkUrlUniqueInNote(editor: Editor, linkUrl: string): boolean {
  return findLinesWithLinkUrl(editor, linkUrl).length === 1;
}

/** Where the created link is now: its line, and its span on that line. */
interface LocatedLink {
  line: number;
  /** Span of the complete created reference on the line, when known. */
  from?: number;
  to?: number;
}

/**
 * Finds the created link again once its text has arrived.
 *
 * With a tracked range, the very occurrence that was created is followed
 * through every edit, and it counts only while the whole created reference is
 * still there as written: a removed or edited part (one range of `Joh 3:16,
 * 18`) cancels the quote rather than restore it.
 *
 * Without one, the link is found by its URL. Lines added above it during the
 * lookup — by the user, or by the quote of a link created just before — push
 * it down, and another mention of the same verse may then sit on the recorded
 * line. So the link is only accepted while its URL is on a single line of the
 * note: on the recorded line, or elsewhere if it was already the single
 * mention when it was created.
 */
function locateCreatedLink(editor: Editor, anchor: CreatedLinkAnchor): LocatedLink | null {
  const created = anchor.createdLink?.trim();

  if (anchor.range) {
    if (!created) return null;

    const from = editor.offsetToPos(anchor.range.from);
    const to = editor.offsetToPos(anchor.range.to);
    if (from.line !== to.line || editor.getRange(from, to) !== created) return null;

    return { line: from.line, from: from.ch, to: to.ch };
  }

  const lines = findLinesWithLinkUrl(editor, anchor.linkUrl);
  const line = lines.includes(anchor.line)
    ? anchor.line
    : anchor.uniqueInNote && lines.length === 1
      ? lines[0]
      : null;
  if (line === null) return null;

  // Its own quote, right below, may repeat the URL; any other line with it
  // makes the recorded line ambiguous.
  const quoteEnd = hasBlockquoteBelow(editor, line) ? findBlockquoteEnd(editor, line + 1) : line;
  if (lines.some((other) => other < line || other > quoteEnd)) return null;
  // The whole created reference must still be there, not only its first link.
  if (created && !editor.getLine(line).includes(created)) return null;

  return { line };
}

const QUOTE_TRANSACTION_ORIGIN = 'bible-quote';

/** Last line of the blockquote or callout that `line` belongs to. */
function findBlockquoteEnd(editor: Editor, line: number): number {
  let end = line;

  while (
    end < editor.lastLine() &&
    editor
      .getLine(end + 1)
      .trim()
      .startsWith('>')
  ) {
    end++;
  }

  return end;
}

/**
 * Tells whether the blockquote right below `line` is the quote of this link.
 *
 * Any other blockquote or callout below is unrelated text, and must not stop
 * the quote from being inserted.
 */
function hasBlockquoteBelow(editor: Editor, line: number): boolean {
  return (
    line < editor.lastLine() &&
    editor
      .getLine(line + 1)
      .trim()
      .startsWith('>')
  );
}

function hasQuoteBelow(editor: Editor, line: number, linkUrl: string): boolean {
  if (!hasBlockquoteBelow(editor, line)) {
    return false;
  }

  const blockEnd = findBlockquoteEnd(editor, line + 1);

  for (let quoteLine = line + 1; quoteLine <= blockEnd; quoteLine++) {
    if (containsLinkUrl(editor.getLine(quoteLine), linkUrl)) return true;
  }

  return false;
}

/**
 * Whether the line holds nothing but the created reference and its decorations.
 *
 * Only then can the quote take the place of the line: any other reference on
 * it, written before or while the text was being fetched, must survive.
 */
function isOnlyCreatedLinkOnLine(
  lineText: string,
  anchor: CreatedLinkAnchor,
  located: LocatedLink,
  decorations: LinkDecorations,
): boolean {
  let rest: string;

  if (located.from !== undefined && located.to !== undefined) {
    rest = lineText.slice(0, located.from) + lineText.slice(located.to);
  } else {
    const created =
      anchor.createdLink?.trim() ||
      lineText
        .match(MARKDOWN_LINK_WITH_JWLIBRARY)
        ?.find((link) => containsLinkUrl(link, anchor.linkUrl));

    if (!created || !lineText.includes(created)) {
      return false;
    }

    rest = lineText.replace(created, '');
  }

  return !rest.includes('jwlibrary:///') && isLinkStandaloneOnLine(rest, decorations);
}

/**
 * Opens a collapsed callout (`[!quote]-` becomes `[!quote]+`).
 *
 * A quote that appears on its own but shows nothing is pointless, and `+`
 * keeps the callout foldable, so it can still be closed by hand.
 */
function openCollapsedCallout(quoteText: string): string {
  return quoteText.replace(/^(\s*>\s*\[![^\]]+\])-/, '$1+');
}

/**
 * Inserts the quote for a link that was just created by the suggester.
 *
 * Unlike the command driven insertions this runs while the user is typing:
 * the text is fetched first and the editor is only touched afterwards, once
 * the link is confirmed to still be where it was written, the insertion is
 * confirmed to still be wanted — same note, feature still on, plugin still
 * loaded (`shouldStillInsert`) — and the cursor is put back where the user
 * left it.
 */
export async function insertBibleQuoteForCreatedLink(
  editor: Editor,
  reference: BibleReference,
  settings: LinkReplacerSettings,
  provider: BibleCitationProvider,
  anchor: CreatedLinkAnchor,
  shouldStillInsert: () => boolean = () => true,
): Promise<CreatedLinkQuoteResult> {
  const generated = await generateBibleQuoteText(reference, settings, provider);
  const quoteText = generated && openCollapsedCallout(generated);

  if (!quoteText) {
    return { inserted: false, alreadyExists: false, fetchFailed: true, anchorLost: false };
  }

  // The lookup can take seconds: the user may have opened another note in the
  // same editor, turned the feature off, or the plugin may have been unloaded.
  if (!shouldStillInsert()) {
    logger.warn('insertBibleQuoteForCreatedLink: insertion no longer wanted, skipping');
    return { inserted: false, alreadyExists: false, fetchFailed: false, anchorLost: true };
  }

  const located = locateCreatedLink(editor, anchor);

  if (located === null) {
    logger.warn(
      'insertBibleQuoteForCreatedLink: created link no longer found, skipping insertion',
      anchor.linkUrl,
    );
    return { inserted: false, alreadyExists: false, fetchFailed: false, anchorLost: true };
  }

  const targetLine = located.line;

  if (hasQuoteBelow(editor, targetLine, anchor.linkUrl)) {
    logger.log(`insertBibleQuoteForCreatedLink: line ${targetLine} is already quoted`);
    return { inserted: false, alreadyExists: true, fetchFailed: false, anchorLost: false };
  }

  const selectionBefore = { anchor: editor.getCursor('anchor'), head: editor.getCursor('head') };
  const targetText = editor.getLine(targetLine);
  // The quote only takes the place of the reference when it repeats the link,
  // otherwise the link the user just created would be deleted.
  const standalone =
    settings.bibleQuote.template.includes('{bibleRefLinked}') &&
    isOnlyCreatedLinkOnLine(targetText, anchor, located, settings);

  // A link inside a blockquote or callout gets its quote after the whole
  // block, so the block is not split in two. A link in a plain paragraph keeps
  // its quote right below, even when an unrelated callout follows.
  const insertLine =
    standalone || !targetText.trim().startsWith('>')
      ? targetLine
      : findBlockquoteEnd(editor, targetLine);
  const change = buildQuoteChange(editor, insertLine, quoteText, standalone);

  // When the quote replaces the reference the user is done with that line, so
  // make sure there is a line left to keep writing on.
  if (standalone && insertLine >= editor.lastLine()) {
    change.text += '\n';
  }

  // An origin of its own keeps the quote out of the undo step of the typing
  // that created the link: undo removes the quote alone.
  editor.transaction({ changes: [change] }, QUOTE_TRANSACTION_ORIGIN);

  const insertedLineBreaks = change.text.split('\n').length - 1;

  const onReplacedLine =
    selectionBefore.anchor.line === targetLine || selectionBefore.head.line === targetLine;

  if (standalone && onReplacedLine) {
    // The reference became the quote — carry on below it. A selection on the
    // replaced line has no text left to follow.
    placeCursorAfterQuote(editor, targetLine, quoteText);
  } else {
    // The user is still writing or selecting elsewhere: keep their selection.
    const follow = (position: EditorPosition) =>
      followPosition(editor, position, insertLine, insertedLineBreaks);
    editor.setSelection(follow(selectionBefore.anchor), follow(selectionBefore.head));
  }

  return { inserted: true, alreadyExists: false, fetchFailed: false, anchorLost: false };
}

/**
 * Leaves the cursor on the blank line following the quote, so the user can
 * keep writing where the reference used to be.
 */
function placeCursorAfterQuote(editor: Editor, targetLine: number, quoteText: string): void {
  const lastQuoteLine = targetLine + quoteText.split('\n').length - 1;
  const line = Math.min(lastQuoteLine + 1, editor.lastLine());

  editor.setCursor({ line, ch: editor.getLine(line).length });
}

/**
 * Where a position the user left ends up after an insertion they did not ask
 * for: it follows its text if the quote pushed that text further down.
 */
function followPosition(
  editor: Editor,
  position: EditorPosition,
  insertLine: number,
  insertedLineBreaks: number,
): EditorPosition {
  const followed = position.line > insertLine ? position.line + insertedLineBreaks : position.line;
  const line = Math.min(Math.max(followed, 0), editor.lastLine());
  const ch = Math.min(Math.max(position.ch, 0), editor.getLine(line).length);

  return { line, ch };
}
