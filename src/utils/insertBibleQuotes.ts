import { BibleTextFetcher } from '@/services/BibleTextFetcher';
import { convertBibleTextToMarkdownLink } from '@/utils/convertBibleTextToMarkdownLink';
import type { BibleReference, Language, LinkReplacerSettings } from '@/types';

export interface JWLibraryLinkInfo {
  url: string;
  reference: BibleReference;
  lineNumber: number;
  lineText: string;
}

export function parseJWLibraryLink(url: string): BibleReference | null {
  // Parse jwlibrary:///finder?bible={bookChapterVerse} format
  const match = url.match(/jwlibrary:\/\/\/finder\?bible=(\d{8}(?:-\d{8})?)(?:&|$)/);
  if (!match) return null;

  const bibleCode = match[1];

  // Handle range format (e.g., 40005003-40005005)
  if (bibleCode.includes('-')) {
    const [start, end] = bibleCode.split('-');
    const startRef = parseSingleBibleCode(start);
    const endRef = parseSingleBibleCode(end);

    if (!startRef || !endRef) return null;

    return {
      book: startRef.book,
      chapter: startRef.chapter,
      verseRanges: [
        {
          start: startRef.verseRanges![0].start,
          end: endRef.verseRanges![0].start,
        },
      ],
    };
  }

  return parseSingleBibleCode(bibleCode);
}

function parseSingleBibleCode(code: string): BibleReference | null {
  if (code.length !== 8) return null;

  const book = parseInt(code.substring(0, 2), 10);
  const chapter = parseInt(code.substring(2, 5), 10);
  const verse = parseInt(code.substring(5, 8), 10);

  if (isNaN(book) || isNaN(chapter) || isNaN(verse)) return null;

  return {
    book,
    chapter,
    verseRanges: [{ start: verse, end: verse }],
  };
}

export interface ContentSelection {
  text: string;
  startLine: number;
  endLine: number;
}

export function findJWLibraryLinks(
  content: string,
  selection?: ContentSelection,
): JWLibraryLinkInfo[] {
  const lines = content.split('\n');
  const links: JWLibraryLinkInfo[] = [];

  // Determine which lines to search
  const startLine = selection ? selection.startLine : 0;
  const endLine = selection ? Math.min(selection.endLine, lines.length - 1) : lines.length - 1;

  for (let i = startLine; i <= endLine; i++) {
    const line = lines[i];
    const jwLibraryRegex = /jwlibrary:\/\/\/finder\?bible=\d{8}(?:-\d{8})?(?:&[^)\s]*)?/g;
    let match;

    while ((match = jwLibraryRegex.exec(line)) !== null) {
      const reference = parseJWLibraryLink(match[0]);
      if (reference) {
        links.push({
          url: match[0],
          reference,
          lineNumber: i,
          lineText: line,
        });
      }
    }
  }

  return links;
}

export async function insertBibleQuote(
  content: string,
  linkInfo: JWLibraryLinkInfo,
  settings: LinkReplacerSettings,
  useWOL = false,
): Promise<string> {
  try {
    const result = await BibleTextFetcher.fetchBibleText(linkInfo.reference, settings.language, useWOL);

    if (!result.success || !result.text) {
      return content; // Return original content if fetching failed
    }

    const lines = content.split('\n');
    const { lineNumber, lineText } = linkInfo;

    // Generate the formatted link
    const link = convertBibleTextToMarkdownLink(linkInfo.reference, settings);
    if (!link) {
      return content; // Return original content if link generation failed
    }

    // Create the formatted quote based on settings
    let replacementLines: string[] = [];
    
    switch (settings.bibleQuote.format) {
      case 'short':
        replacementLines = [
          link,
          `> ${result.text}`
        ];
        break;
      case 'long-foldable':
        replacementLines = [
          `> [!${settings.bibleQuote.calloutType}]- ${link}`,
          `> ${result.text}`
        ];
        break;
      case 'long-expanded':
        replacementLines = [
          `> [!${settings.bibleQuote.calloutType}] ${link}`,
          `> ${result.text}`
        ];
        break;
      default:
        replacementLines = [
          link,
          `> ${result.text}`
        ];
    }

    // Replace the original link line with the formatted quote
    lines.splice(lineNumber, 1, ...replacementLines);

    return lines.join('\n');
  } catch (error) {
    console.error('Error inserting Bible quote:', error);
    return content; // Return original content on error
  }
}

export async function insertAllBibleQuotes(
  content: string,
  settings: LinkReplacerSettings,
  useWOL = false,
  selection?: ContentSelection,
): Promise<string> {
  const links = findJWLibraryLinks(content, selection);

  if (links.length === 0) {
    return content;
  }

  let updatedContent = content;

  // Process links in reverse order to maintain line numbers
  for (let i = links.length - 1; i >= 0; i--) {
    const linkInfo = links[i];

    // Check if quote already exists (simple check for quote marker on next line)
    const lines = updatedContent.split('\n');
    if (linkInfo.lineNumber >= lines.length) {
      continue;
    }

    const currentLine = lines[linkInfo.lineNumber];
    const nextLine = lines[linkInfo.lineNumber + 1];

    // Skip if quote already exists
    if (currentLine && currentLine.trim().startsWith('>') && (nextLine && nextLine.trim().startsWith('>'))) {
      continue;
    }

    try {
      updatedContent = await insertBibleQuote(updatedContent, linkInfo, settings, useWOL);

      // Update line numbers for remaining links
      // We replace 1 line with 2 lines, so net +1 line
      const netLinesAdded = 1;
      for (let j = i - 1; j >= 0; j--) {
        if (links[j].lineNumber > linkInfo.lineNumber) {
          links[j].lineNumber += netLinesAdded;
        }
      }
    } catch (error) {
      console.error(`Error processing Bible quote for link ${i}:`, error);
      continue;
    }
  }

  return updatedContent;
}

export async function insertBibleQuoteAtCursor(
  content: string,
  cursorLine: number,
  settings: LinkReplacerSettings,
  useWOL = false,
): Promise<{ content: string; found: boolean }> {
  const lines = content.split('\n');

  if (cursorLine >= lines.length) {
    return { content, found: false };
  }

  const line = lines[cursorLine];
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

      // Check if quote already exists (look for various quote formats)
      const currentLine = lines[cursorLine];
      const nextLine = lines[cursorLine + 1];
      
      // Skip if already formatted as callout or if next line is a quote
      if (currentLine && currentLine.trim().startsWith('>') && (nextLine && nextLine.trim().startsWith('>'))) {
        return { content, found: true }; // Quote already exists
      }

      const updatedContent = await insertBibleQuote(content, linkInfo, settings, useWOL);
      return { content: updatedContent, found: true };
    }
  }

  return { content, found: false };
}
