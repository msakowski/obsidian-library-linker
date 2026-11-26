/**
 * @vitest-environment jsdom
 */
import { VaultOfflineBibleRepository } from '@/services/VaultOfflineBibleRepository';
import { createInMemoryAdapter } from './__helpers__/createInMemoryAdapter';
import type { OfflineBibleChapter, OfflineBibleCorpusMetadata } from '@/types';

const ROOT = '.obsidian/plugins/jw-library-linker/offline-bible';

function makeMetadata(
  overrides: Partial<OfflineBibleCorpusMetadata> = {},
): OfflineBibleCorpusMetadata {
  return {
    language: 'X',
    sourceFileName: 'nwt_X.epub',
    sourceFileChecksum: 'sha256:abc',
    importedAt: '2026-05-04T00:00:00.000Z',
    bookCount: 1,
    chapterCount: 1,
    verseCount: 2,
    ...overrides,
  };
}

function makeChapter(overrides: Partial<OfflineBibleChapter> = {}): OfflineBibleChapter {
  return {
    language: 'X',
    book: 1,
    chapter: 1,
    title: 'Genesis 1',
    verses: { '1': 'Im Anfang.', '2': 'Die Erde war leer.' },
    source: { sourceFileChecksum: 'sha256:abc', importedAt: '2026-05-04T00:00:00.000Z' },
    ...overrides,
  };
}

