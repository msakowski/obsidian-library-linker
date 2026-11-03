import { isOmittedVerse } from '@/consts/omittedVerses';
import type { DataAdapter } from 'obsidian';
import type {
  BibleReference,
  Language,
  OfflineBibleChapter,
  OfflineBibleCorpusMetadata,
  OfflineBibleRepository,
} from '@/types';
import { padBook, padChapter } from '@/utils/padNumber';

interface SchemaFile {
  schemaVersion: number;
}

const SCHEMA_VERSION = 1;

export class VaultOfflineBibleRepository implements OfflineBibleRepository {
  private schemaReady: Promise<void> | null = null;

  constructor(
    private readonly adapter: DataAdapter,
    private readonly rootPath: string,
  ) {}

  private ensureSchemaOnce(): Promise<void> {
    this.schemaReady ??= this.ensureSchema();
    return this.schemaReady;
  }

  async getInstalledLanguages(): Promise<Language[]> {
    try {
      await this.ensureSchemaOnce();
      const listing = await this.adapter.list(this.getLanguagesPath());
      return listing.folders
        .map((folder) => folder.split('/').pop() ?? '')
        .filter((name): name is Language => name.length > 0);
    } catch {
      return [];
    }
  }

  async getMetadata(language: Language): Promise<OfflineBibleCorpusMetadata | null> {
    try {
      await this.ensureSchemaOnce();
      return await this.readJsonFile<OfflineBibleCorpusMetadata>(
        `${this.getLanguagePath(language)}/metadata.json`,
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

    const verseNumbers = Object.keys(chapter.verses)
      .map(Number)
      .filter((verse) => !Number.isNaN(verse));
    const lastVerse = Math.max(0, ...verseNumbers);

    const parts: string[] = [];
    for (const range of reference.verseRanges) {
      // Only the open end of a part split from a cross-chapter reference runs
      // to the chapter's last verse. An explicit end is taken as written, so a
      // range past the chapter fails below rather than giving a partial quote.
      const end = range.toChapterEnd ? lastVerse : range.end;
      if (range.start > end) return null;

      const rangeParts: string[] = [];
      for (let verse = range.start; verse <= end; verse++) {
        const text = chapter.verses[String(verse)];
        if (text) {
          rangeParts.push(text);
        } else if (!isOmittedVerse(reference.book, reference.chapter, verse)) {
          // Missing data (e.g. a verse the importer could not extract), not a
          // verse the translation omits: fail so the caller can fall back.
          return null;
        }
      }

      if (rangeParts.length === 0) return null;
      parts.push(...rangeParts);
    }
    return parts.join(' ');
  }

  async saveCorpus(
    metadata: OfflineBibleCorpusMetadata,
    chapters: OfflineBibleChapter[],
  ): Promise<void> {
    await this.ensureSchema();

    const languagePath = this.getLanguagePath(metadata.language);
    if (await this.adapter.exists(languagePath)) {
      await this.adapter.rmdir(languagePath, true);
    }

    await this.ensureDir(`${languagePath}/books`);

    await this.adapter.write(`${languagePath}/metadata.json`, JSON.stringify(metadata, null, 2));

    for (const chapter of chapters) {
      const bookPath = `${languagePath}/books/${padBook(chapter.book)}`;
      await this.ensureDir(bookPath);
      await this.adapter.write(
        this.getChapterJsonPath(metadata.language, chapter.book, chapter.chapter),
        JSON.stringify(chapter, null, 2),
      );
    }
  }

  async removeLanguage(language: Language): Promise<void> {
    const path = this.getLanguagePath(language);
    if (await this.adapter.exists(path)) {
      await this.adapter.rmdir(path, true);
    }
  }

  private async ensureSchema(): Promise<void> {
    await this.ensureDir(this.getLanguagesPath());

    const schemaPath = `${this.rootPath}/schema.json`;
    if (await this.adapter.exists(schemaPath)) {
      const schema = await this.readJsonFile<SchemaFile>(schemaPath);
      if (schema.schemaVersion !== SCHEMA_VERSION) {
        throw new Error('Unsupported offline Bible schema version.');
      }
      return;
    }

    const schema: SchemaFile = { schemaVersion: SCHEMA_VERSION };
    await this.adapter.write(schemaPath, JSON.stringify(schema, null, 2));
  }

  private async ensureDir(path: string): Promise<void> {
    if (!(await this.adapter.exists(path))) {
      await this.adapter.mkdir(path);
    }
  }

  private async readJsonFile<T>(filePath: string): Promise<T> {
    const content = await this.adapter.read(filePath);
    return JSON.parse(content) as T;
  }

  private getLanguagesPath(): string {
    return `${this.rootPath}/languages`;
  }

  private getLanguagePath(language: Language): string {
    return `${this.getLanguagesPath()}/${language}`;
  }

  private getChapterJsonPath(language: Language, book: number, chapter: number): string {
    return `${this.getLanguagePath(language)}/books/${padBook(book)}/${padChapter(chapter)}.json`;
  }
}
