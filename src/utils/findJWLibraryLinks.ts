import type { Editor } from 'obsidian';
import type { BibleReference } from '@/types';

export interface JWLibraryLinkInfo {
  url: string;
  reference: BibleReference;
  lineNumber: number;
  lineText: string;
}

export interface ContentSelection {
  text: string;
  startLine: number;
  endLine: number;
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

export function findJWLibraryLinks(
  editor: Editor,
  selection?: ContentSelection,
): JWLibraryLinkInfo[] {
  const links: JWLibraryLinkInfo[] = [];

  // Determine which lines to search
  const startLine = selection ? selection.startLine : 0;
  const endLine = selection ? Math.min(selection.endLine, editor.lastLine()) : editor.lastLine();

  for (let i = startLine; i <= endLine; i++) {
    const line = editor.getLine(i);
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
