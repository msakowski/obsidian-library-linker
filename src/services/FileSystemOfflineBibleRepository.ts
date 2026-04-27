import type {
  BibleReference,
  Language,
  OfflineBibleChapter,
  OfflineBibleCorpusMetadata,
  OfflineBibleRepository,
} from '@/types';
import { padBook, padChapter } from '@/utils/padNumber';

// Node.js modules are lazy-required so this file can be imported on mobile
// without crashing. All methods in this class are desktop-only.
function getFs(): typeof import('fs') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('fs') as typeof import('fs');
}
function getFsPromises(): typeof import('fs/promises') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('fs/promises') as typeof import('fs/promises');
}
function joinPath(...segments: string[]): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { join } = require('path') as typeof import('path');
  return join(...segments);
}

interface SchemaFile {
  schemaVersion: number;
}

const SCHEMA_VERSION = 1;

export class FileSystemOfflineBibleRepository implements OfflineBibleRepository {
  private schemaReady: Promise<void> | null = null;

  constructor(private readonly rootPath: string) {}

  private ensureSchemaOnce(): Promise<void> {
    this.schemaReady ??= this.ensureSchema();
    return this.schemaReady;
  }

  async getInstalledLanguages(): Promise<Language[]> {
    const languagesPath = this.getLanguagesPath();

    try {
      await this.ensureSchemaOnce();
      const entries = await getFsPromises().readdir(languagesPath, { withFileTypes: true });
      return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name as Language);
    } catch {
      return [];
    }
  }

  async getMetadata(language: Language): Promise<OfflineBibleCorpusMetadata | null> {
    try {
      await this.ensureSchemaOnce();
      return await this.readJsonFile<OfflineBibleCorpusMetadata>(
        joinPath(this.getLanguagePath(language), 'metadata.json'),
      );
    } catch {
      return null;
    }
  }

  async getChapter(
    language: Language,
    book: number,
    chapter: number,
  ): Promise<OfflineBibleChapter | null> {
    try {
      await this.ensureSchemaOnce();
      return await this.readJsonFile<OfflineBibleChapter>(
        this.getChapterJsonPath(language, book, chapter),
      );
    } catch {
      return null;
    }
  }

  async getVerseRange(reference: BibleReference, language: Language): Promise<string | null> {
    if (reference.endChapter && reference.endChapter !== reference.chapter) {
      return null;
    }

    const chapter = await this.getChapter(language, reference.book, reference.chapter);
    if (!chapter || !reference.verseRanges?.length) {
      return null;
    }

    const parts: string[] = [];

    for (const range of reference.verseRanges) {
      for (let verse = range.start; verse <= range.end; verse++) {
        const text = chapter.verses[String(verse)];
        if (!text) {
          return null;
        }
        parts.push(text);
      }
    }

    return parts.join(' ');
  }

  async saveCorpus(
    metadata: OfflineBibleCorpusMetadata,
    chapters: OfflineBibleChapter[],
  ): Promise<void> {
    await this.ensureSchema();

    const languagePath = this.getLanguagePath(metadata.language);
    await getFsPromises().rm(languagePath, { recursive: true, force: true });
    await getFsPromises().mkdir(joinPath(languagePath, 'books'), { recursive: true });

    await getFsPromises().writeFile(
      joinPath(languagePath, 'metadata.json'),
      JSON.stringify(metadata, null, 2),
      'utf8',
    );

    for (const chapter of chapters) {
      const bookPath = joinPath(languagePath, 'books', padBook(chapter.book));
      await getFsPromises().mkdir(bookPath, { recursive: true });
      await getFsPromises().writeFile(
        this.getChapterJsonPath(metadata.language, chapter.book, chapter.chapter),
        JSON.stringify(chapter, null, 2),
        'utf8',
      );
      await getFsPromises().writeFile(
        joinPath(bookPath, `${padChapter(chapter.chapter)}.md`),
        this.toMarkdown(chapter),
        'utf8',
      );
    }
  }

  async removeLanguage(language: Language): Promise<void> {
    await getFsPromises().rm(this.getLanguagePath(language), { recursive: true, force: true });
  }

  private async ensureSchema(): Promise<void> {
    await getFsPromises().mkdir(this.getLanguagesPath(), { recursive: true });

    const schemaPath = joinPath(this.rootPath, 'schema.json');

    try {
      await getFsPromises().access(schemaPath, getFs().constants.F_OK);
      const schema = await this.readJsonFile<SchemaFile>(schemaPath);
      if (schema.schemaVersion !== SCHEMA_VERSION) {
        throw new Error('Unsupported offline Bible schema version.');
      }
      return;
    } catch (error) {
      if (error instanceof Error && error.message === 'Unsupported offline Bible schema version.') {
        throw error;
      }

      const schema: SchemaFile = { schemaVersion: SCHEMA_VERSION };
      await getFsPromises().writeFile(schemaPath, JSON.stringify(schema, null, 2), 'utf8');
    }
  }

  private async readJsonFile<T>(filePath: string): Promise<T> {
    const content = await getFsPromises().readFile(filePath, 'utf8');
    return JSON.parse(content) as T;
  }

  private toMarkdown(chapter: OfflineBibleChapter): string {
    const lines = [`# ${chapter.title || `Book ${chapter.book} ${chapter.chapter}`}`, ''];
    lines.push(
      `[//]: # (language=${chapter.language} book=${chapter.book} chapter=${chapter.chapter})`,
    );
    lines.push('');

    for (const [verse, text] of Object.entries(chapter.verses)) {
      lines.push(`[//]: # (verse=${verse})`);
      lines.push(`${verse}. ${text}`);
      lines.push('');
    }

    return lines.join('\n').trimEnd() + '\n';
  }

  private getLanguagesPath(): string {
    return joinPath(this.rootPath, 'languages');
  }

  private getLanguagePath(language: Language): string {
    return joinPath(this.getLanguagesPath(), language);
  }

  private getChapterJsonPath(language: Language, book: number, chapter: number): string {
    return joinPath(
      this.getLanguagePath(language),
      'books',
      padBook(book),
      `${padChapter(chapter)}.json`,
    );
  }
}
