import { Editor } from 'obsidian';
import { BibleTextFetcher } from '@/services/BibleTextFetcher';
import { convertBibleTextToMarkdownLink } from '@/utils/convertBibleTextToMarkdownLink';
import type { LinkReplacerSettings } from '@/types';
import {
  findJWLibraryLinks,
  parseJWLibraryLink,
  type JWLibraryLinkInfo,
  type ContentSelection,
} from '@/utils/findJWLibraryLinks';

export type { JWLibraryLinkInfo, ContentSelection };

// Debug flag - can be enabled for Android debugging via Chrome DevTools
const DEBUG_QUOTING = true;

function debugLog(message: string, data?: unknown): void {
  if (DEBUG_QUOTING) {
    const timestamp = new Date().toISOString();
    const platform = (window as { app?: { isMobile?: boolean } }).app?.isMobile
      ? 'Mobile'
      : 'Desktop';
    console.log(`[${timestamp}] [${platform}] [BibleQuotes] ${message}`, data ?? '');
  }
}

async function generateBibleQuoteText(
  linkInfo: JWLibraryLinkInfo,
  settings: LinkReplacerSettings,
  useWOL = false,
): Promise<string | null> {
  const startTime = performance.now();
  debugLog('generateBibleQuoteText started', {
    reference: linkInfo.reference,
    url: linkInfo.url,
    language: settings.language,
    useWOL,
    format: settings.bibleQuote.format,
  });

  try {
    debugLog('Fetching Bible text...');
    const result = await BibleTextFetcher.fetchBibleText(
      linkInfo.reference,
      settings.language,
      useWOL,
    );

    debugLog('Fetch result received', {
      success: result.success,
      textLength: result.text?.length ?? 0,
    });

    if (!result.success || !result.text) {
      debugLog('Fetch failed or no text returned');
      return null;
    }

    debugLog('Converting to markdown link...');
    const link = convertBibleTextToMarkdownLink(linkInfo.reference, settings);
    if (!link) {
      debugLog('Failed to convert to markdown link');
      return null;
    }

    debugLog('Link converted successfully', { link });

    let replacementLines: string[] = [];

    switch (settings.bibleQuote.format) {
      case 'short':
        replacementLines = [link, `> ${result.text}`];
        break;
      case 'long-foldable':
        replacementLines = [`> [!${settings.bibleQuote.calloutType}]- ${link}`, `> ${result.text}`];
        break;
      case 'long-expanded':
        replacementLines = [`> [!${settings.bibleQuote.calloutType}] ${link}`, `> ${result.text}`];
        break;
      default:
        debugLog('Using default format (unknown format specified)', {
          format: settings.bibleQuote.format,
        });
        replacementLines = [link, `> ${result.text}`];
    }

    const finalText = replacementLines.join('\n');
    const duration = performance.now() - startTime;
    debugLog('generateBibleQuoteText completed', {
      duration: `${duration.toFixed(2)}ms`,
      textLength: finalText.length,
    });

    return finalText;
  } catch (error: unknown) {
    const duration = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    debugLog('Error in generateBibleQuoteText', {
      error: errorMessage,
      stack: errorStack,
      duration: `${duration.toFixed(2)}ms`,
    });

    console.error('Error generating Bible quote:', errorMessage, errorStack);
    return null;
  }
}

