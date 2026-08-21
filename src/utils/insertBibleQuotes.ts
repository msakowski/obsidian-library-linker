import { Editor, EditorPosition } from 'obsidian';
import { convertBibleTextToMarkdownLink } from '@/utils/convertBibleTextToMarkdownLink';
import { formatBibleText } from '@/utils/formatBibleText';
import type {
  BibleCitationProvider,
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
import { splitBibleReferenceForCitation } from '@/utils/splitBibleReferenceForCitation';
import { logger } from '@/utils/logger';
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
): Promise<string | null> {
  const parts = splitBibleReferenceForCitation(reference);

  if (parts.length === 0) {
    logger.warn('fetchCitationText: reference has no verse ranges', reference);
    return null;
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
      return null;
    }

    texts.push(result.text.trim());
  }

  return texts.join(' ');
}

async function generateBibleQuoteText(
  reference: BibleReference,
  settings: LinkReplacerSettings,
  provider: BibleCitationProvider,
): Promise<string | null> {
  try {
    logger.log('generateBibleQuoteText: fetching text for', reference);
    const text = await fetchCitationText(reference, settings, provider);

    if (!text) {
      return null;
    }

    logger.log('generateBibleQuoteText: fetched text length:', text.length);

    // The quote is labelled with the reference the user wrote, not with the
    // parts it was fetched in.
    const bibleRefLinked = convertBibleTextToMarkdownLink(reference, settings);
    if (!bibleRefLinked) {
      logger.warn('generateBibleQuoteText: convertBibleTextToMarkdownLink returned falsy');
      return null;
    }

    const bibleRef = formatBibleText(reference, settings.bookLength, settings.language);

    const processed = processTemplate(settings.bibleQuote.template, {
      bibleRef,
      bibleRefLinked,
      quote: text,
    });

    return processed;
  } catch (error: unknown) {
    logger.error(
      'generateBibleQuoteText: error:',
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
}

interface InsertQuotesResult {
  inserted: number;
  linksFound: number;
  fetchFailed: number;
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
    return { inserted: 0, linksFound: 0, fetchFailed: 0 };
  }

  const changes: Array<{
    from: { line: number; ch: number };
    to: { line: number; ch: number };
    text: string;
  }> = [];

  let skippedAlreadyQuoted = 0;
  let fetchFailed = 0;

  // Process links in reverse order to maintain line numbers
  for (let i = links.length - 1; i >= 0; i--) {
    const linkInfo = links[i];

    if (linkInfo.lineNumber > editor.lastLine()) {
      continue;
    }

    const currentLine = editor.getLine(linkInfo.lineNumber);
    const nextLine =
      linkInfo.lineNumber < editor.lastLine() ? editor.getLine(linkInfo.lineNumber + 1) : '';

    // Skip if quote already exists
    if (
      currentLine &&
      currentLine.trim().startsWith('>') &&
      nextLine &&
      nextLine.trim().startsWith('>')
    ) {
      skippedAlreadyQuoted++;
      logger.log(
        `insertAllBibleQuotes: skipping link on line ${linkInfo.lineNumber} — already quoted`,
      );
      continue;
    }

    try {
      const quoteText = await generateBibleQuoteText(linkInfo.reference, settings, provider);
      if (quoteText) {
        if (isLinkStandaloneOnLine(currentLine, settings)) {
          changes.push({
            from: { line: linkInfo.lineNumber, ch: 0 },
            to: { line: linkInfo.lineNumber, ch: currentLine.length },
            text: quoteText,
          });
        } else {
          changes.push({
            from: { line: linkInfo.lineNumber, ch: currentLine.length },
            to: { line: linkInfo.lineNumber, ch: currentLine.length },
            text: '\n\n' + quoteText,
          });
        }
      } else {
        fetchFailed++;
        logger.warn(
          `insertAllBibleQuotes: generateBibleQuoteText returned null for link on line ${linkInfo.lineNumber}`,
        );
      }
    } catch (error: unknown) {
      fetchFailed++;
      logger.error(
        `Error processing Bible quote for link ${i}:`,
        error instanceof Error ? error.message : String(error),
      );
      continue;
    }
  }

  logger.log(
    `insertAllBibleQuotes: ${links.length} links found, ${changes.length} quotes generated, ${skippedAlreadyQuoted} already quoted, ${fetchFailed} failed`,
  );

  if (changes.length > 0) {
    editor.transaction({ changes });
  }

  return { inserted: changes.length, linksFound: links.length, fetchFailed };
}

export async function insertBibleQuoteAtCursor(
  editor: Editor,
  settings: LinkReplacerSettings,
  provider: BibleCitationProvider,
): Promise<{ inserted: boolean; alreadyExists: boolean; fetchFailed: boolean }> {
  const cursor = editor.getCursor();
  const cursorLine = cursor.line;

  logger.log('insertBibleQuoteAtCursor', cursorLine);

  if (cursorLine > editor.lastLine()) {
    return { inserted: false, alreadyExists: false, fetchFailed: false };
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
    return { inserted: false, alreadyExists: true, fetchFailed: false };
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
    return { inserted: false, alreadyExists: false, fetchFailed: false };
  }

  const quoteTexts: string[] = [];
  for (const linkInfo of linksOnTargetLine) {
    const reference = parseJWLibraryLink(linkInfo.url);
    logger.log('reference', reference);
    if (reference) {
      const quoteText = await generateBibleQuoteText(reference, settings, provider);
      if (quoteText) {
        quoteTexts.push(quoteText);
      }
    }
  }

  if (quoteTexts.length > 0) {
    const combinedText = quoteTexts.join('\n\n');
    if (isLinkStandaloneOnLine(targetLineText, settings)) {
      editor.transaction({
        changes: [
          {
            from: { line: targetLineNumber, ch: 0 },
            to: { line: targetLineNumber, ch: targetLineText.length },
            text: combinedText,
          },
        ],
      });
    } else {
      editor.transaction({
        changes: [
          {
            from: { line: targetLineNumber, ch: targetLineText.length },
            to: { line: targetLineNumber, ch: targetLineText.length },
            text: '\n\n' + combinedText,
          },
        ],
      });
    }
    return { inserted: true, alreadyExists: false, fetchFailed: false };
  }

  return { inserted: false, alreadyExists: false, fetchFailed: linksOnTargetLine.length > 0 };
}

/** Where a freshly created link was written, so its quote can be placed next to it. */
export interface CreatedLinkAnchor {
  /** Line the link was written to. */
  line: number;
  /** The `jwlibrary:///…` URL of the created link, used to find it again. */
  linkUrl: string;
}

export interface CreatedLinkQuoteResult {
  inserted: boolean;
  alreadyExists: boolean;
  fetchFailed: boolean;
  /** The created link was gone by the time the text arrived — nothing was written. */
  anchorLost: boolean;
}

/**
 * Finds the line the created link currently lives on.
 *
 * The text is fetched while the user keeps typing, so the link may have moved
 * by the time it arrives. The line it was written to is checked first, then
 * the closest line that still contains the same URL.
 */
function findCreatedLinkLine(editor: Editor, anchor: CreatedLinkAnchor): number | null {
  const lastLine = editor.lastLine();

  if (
    anchor.line >= 0 &&
    anchor.line <= lastLine &&
    editor.getLine(anchor.line).includes(anchor.linkUrl)
  ) {
    return anchor.line;
  }

  let closest: number | null = null;

  for (let line = 0; line <= lastLine; line++) {
    if (!editor.getLine(line).includes(anchor.linkUrl)) continue;

    if (closest === null || Math.abs(line - anchor.line) < Math.abs(closest - anchor.line)) {
      closest = line;
    }
  }

  return closest;
}

function hasQuoteBelow(editor: Editor, line: number): boolean {
  if (line >= editor.lastLine()) return false;

  return editor
    .getLine(line + 1)
    .trim()
    .startsWith('>');
}

/**
 * Inserts the quote for a link that was just created by the suggester.
 *
 * Unlike the command driven insertions this runs while the user is typing:
 * the text is fetched first and the editor is only touched afterwards, the
 * link is looked up again in case it moved, and the cursor is put back where
 * the user left it.
 */
/**
 * Opens a collapsed callout (`[!quote]-` becomes `[!quote]+`).
 *
 * A quote that appears on its own but shows nothing is pointless, and `+`
 * keeps the callout foldable, so it can still be closed by hand.
 */
function openCollapsedCallout(quoteText: string): string {
  return quoteText.replace(/^(\s*>\s*\[![^\]]+\])-/, '$1+');
}