describe('VaultOfflineBibleRepository', () => {
  test('saveCorpus writes metadata and chapter JSON, no .md mirror', async () => {
    const adapter = createInMemoryAdapter();
    const repo = new VaultOfflineBibleRepository(adapter, ROOT);

    await repo.saveCorpus(makeMetadata(), [makeChapter()]);

    const writtenPaths = Array.from(adapter.files.keys()).sort();

    expect(writtenPaths).toEqual([
      `${ROOT}/languages/X/books/01/001.json`,
      `${ROOT}/languages/X/metadata.json`,
      `${ROOT}/schema.json`,
    ]);
    expect(writtenPaths.every((path) => !path.endsWith('.md'))).toBe(true);
  });

  test('round-trips metadata via getMetadata', async () => {
    const adapter = createInMemoryAdapter();
    const repo = new VaultOfflineBibleRepository(adapter, ROOT);

    const metadata = makeMetadata({ chapterCount: 3 });
    await repo.saveCorpus(metadata, [makeChapter()]);

    const result = await repo.getMetadata('X');
    expect(result).toEqual(metadata);
  });

  test('returns null metadata for a language that was never saved', async () => {
    const adapter = createInMemoryAdapter();
    const repo = new VaultOfflineBibleRepository(adapter, ROOT);
    expect(await repo.getMetadata('X')).toBeNull();
  });

  test('round-trips a chapter via getChapter', async () => {
    const adapter = createInMemoryAdapter();
    const repo = new VaultOfflineBibleRepository(adapter, ROOT);

    const chapter = makeChapter({ verses: { '1': 'A', '2': 'B' } });
    await repo.saveCorpus(makeMetadata(), [chapter]);

    expect(await repo.getChapter('X', 1, 1)).toEqual(chapter);
  });

  test('getVerseRange returns null when the verse is missing', async () => {
    const adapter = createInMemoryAdapter();
    const repo = new VaultOfflineBibleRepository(adapter, ROOT);
    await repo.saveCorpus(makeMetadata(), [makeChapter({ verses: { '1': 'A' } })]);

    const text = await repo.getVerseRange(
      { book: 1, chapter: 1, verseRanges: [{ start: 5, end: 5 }] },
      'X',
    );
    expect(text).toBeNull();
  });

  test('getVerseRange runs an open-ended split part through the last verse', async () => {
    const adapter = createInMemoryAdapter();
    const repo = new VaultOfflineBibleRepository(adapter, ROOT);
    await repo.saveCorpus(makeMetadata(), [makeChapter()]);

    const text = await repo.getVerseRange(
      { book: 1, chapter: 1, verseRanges: [{ start: 2, end: 176, toChapterEnd: true }] },
      'X',
    );
    expect(text).toBe('Die Erde war leer.');
  });

  test('getVerseRange fails a range that ends past the last verse of the chapter', async () => {
    const adapter = createInMemoryAdapter();
    const repo = new VaultOfflineBibleRepository(adapter, ROOT);
    await repo.saveCorpus(makeMetadata(), [makeChapter()]);

    // Only the open end of a cross-chapter part may run past the chapter; an
    // explicit end, even 176 or more, must not give a partial quote.
    for (const end of [40, 176, 177]) {
      const text = await repo.getVerseRange(
        { book: 1, chapter: 1, verseRanges: [{ start: 1, end }] },
        'X',
      );
      expect(text).toBeNull();
    }
  });

  test('getVerseRange skips a verse the translation omits', async () => {
    const adapter = createInMemoryAdapter();
    const repo = new VaultOfflineBibleRepository(adapter, ROOT);
    // Matt. 17:21 is not in the NWT main text.
    await repo.saveCorpus(makeMetadata(), [
      makeChapter({ book: 40, chapter: 17, verses: { '20': 'A', '22': 'C' } }),
    ]);

    expect(
      await repo.getVerseRange(
        { book: 40, chapter: 17, verseRanges: [{ start: 20, end: 22 }] },
        'X',
      ),
    ).toBe('A C');
    expect(
      await repo.getVerseRange(
        { book: 40, chapter: 17, verseRanges: [{ start: 20, end: 176, toChapterEnd: true }] },
        'X',
      ),
    ).toBe('A C');
    expect(
      await repo.getVerseRange(
        { book: 40, chapter: 17, verseRanges: [{ start: 21, end: 21 }] },
        'X',
      ),
    ).toBeNull();
  });

  test('getVerseRange fails when an ordinary verse is missing inside a range', async () => {
    const adapter = createInMemoryAdapter();
    const repo = new VaultOfflineBibleRepository(adapter, ROOT);
    // Incomplete import: John 3:17 could not be extracted.
    await repo.saveCorpus(makeMetadata(), [
      makeChapter({ book: 43, chapter: 3, verses: { '16': 'A', '18': 'C', '19': 'D' } }),
    ]);

    expect(
      await repo.getVerseRange(
        { book: 43, chapter: 3, verseRanges: [{ start: 16, end: 18 }] },
        'X',
      ),
    ).toBeNull();
    expect(
      await repo.getVerseRange(
        { book: 43, chapter: 3, verseRanges: [{ start: 16, end: 176, toChapterEnd: true }] },
        'X',
      ),
    ).toBeNull();
  });

  test('getVerseRange concatenates multiple verses with a single space', async () => {
    const adapter = createInMemoryAdapter();
    const repo = new VaultOfflineBibleRepository(adapter, ROOT);
    await repo.saveCorpus(makeMetadata(), [makeChapter()]);

    const text = await repo.getVerseRange(
      { book: 1, chapter: 1, verseRanges: [{ start: 1, end: 2 }] },
      'X',
    );
    expect(text).toBe('Im Anfang. Die Erde war leer.');
  });

  test('getInstalledLanguages lists folder names under languages/', async () => {
    const adapter = createInMemoryAdapter();
    const repo = new VaultOfflineBibleRepository(adapter, ROOT);
    await repo.saveCorpus(makeMetadata({ language: 'X' }), [makeChapter({ language: 'X' })]);
    await repo.saveCorpus(makeMetadata({ language: 'E' }), [makeChapter({ language: 'E' })]);

    const installed = await repo.getInstalledLanguages();
    expect(installed.sort()).toEqual(['E', 'X']);
  });

  test('removeLanguage deletes the language tree', async () => {
    const adapter = createInMemoryAdapter();
    const repo = new VaultOfflineBibleRepository(adapter, ROOT);
    await repo.saveCorpus(makeMetadata(), [makeChapter()]);

    await repo.removeLanguage('X');

    expect(await repo.getMetadata('X')).toBeNull();
    const remaining = Array.from(adapter.files.keys()).filter((path) =>
      path.startsWith(`${ROOT}/languages/X`),
    );
    expect(remaining).toHaveLength(0);
  });

  test('saveCorpus replaces an existing language atomically', async () => {
    const adapter = createInMemoryAdapter();
    const repo = new VaultOfflineBibleRepository(adapter, ROOT);
    await repo.saveCorpus(makeMetadata({ chapterCount: 1 }), [makeChapter({ chapter: 1 })]);
    await repo.saveCorpus(makeMetadata({ chapterCount: 1 }), [makeChapter({ chapter: 2 })]);

    expect(await repo.getChapter('X', 1, 1)).toBeNull();
    expect(await repo.getChapter('X', 1, 2)).not.toBeNull();
  });

  test('rejects an unknown schema version on subsequent boot', async () => {
    const adapter = createInMemoryAdapter();
    adapter.files.set(`${ROOT}/schema.json`, JSON.stringify({ schemaVersion: 999 }));

    const repo = new VaultOfflineBibleRepository(adapter, ROOT);
    await expect(repo.getMetadata('X')).resolves.toBeNull(); // swallowed by getMetadata's try/catch
    await expect(repo.saveCorpus(makeMetadata(), [makeChapter()])).rejects.toThrow(
      'Unsupported offline Bible schema version.',
    );
  });
});