export async function insertAllBibleQuotes(
  editor: Editor,
  settings: LinkReplacerSettings,
  useWOL = false,
  selection?: ContentSelection,
): Promise<number> {
  const startTime = performance.now();
  debugLog('insertAllBibleQuotes started', {
    useWOL,
    hasSelection: !!selection,
    selection,
    editorLineCount: editor.lastLine() + 1,
  });

  const links = findJWLibraryLinks(editor, selection);

  debugLog('Found JW Library links', {
    linkCount: links.length,
    links: links.map((l) => ({
      url: l.url,
      lineNumber: l.lineNumber,
      reference: l.reference,
    })),
  });

  if (links.length === 0) {
    debugLog('No links found, exiting');
    return 0;
  }

  const changes: Array<{
    from: { line: number; ch: number };
    to: { line: number; ch: number };
    text: string;
  }> = [];

  // Process links in reverse order to maintain line numbers
  debugLog('Processing links in reverse order...');
  for (let i = links.length - 1; i >= 0; i--) {
    const linkInfo = links[i];
    debugLog(`Processing link ${i + 1}/${links.length}`, {
      lineNumber: linkInfo.lineNumber,
      url: linkInfo.url,
    });

    if (linkInfo.lineNumber > editor.lastLine()) {
      debugLog(`Skipping link ${i}: line number ${linkInfo.lineNumber} exceeds editor last line ${editor.lastLine()}`);
      continue;
    }

    const currentLine = editor.getLine(linkInfo.lineNumber);
    const nextLine =
      linkInfo.lineNumber < editor.lastLine() ? editor.getLine(linkInfo.lineNumber + 1) : '';

    debugLog(`Link ${i} current line content`, {
      lineNumber: linkInfo.lineNumber,
      currentLine,
      nextLine,
    });

    // Skip if quote already exists
    if (
      currentLine &&
      currentLine.trim().startsWith('>') &&
      nextLine &&
      nextLine.trim().startsWith('>')
    ) {
      debugLog(`Skipping link ${i}: quote already exists`);
      continue;
    }

    try {
      const quoteText = await generateBibleQuoteText(linkInfo, settings, useWOL);
      if (quoteText) {
        debugLog(`Quote generated for link ${i}`, {
          from: { line: linkInfo.lineNumber, ch: 0 },
          to: { line: linkInfo.lineNumber, ch: currentLine.length },
          textPreview: quoteText.substring(0, 100),
        });
        changes.push({
          from: { line: linkInfo.lineNumber, ch: 0 },
          to: { line: linkInfo.lineNumber, ch: currentLine.length },
          text: quoteText,
        });
      } else {
        debugLog(`No quote text generated for link ${i}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      debugLog(`Error processing link ${i}`, {
        error: errorMessage,
        stack: errorStack,
      });
      console.error(`Error processing Bible quote for link ${i}:`, errorMessage, errorStack);
      continue;
    }
  }

  debugLog('Applying changes to editor', {
    changeCount: changes.length,
  });

  if (changes.length > 0) {
    editor.transaction({ changes });
  }

  const duration = performance.now() - startTime;
  debugLog('insertAllBibleQuotes completed', {
    changesApplied: changes.length,
    duration: `${duration.toFixed(2)}ms`,
  });

  return changes.length;
}

export async function insertBibleQuoteAtCursor(
  editor: Editor,
  settings: LinkReplacerSettings,
  useWOL = false,
): Promise<{ inserted: boolean; alreadyExists: boolean }> {
  const startTime = performance.now();
  const cursor = editor.getCursor();
  const cursorLine = cursor.line;

  debugLog('insertBibleQuoteAtCursor started', {
    cursor: { line: cursorLine, ch: cursor.ch },
    useWOL,
    editorLineCount: editor.lastLine() + 1,
  });

  if (cursorLine > editor.lastLine()) {
    debugLog('Cursor line exceeds editor last line');
    return { inserted: false, alreadyExists: false };
  }

  const line = editor.getLine(cursorLine);
  debugLog('Cursor line content', { cursorLine, line });

  const jwLibraryRegex = /jwlibrary:\/\/\/finder\?bible=\d{8}(?:-\d{8})?(?:&[^)\s]*)?/g;
  let match;
  let matchCount = 0;

  // Find the first JW Library link on the cursor line
  while ((match = jwLibraryRegex.exec(line)) !== null) {
    matchCount++;
    debugLog(`Found JW Library link match ${matchCount}`, {
      url: match[0],
      index: match.index,
    });

    const reference = parseJWLibraryLink(match[0]);
    if (reference) {
      debugLog('Parsed reference successfully', { reference });

      const linkInfo: JWLibraryLinkInfo = {
        url: match[0],
        reference,
        lineNumber: cursorLine,
        lineText: line,
      };

      const currentLine = editor.getLine(cursorLine);
      const nextLine = cursorLine < editor.lastLine() ? editor.getLine(cursorLine + 1) : '';

      debugLog('Checking if quote already exists', {
        currentLine,
        nextLine,
        currentLineStartsWithQuote: currentLine?.trim().startsWith('>'),
        nextLineStartsWithQuote: nextLine?.trim().startsWith('>'),
      });

      // Skip if already formatted as callout or if next line is a quote
      if (
        currentLine &&
        currentLine.trim().startsWith('>') &&
        nextLine &&
        nextLine.trim().startsWith('>')
      ) {
        const duration = performance.now() - startTime;
        debugLog('Quote already exists, skipping', {
          duration: `${duration.toFixed(2)}ms`,
        });
        return { inserted: false, alreadyExists: true };
      }

      debugLog('Generating quote text...');
      const quoteText = await generateBibleQuoteText(linkInfo, settings, useWOL);
      if (quoteText) {
        debugLog('Inserting quote into editor', {
          from: { line: cursorLine, ch: 0 },
          to: { line: cursorLine, ch: currentLine.length },
          textPreview: quoteText.substring(0, 100),
        });

        editor.transaction({
          changes: [
            {
              from: { line: cursorLine, ch: 0 },
              to: { line: cursorLine, ch: currentLine.length },
              text: quoteText,
            },
          ],
        });

        const duration = performance.now() - startTime;
        debugLog('insertBibleQuoteAtCursor completed successfully', {
          duration: `${duration.toFixed(2)}ms`,
        });
        return { inserted: true, alreadyExists: false };
      } else {
        debugLog('Failed to generate quote text');
      }
    } else {
      debugLog('Failed to parse reference from link', { url: match[0] });
    }
  }

  const duration = performance.now() - startTime;
  debugLog('insertBibleQuoteAtCursor completed - no links found or processed', {
    matchCount,
    duration: `${duration.toFixed(2)}ms`,
  });

  return { inserted: false, alreadyExists: false };
}
