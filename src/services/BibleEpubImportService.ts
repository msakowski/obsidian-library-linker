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
import { mapEpubLanguageToPluginLanguage } from '@/utils/languageMetadata';

// Node.js modules are lazy-required so this file can be imported on mobile
// without crashing. All methods in this class are desktop-only.
function lazyReadFile(): typeof import('fs/promises').readFile {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return (require('fs/promises') as typeof import('fs/promises')).readFile;
}
function lazyCreateHash(): typeof import('crypto').createHash {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return (require('crypto') as typeof import('crypto')).createHash;
}
function lazyPath(): typeof import('path') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('path') as typeof import('path');
}

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

    for (let book = 1; book <= 66; book++) {
      for (let chapter = 1; ; chapter++) {
        const navPath = lazyPath().posix.join(rootDir, `bibleversenav${book}_${chapter}.xhtml`);
        const navContent = archiveEntries.get(navPath);

        if (!navContent) {
          break;
        }

        const verseTargets = this.parseVerseTargets(navContent, rootDir, book, chapter);
        if (!verseTargets.length) {
          continue;
        }

        const verses: Record<string, string> = {};
        for (const target of verseTargets) {
          const chapterDoc = this.getChapterDoc(archiveEntries, contentDocs, target.filePath);
          const text = this.extractVerseText(
            chapterDoc,
            target.anchor,
            target.chapter,
            target.verse,
          );

          if (text) {
            verses[String(target.verse)] = text;
          }
        }

        if (Object.keys(verses).length === 0) {
          throw new Error(
            `Unsupported EPUB structure: could not extract text for ${book}:${chapter}.`,
          );
        }

        chapters.push({
          language,
          book,
          chapter,
          title: verseTargets[0].title,
          verses,
          source: {
            sourceFileChecksum: '',
            importedAt: '',
          },
        });
      }
    }

    if (!chapters.length) {
      throw new Error('Unsupported EPUB structure: no Bible chapters were found.');
    }

    return chapters;
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

    return mapEpubLanguageToPluginLanguage(languageValue) ?? undefined;
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

    return Array.from(navDoc.querySelectorAll('a[href*="#chapter"]'))
      .map((link) => {
        const href = link.getAttribute('href');
        const verse = Number(link.textContent?.trim());

        if (!href || !Number.isInteger(verse)) {
          return null;
        }

        const [relativePath, anchor] = href.split('#');
        if (!relativePath || !anchor) {
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
    chapter: number,
    verse: number,
  ): string | null {
    const start = chapterDoc.getElementById(anchor);
    if (!start) {
      return null;
    }

    const body = chapterDoc.body;
    if (!body) {
      return null;
    }

    const nextVerse = chapterDoc.getElementById(`chapter${chapter}_verse${verse + 1}`);
    const range = chapterDoc.createRange();
    range.setStartAfter(start);

    if (nextVerse) {
      range.setEndBefore(nextVerse);
    } else {
      range.setEndAfter(body.lastChild ?? body);
    }

    const wrapper = chapterDoc.createElement('div');
    wrapper.append(range.cloneContents());
    wrapper
      .querySelectorAll(
        'a[epub\\:type="noteref"], a[href^="#footnote"], .pageNum, .w_ch, sup, aside, .groupFootnote',
      )
      .forEach((node) => node.remove());

    return this.normalizeText(wrapper.textContent ?? '');
  }

  private normalizeText(text: string): string | null {
    const normalized = text
      .replace(/\u00a0/g, ' ')
      .replace(/[\u200b-\u200d\ufeff]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return normalized || null;
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
