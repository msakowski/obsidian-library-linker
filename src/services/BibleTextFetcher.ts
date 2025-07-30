import type { BibleReference, Language } from '@/types';
import { padBook, padBookForVerseId, padChapter, padVerse } from '@/utils/padNumber';
import { requestUrl } from 'obsidian';

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

      // Fetch the content using Obsidian's requestUrl to avoid CORS issues
      const response = await requestUrl({
        url,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          DNT: '1',
          Connection: 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      });
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
    let extractedText = '';

    // Extract the body content where the actual Bible text should be
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
    const searchContent = bodyMatch ? bodyMatch[1] : html;

    // Build the verse IDs for extraction (HTML uses unpadded book numbers)
    const paddedBookForVerseId = padBookForVerseId(book);
    const paddedChapter = padChapter(chapter);
    const startVerseId = `v${paddedBookForVerseId}${paddedChapter}${padVerse(start)}`;

    if (start === end) {
      // Single verse extraction

      // Pattern: extract from verse anchor until next verse anchor or footnotes/study sections
      const singleVersePattern = new RegExp(
        `data-anchor='#${startVerseId}'>${start}\\s*</a></(?:span|sup)>\\s*([\\s\\S]*?)` +
          `(?=\\s*<a[^>]*data-anchor='#v\\d+'|\\s*<(?:h[1-6]|div[^>]*class="[^"]*(?:footnotes|studyBible|study-notes|notes)[^"]*"|p[^>]*class="[^"]*(?:footnotes|studyBible|study-notes|notes)[^"]*")|$)`,
        'i',
      );

      const match = searchContent.match(singleVersePattern);

      if (match && match[1]) {
        // Clean up study notes and footnotes after extracting the full content
        const cleanedText = this.cleanStudyNotes(match[1]);
        extractedText = this.cleanHtmlText(cleanedText).trim();
      } else {
      }
    } else {
      // Verse range extraction

      // Pattern: extract from start verse until after end verse, but stop before footnotes/study sections
      const rangePattern = new RegExp(
        `data-anchor='#${startVerseId}'>${start}\\s*</a></(?:span|sup)>\\s*([\\s\\S]*?)` +
          `(?=\\s*<a[^>]*data-anchor='#v\\d+'>${end + 1}\\s*</a>|\\s*<(?:h[1-6]|div[^>]*class="[^"]*(?:footnotes|studyBible|study-notes|notes)[^"]*"|p[^>]*class="[^"]*(?:footnotes|studyBible|study-notes|notes)[^"]*")|$)`,
        'i',
      );

      const match = searchContent.match(rangePattern);

      if (match && match[1]) {
        // Clean up study notes and footnotes after extracting the full content
        const cleanedText = this.cleanStudyNotes(match[1]);
        extractedText = this.cleanHtmlText(cleanedText).trim();
      } else {
      }
    }

    // Generate citation
    const citation = this.generateCitation(reference);

    return {
      text: extractedText || 'Unable to extract Bible text',
      citation,
    };
  }

  private static cleanStudyNotes(text: string): string {
    return (
      text
        // Remove footnote links and their content (pattern-based)
        .replace(/<a[^>]*class="footnoteLink"[^>]*>[\s\S]*?<\/a>/gi, '')
        // Remove study note sections (pattern-based)
        .replace(/<div[^>]*class="studyBible"[^>]*>[\s\S]*?<\/div>/gi, '')
        // Remove content starting with footnote markers (^ symbol pattern)
        .replace(/\s*\^[\s\S]*$/i, '')
        // Remove any remaining footnote markers
        .replace(/\+/g, '') // Remove + symbols
        .replace(/\*/g, '') // Remove * symbols
        // Remove incomplete HTML tags at the very end only
        .replace(/<[a-zA-Z][^>]*$/g, '')
        // Clean up excessive whitespace
        .replace(/\s+/g, ' ')
        .trim()
    );
  }

  private static cleanHtmlText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Remove &lt; and &gt; entities instead of decoding them to prevent HTML injection
      .replace(/&lt;/g, '')
      .replace(/&gt;/g, '')
      .replace(/&amp;/g, '&') // Replace HTML entities (ampersand last)
      .replace(/\+/g, '') // Remove footnote markers
      .replace(/\*/g, '') // Remove asterisk markers
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
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
