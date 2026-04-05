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
  private static readonly MIN_REQUEST_INTERVAL_MS = 800;
  private static readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  private static lastRequestTime = -Infinity;
  private static readonly chapterHtmlCache = new Map<string, { html: string; timestamp: number }>();

  /** Clears the chapter HTML cache and resets the throttle timer. */
  static clearCache(): void {
    this.chapterHtmlCache.clear();
    this.lastRequestTime = -Infinity;
  }

  private static async throttleRequest(): Promise<void> {
    const wait = this.MIN_REQUEST_INTERVAL_MS - (Date.now() - this.lastRequestTime);
    if (wait > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, wait));
    }
    this.lastRequestTime = Date.now();
  }

  private static getCachedHtml(cacheKey: string): string | null {
    const entry = this.chapterHtmlCache.get(cacheKey);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.CACHE_TTL_MS) {
      this.chapterHtmlCache.delete(cacheKey);
      return null;
    }
    return entry.html;
  }

  /**
   * Fetches the full chapter HTML, using a cache to avoid redundant requests.
   * Always requests verse 001 as the entry point — jw.org returns the full chapter HTML
   * regardless of which verse is requested. Throttles real HTTP requests to at most one
   * every 800 ms to avoid triggering jw.org rate limiting.
   */
  private static async fetchChapterHtml(
    book: number,
    chapter: number,
    language: Language,
    useWOL: boolean,
  ): Promise<string> {
    const paddedBook = padBook(book);
    const paddedChapter = padChapter(chapter);
    const cacheKey = `${useWOL ? 'wol' : 'jw'}:${language}:${paddedBook}${paddedChapter}`;

    const cached = this.getCachedHtml(cacheKey);
    if (cached) {
      logger.log('chapter cache hit', cacheKey);
      return cached;
    }

    await this.throttleRequest();

    // Re-check after the throttle wait — a concurrent request may have fetched and cached it
    const cachedAfterWait = this.getCachedHtml(cacheKey);
    if (cachedAfterWait) return cachedAfterWait;

    const chapterCode = `${paddedBook}${paddedChapter}001`;
    const url = useWOL
      ? this.buildWOLUrl(chapterCode, language)
      : this.buildJWOrgUrl(chapterCode, language);

    logger.log('fetching chapter', url);

    const response = await requestUrl({
      url,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        DNT: '1',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}`);
    }

    this.chapterHtmlCache.set(cacheKey, { html: response.text, timestamp: Date.now() });
    return response.text;
  }

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

      const html = await this.fetchChapterHtml(book, chapter, language, useWOL);
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
