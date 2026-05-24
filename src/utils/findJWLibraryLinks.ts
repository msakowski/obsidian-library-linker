import type { Editor } from 'obsidian';
import type { BibleReference } from '@/types';
import { logger } from './logger';

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

interface BibleCodeParts {
  book: number;
  chapter: number;
  verse: number;
}

function parseSingleBibleCode(code: string): BibleCodeParts | null {
  if (code.length !== 8) return null;

  const book = parseInt(code.substring(0, 2), 10);
  const chapter = parseInt(code.substring(2, 5), 10);
  const verse = parseInt(code.substring(5, 8), 10);

  if (isNaN(book) || isNaN(chapter) || isNaN(verse)) return null;

  return { book, chapter, verse };
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

    if (startRef.chapter !== endRef.chapter) {
      return {
        book: startRef.book,
        ranges: [
          {
            chapterStart: startRef.chapter,
            chapterEnd: endRef.chapter,
            verseStart: startRef.verse,
            verseEnd: endRef.verse,
          },
        ],
      };
    }

    if (startRef.verse === endRef.verse) {
      return {
        book: startRef.book,
        ranges: [{ chapterStart: startRef.chapter, verseStart: startRef.verse }],
      };
    }

    return {
      book: startRef.book,
      ranges: [
        {
          chapterStart: startRef.chapter,
          verseStart: startRef.verse,
          verseEnd: endRef.verse,
        },
      ],
    };
  }

  const single = parseSingleBibleCode(bibleCode);
  if (!single) return null;

  return {
    book: single.book,
    ranges: [{ chapterStart: single.chapter, verseStart: single.verse }],
  };
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
    links.push(...findJWLibraryLinksInLine(line, i));
  }

  return links;
}

export function findJWLibraryLinksInLine(line: string, lineNumber: number): JWLibraryLinkInfo[] {
  const links: JWLibraryLinkInfo[] = [];
  const jwLibraryRegex = /jwlibrary:\/\/\/finder\?bible=\d{8}(?:-\d{8})?(?:&[^)\s]*)?/g;
  const matches = Array.from(line.matchAll(jwLibraryRegex));

  for (const match of matches) {
    logger.log('match', match);

    const reference = parseJWLibraryLink(match[0]);

    logger.log('reference', reference);
    if (reference) {
      links.push({
        url: match[0],
        reference,
        lineNumber,
        lineText: line,
      });
    }
  }

  return links;
}
