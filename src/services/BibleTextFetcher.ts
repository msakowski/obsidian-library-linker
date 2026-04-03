import type { BibleReference, DesktopCitationMode, Language } from '@/types';
import type { App, WorkspaceLeaf } from 'obsidian';
import { padBook, padChapter, padVerse } from '@/utils/padNumber';
import { Platform, request } from 'obsidian';
import { cleanHtmlText } from '@/utils/cleanHtmlText';
import { logger } from '@/utils/logger';

export interface BibleTextResult {
  text: string;
  citation: string;
  success: boolean;
  error?: string;
}

interface CurlFetchResult {
  html: string;
  meta: {
    httpCode: string;
    effectiveUrl: string;
    contentType: string;
    timeTotalSeconds: number;
  };
}

interface WebviewElement extends HTMLElement {
  getURL?: () => string;
  executeJavaScript?: (code: string, userGesture?: boolean) => Promise<unknown>;
  isLoading?: () => boolean;
}

export class BibleTextFetcher {
  private static readonly JW_ORG_BASE = 'https://www.jw.org/finder?bible=';
  private static readonly WOL_BASE = 'https://wol.jw.org/en/wol/b/r1/';
  private static readonly CURL_META_MARKER = '__JWLINKER_CURL_META__';
  private static readonly WEBVIEWER_TIMEOUT_MS = 30000;
  private static app: App | null = null;

  static initialize(app: App): void {
    this.app = app;
  }

