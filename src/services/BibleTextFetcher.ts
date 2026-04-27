import type { BibleReference, Language } from '@/types';
import type { App, WorkspaceLeaf } from 'obsidian';
import { padChapter, padVerse } from '@/utils/padNumber';
import { Platform, requestUrl } from 'obsidian';
import { cleanHtmlText } from '@/utils/cleanHtmlText';
import { logger } from '@/utils/logger';
import { LANGUAGES } from '@/consts/languages';

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

interface WOLLangConfig {
  region: string;
  lp: string;
}

// TODO: move region/lp into LanguageInfo (languages.json) so adding a language requires one less change
const WOL_LANG_CONFIG: Record<string, WOLLangConfig> = {
  E: { region: 'r1', lp: 'lp-e' },
  X: { region: 'r10', lp: 'lp-x' },
  FI: { region: 'r16', lp: 'lp-fi' },
  O: { region: 'r18', lp: 'lp-o' },
  S: { region: 'r4', lp: 'lp-s' },
  F: { region: 'r30', lp: 'lp-f' },
  KO: { region: 'r8', lp: 'lp-ko' },
  TPO: { region: 'r5', lp: 'lp-t' },
  C: { region: 'r19', lp: 'lp-c' },
  VT: { region: 'r47', lp: 'lp-vt' },
};

export class BibleTextFetcher {
  private static readonly WOL_BASE = 'https://wol.jw.org';
  private static readonly CURL_META_MARKER = '__JWLINKER_CURL_META__';
  private static readonly WEBVIEWER_TIMEOUT_MS = 30000;
  private static readonly MIN_REQUEST_INTERVAL_MS = 800;
  private static readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
  private static app: App | null = null;
  private static lastRequestTime = -Infinity;
  private static readonly chapterHtmlCache = new Map<string, { html: string; timestamp: number }>();
  private static curlAvailable: boolean | null = null; // null = untested

  static initialize(app: App): void {
    this.app = app;
  }

  static clearCache(): void {
    this.chapterHtmlCache.clear();
    this.lastRequestTime = -Infinity;
    this.curlAvailable = null;
  }

