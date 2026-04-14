import { Editor } from 'obsidian';
import { BibleTextFetcher } from '@/services/BibleTextFetcher';
import { convertBibleTextToMarkdownLink } from '@/utils/convertBibleTextToMarkdownLink';
import { formatBibleText } from '@/utils/formatBibleText';
import type { LinkReplacerSettings } from '@/types';
import {
  findJWLibraryLinks,
  findJWLibraryLinksInLine,
  parseJWLibraryLink,
  type JWLibraryLinkInfo,
  type ContentSelection,
} from '@/utils/findJWLibraryLinks';
import { logger } from '@/utils/logger';

export type { JWLibraryLinkInfo, ContentSelection };

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

async function generateBibleQuoteText(
  linkInfo: JWLibraryLinkInfo,
  settings: LinkReplacerSettings,
): Promise<string | null> {
  try {
    logger.log('generateBibleQuoteText: fetching text for', linkInfo.reference);
    const result = await BibleTextFetcher.fetchBibleText(linkInfo.reference, settings.language);

    if (!result.success || !result.text) {
      logger.warn(
        'generateBibleQuoteText: fetch failed —',
        result.error ?? 'empty text',
        'success:',
        result.success,
      );
      return null;
    }

    logger.log('generateBibleQuoteText: fetched text length:', result.text.length);

    const bibleRefLinked = convertBibleTextToMarkdownLink(linkInfo.reference, settings);
    if (!bibleRefLinked) {
      logger.warn('generateBibleQuoteText: convertBibleTextToMarkdownLink returned falsy');
      return null;
    }

    const bibleRef = formatBibleText(linkInfo.reference, settings.bookLength, settings.language);

    const processed = processTemplate(settings.bibleQuote.template, {
      bibleRef,
      bibleRefLinked,
      quote: result.text,
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

export interface InsertQuotesResult {
  inserted: number;
  linksFound: number;
  fetchFailed: number;
}

export async function insertAllBibleQuotes(
  editor: Editor,
  settings: LinkReplacerSettings,
  _useWOL = false,
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
      const quoteText = await generateBibleQuoteText(linkInfo, settings);
      if (quoteText) {
        changes.push({
          from: { line: linkInfo.lineNumber, ch: 0 },
          to: { line: linkInfo.lineNumber, ch: currentLine.length },
          text: quoteText,
        });
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
      const quoteText = await generateBibleQuoteText(
        {
          ...linkInfo,
          reference,
        },
        settings,
      );
      if (quoteText) {
        quoteTexts.push(quoteText);
      }
    }
  }

  if (quoteTexts.length > 0) {
    const combinedText = quoteTexts.join('\n\n');
    editor.transaction({
      changes: [
        {
          from: { line: targetLineNumber, ch: 0 },
          to: { line: targetLineNumber, ch: targetLineText.length },
          text: combinedText,
        },
      ],
    });
    return { inserted: true, alreadyExists: false, fetchFailed: false };
  }

  return { inserted: false, alreadyExists: false, fetchFailed: linksOnTargetLine.length > 0 };
}