export async function insertBibleQuoteForCreatedLink(
  editor: Editor,
  reference: BibleReference,
  settings: LinkReplacerSettings,
  provider: BibleCitationProvider,
  anchor: CreatedLinkAnchor,
): Promise<CreatedLinkQuoteResult> {
  const generated = await generateBibleQuoteText(reference, settings, provider);
  const quoteText = generated && openCollapsedCallout(generated);

  if (!quoteText) {
    return { inserted: false, alreadyExists: false, fetchFailed: true, anchorLost: false };
  }

  const targetLine = findCreatedLinkLine(editor, anchor);

  if (targetLine === null) {
    logger.warn(
      'insertBibleQuoteForCreatedLink: created link no longer found, skipping insertion',
      anchor.linkUrl,
    );
    return { inserted: false, alreadyExists: false, fetchFailed: false, anchorLost: true };
  }

  if (hasQuoteBelow(editor, targetLine)) {
    logger.log(`insertBibleQuoteForCreatedLink: line ${targetLine} is already quoted`);
    return { inserted: false, alreadyExists: true, fetchFailed: false, anchorLost: false };
  }

  const targetLineText = editor.getLine(targetLine);
  const cursorBefore = editor.getCursor();
  const standalone = isLinkStandaloneOnLine(targetLineText, settings);

  // When the quote replaces the reference the user is done with that line, so
  // make sure there is a line left to keep writing on.
  const quoteEndsNote = targetLine >= editor.lastLine();
  const insertedText =
    (standalone ? '' : '\n\n') + quoteText + (standalone && quoteEndsNote ? '\n' : '');

  editor.transaction({
    changes: [
      {
        from: { line: targetLine, ch: standalone ? 0 : targetLineText.length },
        to: { line: targetLine, ch: targetLineText.length },
        text: insertedText,
      },
    ],
  });

  const insertedLineBreaks = insertedText.split('\n').length - 1;

  if (standalone && cursorBefore.line === targetLine) {
    // The reference became the quote — carry on below it.
    placeCursorAfterQuote(editor, targetLine, insertedLineBreaks, quoteEndsNote);
  } else {
    // The reference sits in a sentence the user may still be writing.
    restoreCursor(editor, cursorBefore, targetLine, insertedLineBreaks);
  }

  return { inserted: true, alreadyExists: false, fetchFailed: false, anchorLost: false };
}

/**
 * Leaves the cursor on the line following the quote, so the user can keep
 * writing where the reference used to be.
 */
function placeCursorAfterQuote(
  editor: Editor,
  targetLine: number,
  insertedLineBreaks: number,
  quoteEndsNote: boolean,
): void {
  // With a trailing newline the last inserted line is the empty one to
  // continue on; otherwise the note already has a line after the quote.
  const lineAfterQuote = targetLine + insertedLineBreaks + (quoteEndsNote ? 0 : 1);
  const line = Math.min(lineAfterQuote, editor.lastLine());

  editor.setCursor({ line, ch: editor.getLine(line).length });
}

/**
 * Puts the cursor back after an insertion the user did not ask for, following
 * the text it was sitting on if the quote pushed it further down.
 */
function restoreCursor(
  editor: Editor,
  cursor: EditorPosition,
  targetLine: number,
  insertedLineBreaks: number,
): void {
  const followed = cursor.line > targetLine ? cursor.line + insertedLineBreaks : cursor.line;
  const line = Math.min(Math.max(followed, 0), editor.lastLine());
  const ch = Math.min(Math.max(cursor.ch, 0), editor.getLine(line).length);

  editor.setCursor({ line, ch });
}
