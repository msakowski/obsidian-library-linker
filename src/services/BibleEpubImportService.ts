import type {
  BibleImportRequest,
  BibleImportResult,
  EpubImportService,
  Language,
  OfflineBibleChapter,
  OfflineBibleCorpusMetadata,
  OfflineBibleRepository,
} from '@/types';
import { unzipSync, strFromU8 } from 'fflate';
import { getLanguageByLocale } from '@/consts/languages';
import { cleanHtmlText } from '@/utils/cleanHtmlText';

import { lazyReadFile, lazyCreateHash, lazyPath } from '@/utils/lazyNodeModules';

interface VerseTarget {
  book: number;
  chapter: number;
  verse: number;
  title: string;
  filePath: string;
  anchor: string;
}

export class BibleEpubImportService implements EpubImportService {
  constructor(private readonly repository: OfflineBibleRepository) {}

  async importBible(request: BibleImportRequest): Promise<BibleImportResult> {
    try {
      if (!request.fileData && !request.filePath) {
        return {
          success: false,
          warnings: [],
          error: 'No EPUB file was selected.',
        };
      }

      const fileBuffer =
        request.fileData !== undefined
          ? Buffer.from(request.fileData)
          : await lazyReadFile()(request.filePath ?? '');
      const checksum = `sha256:${lazyCreateHash()('sha256').update(fileBuffer).digest('hex')}`;
      const archive = unzipSync(new Uint8Array(fileBuffer));
      const archiveEntries = new Map(
        Object.entries(archive).map(([path, bytes]) => [path, strFromU8(bytes)]),
      );

      const rootFilePath = this.getRootFilePath(archiveEntries);
      const rootDir = lazyPath().posix.dirname(rootFilePath);
      const packageDoc = this.parseXml(this.getArchiveEntry(archiveEntries, rootFilePath));
      const detectedLanguage = this.detectLanguage(packageDoc);
      const language = request.language ?? detectedLanguage;

      if (!language) {
        return {
          success: false,
          warnings: [],
          error: 'Could not detect a supported language from the EPUB metadata.',
        };
      }

      const existingMetadata = await this.repository.getMetadata(language);
      if (existingMetadata && !request.overwriteExisting) {
        return {
          success: false,
          language,
          warnings: [],
          error: `An offline Bible for ${language} is already installed. Re-import to replace it.`,
        };
      }

      const chapters = this.extractChapters(archiveEntries, rootDir, language);
      const metadata = this.buildMetadata({
        language,
        checksum,
        fileName:
          request.sourceFileName ?? lazyPath().basename(request.filePath ?? 'imported.epub'),
        modifiedAt: this.readModifiedAt(packageDoc),
        chapters,
      });

      await this.repository.saveCorpus(metadata, chapters);

      return {
        success: true,
        language,
        warnings: [],
        metadata,
      };
    } catch (error) {
      return {
        success: false,
        warnings: [],
        error: error instanceof Error ? error.message : 'Failed to import Bible EPUB.',
      };
    }
  }

  private extractChapters(
    archiveEntries: Map<string, string>,
    rootDir: string,
    language: Language,
  ): OfflineBibleChapter[] {
    const contentDocs = new Map<string, Document>();
    const chapters: OfflineBibleChapter[] = [];

    for (const entry of this.getNavEntries(archiveEntries, rootDir)) {
      const navContent = this.getArchiveEntry(archiveEntries, entry.path);
      const verseTargets = this.parseVerseTargets(navContent, rootDir, entry.book, entry.chapter);
      if (!verseTargets.length) {
        continue;
      }

      const verses: Record<string, string> = {};
      for (let index = 0; index < verseTargets.length; index++) {
        const target = verseTargets[index];
        const nextTarget = verseTargets[index + 1];
        const chapterDoc = this.getChapterDoc(archiveEntries, contentDocs, target.filePath);
        const text = this.extractVerseText(chapterDoc, target.anchor, nextTarget?.anchor);

        if (text) {
          verses[String(target.verse)] = text;
        }
      }

      if (Object.keys(verses).length === 0) {
        throw new Error(
          `Unsupported EPUB structure: could not extract text for ${entry.book}:${entry.chapter}.`,
        );
      }

      chapters.push({
        language,
        book: entry.book,
        chapter: entry.chapter,
        title: verseTargets[0].title,
        verses,
        source: {
          sourceFileChecksum: '',
          importedAt: '',
        },
      });
    }

    if (!chapters.length) {
      throw new Error('Unsupported EPUB structure: no Bible chapters were found.');
    }

    return chapters;
  }

