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
    const result = await BibleTextFetcher.fetchBibleText(
      linkInfo.reference,
      settings.language,
      useWOL,
    );

    if (!result.success || !result.text) {
      return null;
    }

    const link = convertBibleTextToMarkdownLink(linkInfo.reference, settings);
    if (!link) {
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

    return replacementLines.join('\n');
  } catch (error: unknown) {
    console.error(
      'Error generating Bible quote:',
      error instanceof Error ? error.message : String(error),
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
  const links = findJWLibraryLinks(editor, selection);

  if (links.length === 0) {
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
      continue;
    }

    try {
      const quoteText = await generateBibleQuoteText(linkInfo, settings, useWOL);
      if (quoteText) {
        changes.push({
          from: { line: linkInfo.lineNumber, ch: 0 },
          to: { line: linkInfo.lineNumber, ch: currentLine.length },
          text: quoteText,
        });
      }
    } catch (error: unknown) {
      console.error(
        `Error processing Bible quote for link ${i}:`,
        error instanceof Error ? error.message : String(error),
      );
      continue;
    }
  }

  if (changes.length > 0) {
    editor.transaction({ changes });
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

  if (cursorLine > editor.lastLine()) {
    return { inserted: false, alreadyExists: false };
  }

  const line = editor.getLine(cursorLine);
  const jwLibraryRegex = /jwlibrary:\/\/\/finder\?bible=\d{8}(?:-\d{8})?(?:&[^)\s]*)?/g;
  let match;

  // Find the first JW Library link on the cursor line
  while ((match = jwLibraryRegex.exec(line)) !== null) {
    const reference = parseJWLibraryLink(match[0]);
    if (reference) {
      const linkInfo: JWLibraryLinkInfo = {
        url: match[0],
        reference,
        lineNumber: cursorLine,
        lineText: line,
      };

      const currentLine = editor.getLine(cursorLine);
      const nextLine = cursorLine < editor.lastLine() ? editor.getLine(cursorLine + 1) : '';

      // Skip if already formatted as callout or if next line is a quote
      if (
        currentLine &&
        currentLine.trim().startsWith('>') &&
        nextLine &&
        nextLine.trim().startsWith('>')
      ) {
        return { inserted: false, alreadyExists: true };
      }

      const quoteText = await generateBibleQuoteText(linkInfo, settings, useWOL);
      if (quoteText) {
        editor.transaction({
          changes: [
            {
              from: { line: cursorLine, ch: 0 },
              to: { line: cursorLine, ch: currentLine.length },
              text: quoteText,
            },
          ],
        });
        return { inserted: true, alreadyExists: false };
      }
    }
  }

  return { inserted: false, alreadyExists: false };
}
