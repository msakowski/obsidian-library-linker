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

async function generateBibleQuoteText(
  linkInfo: JWLibraryLinkInfo,
  settings: LinkReplacerSettings,
  useWOL = false,
): Promise<string | null> {
  try {
    console.log('[generateBibleQuoteText] Starting for:', {
      url: linkInfo.url,
      reference: linkInfo.reference,
      language: settings.language,
      format: settings.bibleQuote.format,
      useWOL,
    });

    const result = await BibleTextFetcher.fetchBibleText(
      linkInfo.reference,
      settings.language,
      useWOL,
    );

    console.log('[generateBibleQuoteText] Fetch result:', {
      success: result.success,
      textLength: result.text?.length,
      text: result.text,
      error: result.error,
    });

    if (!result.success || !result.text) {
      console.error('[generateBibleQuoteText] Failed to fetch text:', result.error);
      return null;
    }

    const link = convertBibleTextToMarkdownLink(linkInfo.reference, settings);
    console.log('[generateBibleQuoteText] Generated link:', link);

    if (!link) {
      console.error('[generateBibleQuoteText] Failed to generate markdown link');
      return null;
    }

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
        replacementLines = [link, `> ${result.text}`];
    }

    const finalText = replacementLines.join('\n');
    console.log('[generateBibleQuoteText] Final quote text:', finalText);

    return finalText;
  } catch (error: unknown) {
    console.error(
      '[generateBibleQuoteText] Error:',
      error instanceof Error ? error.message : String(error),
      error,
    );
    return null;
  }
}

export async function insertAllBibleQuotes(
  editor: Editor,
  settings: LinkReplacerSettings,
  useWOL = false,
  selection?: ContentSelection,
): Promise<number> {
  console.log('[insertAllBibleQuotes] Starting with selection:', selection);

  const links = findJWLibraryLinks(editor, selection);

  console.log('[insertAllBibleQuotes] Found links:', {
    count: links.length,
    links: links.map((l) => ({ url: l.url, lineNumber: l.lineNumber })),
  });

  if (links.length === 0) {
    console.log('[insertAllBibleQuotes] No links found');
    return 0;
  }

  const changes: Array<{
    from: { line: number; ch: number };
    to: { line: number; ch: number };
    text: string;
  }> = [];

  // Process links in reverse order to maintain line numbers
  for (let i = links.length - 1; i >= 0; i--) {
    const linkInfo = links[i];

    console.log(`[insertAllBibleQuotes] Processing link ${i}/${links.length - 1}:`, {
      lineNumber: linkInfo.lineNumber,
      url: linkInfo.url,
    });

    if (linkInfo.lineNumber > editor.lastLine()) {
      console.log(`[insertAllBibleQuotes] Skipping link ${i} - line number exceeds editor range`);
      continue;
    }

    const currentLine = editor.getLine(linkInfo.lineNumber);
    const nextLine =
      linkInfo.lineNumber < editor.lastLine() ? editor.getLine(linkInfo.lineNumber + 1) : '';

    console.log(`[insertAllBibleQuotes] Link ${i} context:`, {
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
      console.log(`[insertAllBibleQuotes] Skipping link ${i} - quote already exists`);
      continue;
    }

    try {
      const quoteText = await generateBibleQuoteText(linkInfo, settings, useWOL);
      console.log(`[insertAllBibleQuotes] Generated quote for link ${i}:`, quoteText);

      if (quoteText) {
        changes.push({
          from: { line: linkInfo.lineNumber, ch: 0 },
          to: { line: linkInfo.lineNumber, ch: currentLine.length },
          text: quoteText,
        });
        console.log(`[insertAllBibleQuotes] Added change for link ${i}`);
      } else {
        console.error(`[insertAllBibleQuotes] No quote text generated for link ${i}`);
      }
    } catch (error: unknown) {
      console.error(
        `[insertAllBibleQuotes] Error processing Bible quote for link ${i}:`,
        error instanceof Error ? error.message : String(error),
        error,
      );
      continue;
    }
  }

  console.log('[insertAllBibleQuotes] Total changes to apply:', changes.length);

  if (changes.length > 0) {
    console.log('[insertAllBibleQuotes] Applying transaction with changes:', changes);
    editor.transaction({ changes });
    console.log('[insertAllBibleQuotes] Transaction applied successfully');
  }

  return changes.length;
}

export async function insertBibleQuoteAtCursor(
  editor: Editor,
  settings: LinkReplacerSettings,
  useWOL = false,
): Promise<{ inserted: boolean; alreadyExists: boolean }> {
  const cursor = editor.getCursor();
  const cursorLine = cursor.line;

  console.log('[insertBibleQuoteAtCursor] Starting at cursor:', {
    line: cursorLine,
    ch: cursor.ch,
  });

  if (cursorLine > editor.lastLine()) {
    console.log('[insertBibleQuoteAtCursor] Cursor line exceeds editor range');
    return { inserted: false, alreadyExists: false };
  }

  const line = editor.getLine(cursorLine);
  console.log('[insertBibleQuoteAtCursor] Current line:', line);

  const jwLibraryRegex = /jwlibrary:\/\/\/finder\?bible=\d{8}(?:-\d{8})?(?:&[^)\s]*)?/g;
  let match;

  // Find the first JW Library link on the cursor line
  while ((match = jwLibraryRegex.exec(line)) !== null) {
    console.log('[insertBibleQuoteAtCursor] Found JW Library link:', match[0]);

    const reference = parseJWLibraryLink(match[0]);
    console.log('[insertBibleQuoteAtCursor] Parsed reference:', reference);

    if (reference) {
      const linkInfo: JWLibraryLinkInfo = {
        url: match[0],
        reference,
        lineNumber: cursorLine,
        lineText: line,
      };

      const currentLine = editor.getLine(cursorLine);
      const nextLine = cursorLine < editor.lastLine() ? editor.getLine(cursorLine + 1) : '';

      console.log('[insertBibleQuoteAtCursor] Line context:', {
        currentLine,
        nextLine,
      });

      // Skip if already formatted as callout or if next line is a quote
      if (
        currentLine &&
        currentLine.trim().startsWith('>') &&
        nextLine &&
        nextLine.trim().startsWith('>')
      ) {
        console.log('[insertBibleQuoteAtCursor] Quote already exists');
        return { inserted: false, alreadyExists: true };
      }

      const quoteText = await generateBibleQuoteText(linkInfo, settings, useWOL);
      console.log('[insertBibleQuoteAtCursor] Generated quote text:', quoteText);

      if (quoteText) {
        console.log('[insertBibleQuoteAtCursor] Applying transaction');
        editor.transaction({
          changes: [
            {
              from: { line: cursorLine, ch: 0 },
              to: { line: cursorLine, ch: currentLine.length },
              text: quoteText,
            },
          ],
        });
        console.log('[insertBibleQuoteAtCursor] Transaction applied successfully');
        return { inserted: true, alreadyExists: false };
      } else {
        console.error('[insertBibleQuoteAtCursor] No quote text generated');
      }
    }
  }

  console.log('[insertBibleQuoteAtCursor] No JW Library link found on line');
  return { inserted: false, alreadyExists: false };
}
