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

interface QuoteChange {
  from: EditorPosition;
  to: EditorPosition;
  text: string;
}

function isBlankLine(editor: Editor, line: number): boolean {
  return line > editor.lastLine() || editor.getLine(line).trim().length === 0;
}

/**
 * Builds the edit that puts a quote next to the reference on `line`.
 *
 * With `replaceLine` the quote takes the place of the reference, otherwise it
 * goes below the line after a blank one. A blank line is kept before any text
 * that follows, so that text is not pulled into the blockquote.
 */
function buildQuoteChange(
  editor: Editor,
  line: number,
  quoteText: string,
  replaceLine: boolean,
): QuoteChange {
  const lineText = editor.getLine(line);
  const separator = isBlankLine(editor, line + 1) ? '' : '\n';

  return {
    from: { line, ch: replaceLine ? 0 : lineText.length },
    to: { line, ch: lineText.length },
    text: (replaceLine ? '' : '\n\n') + quoteText + separator,
  };
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
      try {
        const quoteText = await generateBibleQuoteText(linkInfo.reference, settings, provider);
        if (quoteText) {
          quoteTexts.push(quoteText);
        } else {
          fetchFailed++;
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

  return { inserted, linksFound: links.length, fetchFailed };
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
    // The line is only replaced when every reference on it got its quote,
    // otherwise the references without one would be lost.
    const replaceLine =
      quoteTexts.length === linksOnTargetLine.length &&
      isLinkStandaloneOnLine(targetLineText, settings);

    editor.transaction({
      changes: [buildQuoteChange(editor, targetLineNumber, quoteTexts.join('\n\n'), replaceLine)],
    });
    return { inserted: true, alreadyExists: false, fetchFailed: false };
  }

  return { inserted: false, alreadyExists: false, fetchFailed: linksOnTargetLine.length > 0 };
}