  private getNavEntries(archiveEntries: Map<string, string>, rootDir: string) {
    const navFilePattern = new RegExp(
      `^${this.escapeRegex(rootDir)}/bibleversenav(\\d+)_(\\d+)\\.xhtml$`,
    );

    return Array.from(archiveEntries.keys())
      .map((path) => {
        const match = path.match(navFilePattern);
        if (!match) {
          return null;
        }

        return {
          path,
          book: Number(match[1]),
          chapter: Number(match[2]),
        };
      })
      .filter((entry): entry is { path: string; book: number; chapter: number } => entry !== null)
      .sort((a, b) => a.book - b.book || a.chapter - b.chapter);
  }

  private buildMetadata(params: {
    language: Language;
    checksum: string;
    fileName: string;
    modifiedAt?: string;
    chapters: OfflineBibleChapter[];
  }): OfflineBibleCorpusMetadata {
    const importedAt = new Date().toISOString();
    const verseCount = params.chapters.reduce(
      (sum, chapter) => sum + Object.keys(chapter.verses).length,
      0,
    );
    const bookCount = new Set(params.chapters.map((chapter) => chapter.book)).size;

    for (const chapter of params.chapters) {
      chapter.source = {
        sourceFileChecksum: params.checksum,
        importedAt,
      };
    }

    return {
      language: params.language,
      sourceFileName: params.fileName,
      sourceFileChecksum: params.checksum,
      importedAt,
      contentVersion: params.modifiedAt?.slice(0, 7),
      bookCount,
      chapterCount: params.chapters.length,
      verseCount,
    };
  }

  private getRootFilePath(archiveEntries: Map<string, string>): string {
    const containerXml = this.getArchiveEntry(archiveEntries, 'META-INF/container.xml');
    const containerDoc = this.parseXml(containerXml);
    const rootFile = containerDoc.getElementsByTagName('rootfile')[0];

    if (!rootFile) {
      throw new Error('Invalid EPUB: META-INF/container.xml does not contain a rootfile.');
    }

    const rootFilePath = rootFile.getAttribute('full-path');
    if (!rootFilePath) {
      throw new Error('Invalid EPUB: rootfile path is missing.');
    }

    return rootFilePath;
  }

  private detectLanguage(packageDoc: Document): Language | undefined {
    const languageValue = Array.from(packageDoc.getElementsByTagName('*'))
      .find((node) => node.localName === 'language')
      ?.textContent?.trim();
    if (!languageValue) {
      return undefined;
    }

    return getLanguageByLocale(languageValue);
  }

  private readModifiedAt(packageDoc: Document): string | undefined {
    const modified = Array.from(packageDoc.getElementsByTagName('meta')).find(
      (node) => node.getAttribute('property') === 'dcterms:modified',
    );
    return modified?.textContent?.trim() || undefined;
  }

  private parseVerseTargets(
    navContent: string,
    rootDir: string,
    book: number,
    chapter: number,
  ): VerseTarget[] {
    const navDoc = this.parseXml(navContent);
    const heading = navDoc.querySelector('h2');
    const title = heading?.textContent?.replace(/\s+/g, ' ').trim() ?? `Book ${book} ${chapter}`;
    const verseNavContainer = this.findVerseNavContainer(navDoc, chapter);

    return Array.from(verseNavContainer.querySelectorAll('a[href*="#"]'))
      .map((link) => {
        const href = link.getAttribute('href');
        const [relativePath, anchor] = href?.split('#') ?? [];
        const verse = this.parseVerseNumber(link.textContent ?? '', anchor, chapter);

        if (!href || !relativePath || !anchor || !Number.isInteger(verse)) {
          return null;
        }

        return {
          book,
          chapter,
          verse,
          title,
          filePath: lazyPath().posix.join(rootDir, relativePath),
          anchor,
        } satisfies VerseTarget;
      })
      .filter((target): target is VerseTarget => target !== null);
  }