  static async fetchBibleText(
    reference: BibleReference,
    language: Language = 'E',
    useWOL = false,
    desktopCitationMode: DesktopCitationMode = 'backgroundRequest',
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

      const html = await this.fetchHtml(url, desktopCitationMode);
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

  /**
   * Fetches HTML from a URL.
   * Mobile uses Obsidian's request() directly.
   * Desktop uses either the webviewer or a background request, depending on settings.
   */
  private static async fetchHtml(
    url: string,
    desktopCitationMode: DesktopCitationMode,
  ): Promise<string> {
    if (!Platform.isDesktopApp) {
      return this.fetchWithRequest(url);
    }

    if (desktopCitationMode === 'webviewer' && this.app) {
      try {
        return await this.fetchWithWebviewer(url);
      } catch (error) {
        logger.warn(
          'fetchHtml: webviewer citation failed, using background request instead —',
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    return this.fetchWithCurl(url);
  }

  private static async fetchWithRequest(url: string): Promise<string> {
    const html = await request({ url, headers: { 'User-Agent': '' } });
    return html;
  }

  private static async fetchWithCurl(url: string): Promise<string> {
    try {
      const result = await this.fetchWithSystemCurl(url);
      logger.log(
        'fetchHtml: background request completed',
        `http=${result.meta.httpCode}`,
        `effectiveUrl=${result.meta.effectiveUrl}`,
        `contentType=${result.meta.contentType || 'unknown'}`,
        `curlTime=${Math.round(result.meta.timeTotalSeconds * 1000)}ms`,
        `bytes=${result.html.length}`,
      );
      return result.html;
    } catch (error) {
      const curlError = error instanceof Error ? error.message : String(error);
      throw new Error(`background request failed: ${curlError}`);
    }
  }

  private static async fetchWithWebviewer(url: string): Promise<string> {
    if (!this.app) {
      throw new Error('webviewer unavailable: app not initialized');
    }

    const previousLeaf = this.app.workspace.activeLeaf;
    const leaf = this.app.workspace.getLeaf('tab');

    try {
      await leaf.setViewState({
        type: 'webviewer',
        active: false,
        state: {
          url,
          title: url,
          mode: 'webview',
        },
      });

      if (leaf.isDeferred) {
        await leaf.loadIfDeferred();
      }

      await this.app.workspace.revealLeaf(leaf);

      const webview = await this.waitForWebviewElement(leaf);
      await this.waitForWebviewDomReady(webview);

      const html = await this.waitForWebviewerHtml(webview);
      return html;
    } finally {
      if (previousLeaf) {
        this.app.workspace.setActiveLeaf(previousLeaf, { focus: true });
      }
      leaf.detach();
    }
  }

  private static async waitForWebviewElement(leaf: WorkspaceLeaf): Promise<WebviewElement> {
    const deadline = Date.now() + this.WEBVIEWER_TIMEOUT_MS;

    while (Date.now() < deadline) {
      const webview = leaf.view.containerEl.querySelector('webview');
      if (webview instanceof HTMLElement) {
        return webview as WebviewElement;
      }
      await this.delay(100);
    }

    throw new Error('timed out waiting for webviewer element');
  }

  private static async waitForWebviewerHtml(webview: WebviewElement): Promise<string> {
    const deadline = Date.now() + this.WEBVIEWER_TIMEOUT_MS;

    while (Date.now() < deadline) {
      if (typeof webview.isLoading === 'function' && webview.isLoading()) {
        await this.delay(250);
        continue;
      }

      if (typeof webview.executeJavaScript !== 'function') {
        throw new Error('webviewer does not expose executeJavaScript');
      }

      const html = await webview.executeJavaScript('document.documentElement.outerHTML', true);
      if (typeof html === 'string' && html.length > 0) {
        return html;
      }

      await this.delay(250);
    }

    throw new Error('timed out waiting for webviewer HTML');
  }

  private static async waitForWebviewDomReady(webview: WebviewElement): Promise<void> {
    if (typeof webview.executeJavaScript !== 'function') {
      throw new Error('webviewer does not expose executeJavaScript');
    }

    try {
      await webview.executeJavaScript('document.readyState', true);
      return;
    } catch {
      // The webview is not ready yet. Fall through to the event-based wait.
    }

    await new Promise<void>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        cleanup();
        reject(new Error('timed out waiting for webviewer dom-ready'));
      }, this.WEBVIEWER_TIMEOUT_MS);

      const onDomReady = () => {
        cleanup();
        resolve();
      };

      const cleanup = () => {
        window.clearTimeout(timeoutId);
        webview.removeEventListener('dom-ready', onDomReady as EventListener);
      };

      webview.addEventListener('dom-ready', onDomReady as EventListener, { once: true });
    });
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  private static async fetchWithSystemCurl(url: string): Promise<CurlFetchResult> {
    // Dynamic require to avoid breaking module loading if child_process is unavailable
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { execFile } = require('child_process') as typeof import('child_process');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { promisify } = require('util') as typeof import('util');
    const execFileAsync = promisify(execFile);

    const { stdout } = await execFileAsync(
      'curl',
      [
        '-sS',
        '-L',
        '--compressed',
        '--max-time',
        '30',
        '--output',
        '-',
        '--write-out',
        `\n${this.CURL_META_MARKER}%{http_code}\t%{url_effective}\t%{content_type}\t%{time_total}`,
        url,
      ],
      { maxBuffer: 1024 * 1024 },
    );
    const markerIndex = stdout.lastIndexOf(`\n${this.CURL_META_MARKER}`);
    if (markerIndex === -1) {
      throw new Error('curl output missing metadata marker');
    }

    const html = stdout.slice(0, markerIndex);
    const metaLine = stdout.slice(markerIndex + 1).trim();
    const meta = this.parseCurlMeta(metaLine);

    if (!html) {
      throw new Error('curl returned empty response');
    }

    return { html, meta };
  }

  private static parseCurlMeta(metaLine: string): CurlFetchResult['meta'] {
    if (!metaLine.startsWith(this.CURL_META_MARKER)) {
      throw new Error(`invalid curl metadata: ${metaLine}`);
    }

    const [httpCode, effectiveUrl, contentType, timeTotal] = metaLine
      .slice(this.CURL_META_MARKER.length)
      .split('\t');

    return {
      httpCode: httpCode || '000',
      effectiveUrl: effectiveUrl || '',
      contentType: contentType || '',
      timeTotalSeconds: timeTotal ? Number(timeTotal) : 0,
    };
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
