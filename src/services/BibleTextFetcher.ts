import type { BibleReference, Language } from '@/types';
import { padBook, padChapter, padVerse } from '@/utils/padNumber';
import { requestUrl } from 'obsidian';
import { cleanHtmlText } from '@/utils/cleanHtmlText';
import { logger } from '@/utils/logger';

export interface BibleTextResult {
  text: string;
  citation: string;
  success: boolean;
  error?: string;
}

export class BibleTextFetcher {
  private static readonly JW_ORG_BASE = 'https://www.jw.org/finder?bible=';
  private static readonly WOL_BASE = 'https://wol.jw.org/en/wol/b/r1/lp-e/';

  static async fetchBibleText(
    reference: BibleReference,
    language: Language = 'E',
    useWOL = false,
  ): Promise<BibleTextResult> {
    logger.log('fetchBibleText', reference, language);
    try {
      const { book, chapter, verseRanges } = reference;

      if (!verseRanges || verseRanges.length === 0) {
        return {
          text: '',
          citation: '',
          success: false,
          error: 'Invalid verse ranges',
        };
      }

      // Format the Bible reference for the URL
      const bibleCode = this.formatBibleCode(
        book,
        chapter,
        verseRanges[0].start,
        verseRanges[0].end,
      );

      // Choose the appropriate URL based on preference
      const url = useWOL
        ? this.buildWOLUrl(bibleCode, language)
        : this.buildJWOrgUrl(bibleCode, language);

      logger.log('url', url);

      // Fetch the content using Obsidian's requestUrl (no CORS restrictions in Electron)
      const response = await requestUrl({ url });

      logger.log('response', response);

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.status}`);
      }

      const html = response.text;
      const result = this.extractBibleText(html, reference);

      return {
        ...result,
        success: true,
      };
    } catch (error) {
      return {
        text: '',
        citation: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private static formatBibleCode(
    book: number,
    chapter: number,
    startVerse: number,
    endVerse?: number,
  ): string {
    const paddedBook = padBook(book);
    const paddedChapter = padChapter(chapter);
    const paddedStart = padVerse(startVerse);

    if (endVerse && endVerse !== startVerse) {
      const paddedEnd = padVerse(endVerse);
      return `${paddedBook}${paddedChapter}${paddedStart}-${paddedBook}${paddedChapter}${paddedEnd}`;
    }

    return `${paddedBook}${paddedChapter}${paddedStart}`;
  }

  private static buildJWOrgUrl(bibleCode: string, language: Language): string {
    const langParam = language !== 'E' ? `&wtlocale=${language}` : '';
    return `${this.JW_ORG_BASE}${bibleCode}${langParam}`;
  }

  private static buildWOLUrl(bibleCode: string, language: Language): string {
    const langCode = `lp-${language.toLowerCase()}`;
    return `${this.WOL_BASE}${langCode}/nwt/${bibleCode}`;
  }

  private static extractBibleText(
    html: string,
    reference: BibleReference,
  ): { text: string; citation: string } {
    const { book, chapter, verseRanges } = reference;

    if (!verseRanges || verseRanges.length === 0) {
      return {
        text: 'Unable to extract Bible text - no verse ranges',
        citation: this.generateCitation(reference),
      };
    }

    const { start, end } = verseRanges[0];

    const doc = new DOMParser().parseFromString(html, 'text/html');

    // Build verse ID used in the HTML (unpadded book number)
    const buildVerseId = (verse: number) => `v${book}${padChapter(chapter)}${padVerse(verse)}`;

    // Collect text from target verses
    const textParts: string[] = [];

    for (let v = start; v <= end; v++) {
      const verseId = buildVerseId(v);
      const verseSpan = doc.getElementById(verseId);

      if (!verseSpan) continue;

      // Clone the verse element so we can modify it without affecting the original
      const clone = verseSpan.cloneNode(true) as HTMLElement;

      // Remove footnote links
      clone.querySelectorAll('a.footnoteLink, a.xrefLink').forEach((el) => el.remove());

      // Remove study note sections
      clone.querySelectorAll('.studyBible, .study-notes, .notes').forEach((el) => el.remove());

      // Remove verse number elements (chapterNum span and verseNum sup)
      clone.querySelectorAll('.chapterNum, .verseNum').forEach((el) => el.remove());

      const rawText = cleanHtmlText(clone.innerHTML).trim();
      if (rawText) {
        textParts.push(rawText);
      }
    }

    const extractedText = textParts.join(' ');
    const citation = this.generateCitation(reference);

    return {
      text: extractedText || 'Unable to extract Bible text',
      citation,
    };
  }

  private static generateCitation(reference: BibleReference): string {
    // This would need to be enhanced to generate proper book names
    // For now, return a simple format
    const { book, chapter, verseRanges } = reference;

    if (!verseRanges || verseRanges.length === 0) {
      return `Book ${book}:${chapter}`;
    }

    const { start, end } = verseRanges[0];
    const verseText = start === end ? `${start}` : `${start}-${end}`;

    return `Book ${book}:${chapter}:${verseText}`;
  }
}