  private findVerseNavContainer(navDoc: Document, chapter: number): ParentNode {
    const body = navDoc.body;
    if (!body) {
      return navDoc;
    }

    const candidates = [
      body,
      ...Array.from(body.querySelectorAll('nav, ol, ul, section, div, main, article')),
    ];

    let bestContainer: ParentNode = body;
    let bestScore = -1;

    for (const candidate of candidates) {
      const links = Array.from(candidate.querySelectorAll('a[href*="#"]'));
      if (links.length === 0) {
        continue;
      }

      const validVerseLinks = links.filter((link) => {
        const href = link.getAttribute('href');
        const [relativePath, anchor] = href?.split('#') ?? [];
        const verse = this.parseVerseNumber(link.textContent ?? '', anchor, chapter);
        return Boolean(relativePath && anchor && Number.isInteger(verse));
      });

      if (validVerseLinks.length === 0) {
        continue;
      }

      const score = validVerseLinks.length / links.length;
      if (
        score > bestScore ||
        (score === bestScore && validVerseLinks.length > this.countLinks(bestContainer))
      ) {
        bestContainer = candidate;
        bestScore = score;
      }
    }

    return bestContainer;
  }

  private getChapterDoc(
    archiveEntries: Map<string, string>,
    contentDocs: Map<string, Document>,
    filePath: string,
  ): Document {
    const cached = contentDocs.get(filePath);
    if (cached) {
      return cached;
    }

    const content = this.getArchiveEntry(archiveEntries, filePath);
    const parsed = this.parseXml(content);
    contentDocs.set(filePath, parsed);
    return parsed;
  }

  private extractVerseText(
    chapterDoc: Document,
    anchor: string,
    nextAnchor?: string,
  ): string | null {
    const start = chapterDoc.getElementById(anchor);
    if (!start) {
      return null;
    }

    const body = chapterDoc.body;
    if (!body) {
      return null;
    }

    const range = chapterDoc.createRange();
    range.setStartAfter(start);

    const nextVerse = nextAnchor ? chapterDoc.getElementById(nextAnchor) : null;

    if (nextVerse && nextVerse !== start) {
      range.setEndBefore(nextVerse);
    } else {
      const verseContainer = this.findVerseContentContainer(start, body);
      range.setEndAfter(verseContainer);
    }

    const wrapper = chapterDoc.createElement('div');
    wrapper.append(range.cloneContents());
    wrapper
      .querySelectorAll(
        'a[epub\\:type="noteref"], a[href^="#footnote"], .pageNum, .w_ch, sup, aside, .groupFootnote',
      )
      .forEach((node) => node.remove());

    return this.normalizeText(wrapper.innerHTML);
  }

  private findVerseContentContainer(start: Element, body: HTMLElement): Node {
    let current: Element | null = start;

    while (current && current.parentElement && current.parentElement !== body) {
      if (this.isBlockContentContainer(current)) {
        return current;
      }
      current = current.parentElement;
    }

    if (current && current !== body) {
      return current;
    }

    return body.lastChild ?? body;
  }

  private isBlockContentContainer(element: Element): boolean {
    return ['P', 'DIV', 'LI', 'SECTION', 'ARTICLE', 'BLOCKQUOTE'].includes(element.tagName);
  }

  private normalizeText(html: string): string | null {
    const normalized = cleanHtmlText(
      html.replace(/\u00a0/g, ' ').replace(/[\u200b-\u200d\ufeff]/g, ''),
      { removeFootnoteMarkers: false },
    );

    return normalized || null;
  }

  private parseVerseNumber(linkText: string, anchor: string | undefined, chapter: number): number {
    const numericText = linkText.trim().match(/\d+/)?.[0];
    if (numericText) {
      return Number(numericText);
    }

    if (!anchor) {
      return Number.NaN;
    }

    const chapterAnchorMatch = anchor.match(new RegExp(`^chapter${chapter}_verse(\\d+)$`));
    if (chapterAnchorMatch) {
      return Number(chapterAnchorMatch[1]);
    }

    const genericAnchorMatch = anchor.match(/verse(\d+)$/);
    if (genericAnchorMatch) {
      return Number(genericAnchorMatch[1]);
    }

    return Number.NaN;
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private countLinks(node: ParentNode): number {
    return node instanceof Element ? node.querySelectorAll('a[href*="#"]').length : 0;
  }

  private readonly domParser = new DOMParser();

  private parseXml(content: string): Document {
    const doc = this.domParser.parseFromString(content, 'application/xhtml+xml');
    const parserError = doc.querySelector('parsererror');

    if (parserError) {
      throw new Error('Invalid EPUB: failed to parse XML content.');
    }

    return doc;
  }

  private getArchiveEntry(archiveEntries: Map<string, string>, path: string): string {
    const entry = archiveEntries.get(path);
    if (!entry) {
      throw new Error(`Invalid EPUB: missing required file ${path}.`);
    }

    return entry;
  }
}
