import type {
  BibleReference,
  Language,
  OfflineBibleChapter,
  OfflineBibleCorpusMetadata,
  OfflineBibleRepository,
} from '@/types';
import { access, mkdir, readFile, readdir, rm, writeFile } from 'fs/promises';
import { constants as fsConstants } from 'fs';
import { join } from 'path';

interface SchemaFile {
  schemaVersion: number;
}

const SCHEMA_VERSION = 1;

export class FileSystemOfflineBibleRepository implements OfflineBibleRepository {
  constructor(private readonly rootPath: string) {}

  async getInstalledLanguages(): Promise<Language[]> {
    const languagesPath = this.getLanguagesPath();

    try {
      await this.ensureSchema();
      const entries = await readdir(languagesPath, { withFileTypes: true });
      return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name as Language);
    } catch {
      return [];
    }
  }

  async getMetadata(language: Language): Promise<OfflineBibleCorpusMetadata | null> {
    try {
      await this.ensureSchema();
      return await this.readJsonFile<OfflineBibleCorpusMetadata>(
        join(this.getLanguagePath(language), 'metadata.json'),
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
      await this.ensureSchema();
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
    await rm(languagePath, { recursive: true, force: true });
    await mkdir(join(languagePath, 'books'), { recursive: true });

    await writeFile(join(languagePath, 'metadata.json'), JSON.stringify(metadata, null, 2), 'utf8');

    for (const chapter of chapters) {
      const bookPath = join(languagePath, 'books', this.padBook(chapter.book));
      await mkdir(bookPath, { recursive: true });
      await writeFile(
        this.getChapterJsonPath(metadata.language, chapter.book, chapter.chapter),
        JSON.stringify(chapter, null, 2),
        'utf8',
      );
      await writeFile(
        join(bookPath, `${this.padChapter(chapter.chapter)}.md`),
        this.toMarkdown(chapter),
        'utf8',
      );
    }
  }

  async removeLanguage(language: Language): Promise<void> {
    await rm(this.getLanguagePath(language), { recursive: true, force: true });
  }

  private async ensureSchema(): Promise<void> {
    await mkdir(this.getLanguagesPath(), { recursive: true });

    const schemaPath = join(this.rootPath, 'schema.json');

    try {
      await access(schemaPath, fsConstants.F_OK);
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
      await writeFile(schemaPath, JSON.stringify(schema, null, 2), 'utf8');
    }
  }

  private async readJsonFile<T>(filePath: string): Promise<T> {
    const content = await readFile(filePath, 'utf8');
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
    return join(this.rootPath, 'languages');
  }

  private getLanguagePath(language: Language): string {
    return join(this.getLanguagesPath(), language);
  }

  private getChapterJsonPath(language: Language, book: number, chapter: number): string {
    return join(
      this.getLanguagePath(language),
      'books',
      this.padBook(book),
      `${this.padChapter(chapter)}.json`,
    );
  }

  private padBook(book: number): string {
    return String(book).padStart(2, '0');
  }

  private padChapter(chapter: number): string {
    return String(chapter).padStart(3, '0');
  }
}
