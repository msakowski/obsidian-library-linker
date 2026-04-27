import { zipSync, strToU8 } from 'fflate';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { FileSystemOfflineBibleRepository } from '@/services/FileSystemOfflineBibleRepository';
import { BibleEpubImportService } from '@/services/BibleEpubImportService';
import { OfflineBibleCitationProvider } from '@/services/OfflineBibleCitationProvider';
import { initializeTestBibleBooks } from './__helpers__/initializeBibleBooksForTests';

beforeAll(() => {
  initializeTestBibleBooks();
});

describe('offline Bible citation flow', () => {
  test('imports an EPUB once and serves citations from local JSON', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'librarylinker-offline-'));
    const repository = new FileSystemOfflineBibleRepository(join(tempDir, 'offline-bible'));
    const importer = new BibleEpubImportService(repository);
    const provider = new OfflineBibleCitationProvider(repository, (key) => key);
    const epubPath = join(tempDir, 'nwt_X.epub');

    const archive = zipSync({
      mimetype: strToU8('application/epub+zip'),
      'META-INF/container.xml': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`),
      'OEBPS/content.opf': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<package version="3.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>Test Bible</dc:title>
    <dc:language>de</dc:language>
    <meta property="dcterms:modified">2026-04-11T12:00:00Z</meta>
  </metadata>
</package>`),
      'OEBPS/bibleversenav1_1.xhtml': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <body>
    <h2>1. Mose 1</h2>
    <a href="genesis1.xhtml#chapter1_verse1">1</a>
    <a href="genesis1.xhtml#chapter1_verse2">2</a>
  </body>
</html>`),
      'OEBPS/genesis1.xhtml': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
  <body>
    <p><span id="chapter1"></span><span id="chapter1_verse1"></span><span class="w_ch"><strong>1</strong></span> Im Anfang erschuf Gott Himmel und Erde. <span id="chapter1_verse2"></span><strong><sup>2</sup></strong> Die Erde war formlos und leer.</p>
    <div class="groupFootnote"><aside epub:type="footnote">ignored</aside></div>
  </body>
</html>`),
    });

    await writeFile(epubPath, Buffer.from(archive));

    const importResult = await importer.importBible({
      filePath: epubPath,
      overwriteExisting: false,
    });

    expect(importResult.error).toBeUndefined();
    expect(importResult.success).toBe(true);
    expect(importResult.language).toBe('X');
    expect(importResult.metadata?.chapterCount).toBe(1);
    expect(importResult.metadata?.verseCount).toBe(2);

    const citation = await provider.getCitation(
      {
        book: 1,
        chapter: 1,
        verseRanges: [{ start: 1, end: 2 }],
      },
      'X',
    );

    expect(citation).toEqual({
      success: true,
      source: 'offline',
      text: 'Im Anfang erschuf Gott Himmel und Erde. Die Erde war formlos und leer.',
      citation: '1. Mo. 1:1-2',
    });

    await rm(tempDir, { recursive: true, force: true });
  });

  test('preserves spaces when EPUB markup splits verse text across inline tags', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'librarylinker-offline-'));
    const repository = new FileSystemOfflineBibleRepository(join(tempDir, 'offline-bible'));
    const importer = new BibleEpubImportService(repository);
    const provider = new OfflineBibleCitationProvider(repository, (key) => key);
    const epubPath = join(tempDir, 'nwt_X_spacing.epub');

    const archive = zipSync({
      mimetype: strToU8('application/epub+zip'),
      'META-INF/container.xml': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`),
      'OEBPS/content.opf': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<package version="3.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>Test Bible</dc:title>
    <dc:language>de</dc:language>
    <meta property="dcterms:modified">2026-04-11T12:00:00Z</meta>
  </metadata>
</package>`),
      'OEBPS/bibleversenav1_1.xhtml': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <body>
    <h2>1. Mose 1</h2>
    <a href="genesis1.xhtml#chapter1_verse1">1</a>
    <a href="genesis1.xhtml#chapter1_verse2">2</a>
  </body>
</html>`),
      'OEBPS/genesis1.xhtml': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
  <body>
    <p>
      <span id="chapter1"></span><span id="chapter1_verse1"></span>
      <span class="w_ch"><strong>1</strong></span>
      Im Anfang erschuf Gott Himmel und Erde.
      <span id="chapter1_verse2"></span><strong><sup>2</sup></strong>
      Die Erde war formlos und leer,<span class="linebreak"></span>und Finsternis lag auf der Oberfläche der Wassertiefe.
    </p>
  </body>
</html>`),
    });

    await writeFile(epubPath, Buffer.from(archive));

    const importResult = await importer.importBible({
      filePath: epubPath,
      overwriteExisting: false,
    });

    expect(importResult.success).toBe(true);

    const citation = await provider.getCitation(
      {
        book: 1,
        chapter: 1,
        verseRanges: [{ start: 1, end: 2 }],
      },
      'X',
    );

    expect(citation.success).toBe(true);
    expect(citation.text).toContain('war formlos und leer, und Finsternis');

    await rm(tempDir, { recursive: true, force: true });
  });

  test('imports chapters even when nav files are not sequential within a book', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'librarylinker-offline-'));
    const repository = new FileSystemOfflineBibleRepository(join(tempDir, 'offline-bible'));
    const importer = new BibleEpubImportService(repository);
    const epubPath = join(tempDir, 'nwt_X_gap.epub');

    const archive = zipSync({
      mimetype: strToU8('application/epub+zip'),
      'META-INF/container.xml': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`),
      'OEBPS/content.opf': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<package version="3.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>Test Bible</dc:title>
    <dc:language>de</dc:language>
  </metadata>
</package>`),
      'OEBPS/bibleversenav1_1.xhtml': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <body>
    <h2>1. Mose 1</h2>
    <a href="genesis1.xhtml#chapter1_verse1">1</a>
  </body>
</html>`),
      'OEBPS/bibleversenav1_3.xhtml': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <body>
    <h2>1. Mose 3</h2>
    <a href="genesis3.xhtml#chapter3_verse1">1</a>
  </body>
</html>`),
      'OEBPS/genesis1.xhtml': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <body>
    <p><span id="chapter1"></span><span id="chapter1_verse1"></span>Kapitel eins.</p>
  </body>