  static async fetchBibleText(
    reference: BibleReference,
    language: Language = 'E',
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

      const html = await this.fetchChapterHtml(book, chapter, language);
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

  /**
   * Fetches full chapter HTML, using a cache to avoid redundant requests.
   * WOL returns the full chapter regardless of which verse is in the URL,
   * so we cache by language + book + chapter. Consecutive requests to different
   * chapters are throttled to at most one every 800ms.
   */
  private static async fetchChapterHtml(
    book: number,
    chapter: number,
    language: Language,
  ): Promise<string> {
    const cacheKey = `${language}:${book}:${chapter}`;

    const cached = this.getCachedHtml(cacheKey);
    if (cached) {
      logger.log('chapter cache hit', cacheKey);
      return cached;
    }

    await this.throttle();

    // Re-check after throttle — a concurrent request may have populated the cache
    const cachedAfterWait = this.getCachedHtml(cacheKey);
    if (cachedAfterWait) return cachedAfterWait;

    const url = this.buildWOLUrl(book, chapter, language);
    logger.log('fetching chapter', url);

    const html = await this.fetchHtml(url);
    this.chapterHtmlCache.set(cacheKey, { html, timestamp: Date.now() });
    return html;
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

  private static async throttle(): Promise<void> {
    const wait = this.MIN_REQUEST_INTERVAL_MS - (Date.now() - this.lastRequestTime);
    if (wait > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, wait));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Fetches HTML from a WOL URL with automatic fallback.
   *
   * All platforms: try requestUrl first.
   * Desktop fallback chain: curl (if available) → webviewer (if registered).
   * Mobile: no fallback — requestUrl is the only path.
   */
  private static async fetchHtml(url: string): Promise<string> {
    try {
      const response = await requestUrl({ url });
      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.text;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn('fetchHtml: requestUrl failed —', message);

      if (!Platform.isDesktopApp) {
        throw error;
      }

      // Desktop fallback 1: curl
      if (this.curlAvailable !== false) {
        try {
          const html = await this.fetchWithCurl(url);
          this.curlAvailable = true;
          return html;
        } catch (curlError) {
          const curlMsg = curlError instanceof Error ? curlError.message : String(curlError);
          if (curlMsg.includes('ENOENT')) {
            logger.warn('fetchHtml: curl not available, skipping for future requests');
            this.curlAvailable = false;
          } else {
            logger.warn('fetchHtml: curl failed —', curlMsg);
          }
        }
      }

      // Desktop fallback 2: webviewer
      if (this.isWebviewerAvailable()) {
        try {
          return await this.fetchWithWebviewer(url);
        } catch (webviewError) {
          logger.warn(
            'fetchHtml: webviewer failed —',
            webviewError instanceof Error ? webviewError.message : String(webviewError),
          );
        }
      }

      throw new Error(`All fetch methods failed for ${url}`);
    }
  }

  private static isWebviewerAvailable(): boolean {
    if (!this.app) return false;
    // Check if the webviewer view type is registered in Obsidian
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    const viewByType = (this.app as any).viewRegistry?.viewByType as
      | Record<string, unknown>
      | undefined;
    return viewByType?.['webviewer'] !== undefined;
  }

  private static async fetchWithCurl(url: string): Promise<string> {
    const result = await this.fetchWithSystemCurl(url);
    logger.log(
      'fetchHtml: curl completed',
      `http=${result.meta.httpCode}`,
      `curlTime=${Math.round(result.meta.timeTotalSeconds * 1000)}ms`,
      `bytes=${result.html.length}`,
    );
    return result.html;
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
        return webview;
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
        webview.removeEventListener('dom-ready', onDomReady);
      };

      webview.addEventListener('dom-ready', onDomReady, { once: true });
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

  static buildWOLUrl(book: number, chapter: number, language: Language): string {
    const config = WOL_LANG_CONFIG[language];
    const locale = LANGUAGES[language]?.locale;
    if (!config) {
      throw new Error(`Unsupported language for WOL: ${language}`);
    }
    return `${this.WOL_BASE}/${locale}/wol/b/${config.region}/${config.lp}/nwt/${book}/${chapter}`;
  }

  /**
   * Extracts Bible text from HTML.
   * Supports both jw.org format (id="v40024014") and WOL format (id="v40-24-14-1").
   */
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

    // Try WOL format first (id="v{book}-{chapter}-{verse}-{segment}")
    // then fall back to jw.org format (id="v{paddedBook}{paddedChapter}{paddedVerse}")
    const isWOL = doc.querySelector(`[id^="v${book}-${chapter}-"]`) !== null;

    const textParts: string[] = [];

    for (let v = start; v <= end; v++) {
      const verseElements = isWOL
        ? Array.from(doc.querySelectorAll(`span[id^="v${book}-${chapter}-${v}-"]`)).sort((a, b) => {
            const aSegment = Number(a.id.split('-').pop()) || 0;
            const bSegment = Number(b.id.split('-').pop()) || 0;
            return aSegment - bSegment;
          })
        : (() => {
            const verseId = `v${book}${padChapter(chapter)}${padVerse(v)}`;
            const verseEl = doc.getElementById(verseId);
            return verseEl ? [verseEl] : [];
          })();

      for (const verseEl of verseElements) {
        const clone = verseEl.cloneNode(true) as HTMLElement;

        // Remove footnote/cross-reference links (both jw.org and WOL formats)
        clone.querySelectorAll('a.footnoteLink, a.xrefLink, a.b').forEach((el) => el.remove());

        // Remove study note sections
        clone.querySelectorAll('.studyBible, .study-notes, .notes').forEach((el) => el.remove());

        // Remove verse number elements
        clone.querySelectorAll('.chapterNum, .verseNum').forEach((el) => el.remove());
        // WOL: verse number links have class "vl"
        clone.querySelectorAll('a.vl').forEach((el) => el.remove());

        const rawText = cleanHtmlText(clone.innerHTML).trim();
        if (rawText) {
          textParts.push(rawText);
        }
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
    const { book, chapter, verseRanges } = reference;

    if (!verseRanges || verseRanges.length === 0) {
      return `Book ${book}:${chapter}`;
    }

    const { start, end } = verseRanges[0];
    const verseText = start === end ? `${start}` : `${start}-${end}`;

    return `Book ${book}:${chapter}:${verseText}`;
  }
}