</html>`),
      'OEBPS/genesis3.xhtml': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <body>
    <p><span id="chapter3"></span><span id="chapter3_verse1"></span>Kapitel drei.</p>
  </body>
</html>`),
    });

    await writeFile(epubPath, Buffer.from(archive));

    const importResult = await importer.importBible({
      filePath: epubPath,
      overwriteExisting: false,
    });

    expect(importResult.success).toBe(true);
    expect(importResult.metadata?.chapterCount).toBe(2);

    const chapter1 = await repository.getChapter('X', 1, 1);
    const chapter3 = await repository.getChapter('X', 1, 3);

    expect(chapter1?.verses['1']).toBe('Kapitel eins.');
    expect(chapter3?.verses['1']).toBe('Kapitel drei.');

    await rm(tempDir, { recursive: true, force: true });
  });

  test('uses the next nav target anchor instead of assuming verse numbers are consecutive', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'librarylinker-offline-'));
    const repository = new FileSystemOfflineBibleRepository(join(tempDir, 'offline-bible'));
    const importer = new BibleEpubImportService(repository);
    const provider = new OfflineBibleCitationProvider(repository, (key) => key);
    const epubPath = join(tempDir, 'nwt_X_anchor.epub');

    const archive = zipSync({
      mimetype: strToU8('application/epub+zip'),
      'META-INF/container.xml': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`),
      'OEBPS/content.opf': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<package version="3.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>Test Bible</dc:title>
    <dc:language>de</dc:language>
  </metadata>
</package>`),
      'OEBPS/bibleversenav1_1.xhtml': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <body>
    <h2>1. Mose 1</h2>
    <a href="genesis1.xhtml#segA">1</a>
    <a href="genesis1.xhtml#segB">2</a>
  </body>
</html>`),
      'OEBPS/genesis1.xhtml': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <body>
    <p>
      <span id="segA"></span>Vers eins.
      <span class="extra">Noch immer Vers eins.</span>
      <span id="segB"></span>Vers zwei.
    </p>
  </body>
</html>`),
    });

    await writeFile(epubPath, Buffer.from(archive));

    const importResult = await importer.importBible({
      filePath: epubPath,
      overwriteExisting: false,
    });

    expect(importResult.success).toBe(true);

    const citation = await provider.getCitation(
      {
        book: 1,
        chapter: 1,
        verseRanges: [{ start: 1, end: 1 }],
      },
      'X',
    );

    expect(citation.success).toBe(true);
    expect(citation.text).toBe('Vers eins. Noch immer Vers eins.');

    await rm(tempDir, { recursive: true, force: true });
  });

  test('can derive verse numbers from anchors when nav link text is not plain numeric text', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'librarylinker-offline-'));
    const repository = new FileSystemOfflineBibleRepository(join(tempDir, 'offline-bible'));
    const importer = new BibleEpubImportService(repository);
    const provider = new OfflineBibleCitationProvider(repository, (key) => key);
    const epubPath = join(tempDir, 'nwt_X_anchor-fallback.epub');

    const archive = zipSync({
      mimetype: strToU8('application/epub+zip'),
      'META-INF/container.xml': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`),
      'OEBPS/content.opf': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<package version="3.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>Test Bible</dc:title>
    <dc:language>de</dc:language>
  </metadata>
</package>`),
      'OEBPS/bibleversenav1_1.xhtml': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <body>
    <h2>1. Mose 1</h2>
    <a href="genesis1.xhtml#chapter1_verse1"><span>V. 1</span></a>
    <a href="genesis1.xhtml#chapter1_verse2"><span>V. 2</span></a>
  </body>
</html>`),
      'OEBPS/genesis1.xhtml': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <body>
    <p><span id="chapter1_verse1"></span>Erster Vers. <span id="chapter1_verse2"></span>Zweiter Vers.</p>
  </body>
</html>`),
    });

    await writeFile(epubPath, Buffer.from(archive));

    const importResult = await importer.importBible({
      filePath: epubPath,
      overwriteExisting: false,
    });

    expect(importResult.success).toBe(true);

    const citation = await provider.getCitation(
      {
        book: 1,
        chapter: 1,
        verseRanges: [{ start: 1, end: 2 }],
      },
      'X',
    );

    expect(citation.success).toBe(true);
    expect(citation.text).toBe('Erster Vers. Zweiter Vers.');

    await rm(tempDir, { recursive: true, force: true });
  });

  test('ignores unrelated internal links outside the verse navigation container', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'librarylinker-offline-'));
    const repository = new FileSystemOfflineBibleRepository(join(tempDir, 'offline-bible'));
    const importer = new BibleEpubImportService(repository);
    const provider = new OfflineBibleCitationProvider(repository, (key) => key);
    const epubPath = join(tempDir, 'nwt_X_container.epub');

    const archive = zipSync({
      mimetype: strToU8('application/epub+zip'),
      'META-INF/container.xml': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`),
      'OEBPS/content.opf': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<package version="3.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>Test Bible</dc:title>
    <dc:language>de</dc:language>
  </metadata>
</package>`),
      'OEBPS/bibleversenav1_1.xhtml': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <body>
    <div class="toolbar">
      <a href="genesis1.xhtml#appendix_note_1">1</a>
    </div>
    <ol class="verse-nav">
      <li><a href="genesis1.xhtml#chapter1_verse1">1</a></li>
      <li><a href="genesis1.xhtml#chapter1_verse2">2</a></li>
    </ol>
  </body>
</html>`),
      'OEBPS/genesis1.xhtml': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <body>
    <p>
      <span id="appendix_note_1"></span>Falscher Abschnitt.
      <span id="chapter1_verse1"></span>Erster Vers.
      <span id="chapter1_verse2"></span>Zweiter Vers.
    </p>
  </body>
</html>`),
    });

    await writeFile(epubPath, Buffer.from(archive));

    const importResult = await importer.importBible({
      filePath: epubPath,
      overwriteExisting: false,
    });

    expect(importResult.success).toBe(true);

    const citation = await provider.getCitation(
      {
        book: 1,
        chapter: 1,
        verseRanges: [{ start: 1, end: 2 }],
      },
      'X',
    );

    expect(citation.success).toBe(true);
    expect(citation.text).toBe('Erster Vers. Zweiter Vers.');

    await rm(tempDir, { recursive: true, force: true });
  });

  test('does not pull trailing non-verse blocks into the last verse of a chapter', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'librarylinker-offline-'));
    const repository = new FileSystemOfflineBibleRepository(join(tempDir, 'offline-bible'));
    const importer = new BibleEpubImportService(repository);
    const provider = new OfflineBibleCitationProvider(repository, (key) => key);
    const epubPath = join(tempDir, 'nwt_X_last-verse-boundary.epub');

    const archive = zipSync({
      mimetype: strToU8('application/epub+zip'),
      'META-INF/container.xml': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`),
      'OEBPS/content.opf': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<package version="3.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>Test Bible</dc:title>
    <dc:language>de</dc:language>
  </metadata>
</package>`),
      'OEBPS/bibleversenav1_1.xhtml': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <body>
    <ol class="verse-nav">
      <li><a href="genesis1.xhtml#chapter1_verse1">1</a></li>
      <li><a href="genesis1.xhtml#chapter1_verse2">2</a></li>
    </ol>
  </body>
</html>`),
      'OEBPS/genesis1.xhtml': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <body>
    <p>
      <span id="chapter1_verse1"></span>Erster Vers.
      <span id="chapter1_verse2"></span>Zweiter Vers mit weiterem Satz.
    </p>
    <div class="appendix">Zusätzlicher Hinweis außerhalb des Versblocks.</div>
  </body>
</html>`),
    });

    await writeFile(epubPath, Buffer.from(archive));

    const importResult = await importer.importBible({
      filePath: epubPath,
      overwriteExisting: false,
    });

    expect(importResult.success).toBe(true);

    const citation = await provider.getCitation(
      {
        book: 1,
        chapter: 1,
        verseRanges: [{ start: 2, end: 2 }],
      },
      'X',
    );

    expect(citation.success).toBe(true);
    expect(citation.text).toBe('Zweiter Vers mit weiterem Satz.');

    await rm(tempDir, { recursive: true, force: true });
  });

  test('keeps inline content that belongs to the last verse inside the same block', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'librarylinker-offline-'));
    const repository = new FileSystemOfflineBibleRepository(join(tempDir, 'offline-bible'));
    const importer = new BibleEpubImportService(repository);
    const provider = new OfflineBibleCitationProvider(repository, (key) => key);
    const epubPath = join(tempDir, 'nwt_X_last-verse-inline.epub');

    const archive = zipSync({
      mimetype: strToU8('application/epub+zip'),
      'META-INF/container.xml': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`),
      'OEBPS/content.opf': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<package version="3.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>Test Bible</dc:title>
    <dc:language>de</dc:language>
  </metadata>
</package>`),
      'OEBPS/bibleversenav1_1.xhtml': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <body>
    <ol class="verse-nav">
      <li><a href="genesis1.xhtml#chapter1_verse1">1</a></li>
      <li><a href="genesis1.xhtml#chapter1_verse2">2</a></li>
    </ol>
  </body>
</html>`),
      'OEBPS/genesis1.xhtml': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <body>
    <p>
      <span id="chapter1_verse1"></span>Erster Vers.
      <span id="chapter1_verse2"></span>Zweiter Vers,<span class="linebreak"></span>mit Nachsatz im selben Absatz.
    </p>
    <p>Anhang.</p>
  </body>
</html>`),
    });

    await writeFile(epubPath, Buffer.from(archive));

    const importResult = await importer.importBible({
      filePath: epubPath,
      overwriteExisting: false,
    });

    expect(importResult.success).toBe(true);

    const citation = await provider.getCitation(
      {
        book: 1,
        chapter: 1,
        verseRanges: [{ start: 2, end: 2 }],
      },
      'X',
    );

    expect(citation.success).toBe(true);
    expect(citation.text).toBe('Zweiter Vers, mit Nachsatz im selben Absatz.');

    await rm(tempDir, { recursive: true, force: true });
  });
});
