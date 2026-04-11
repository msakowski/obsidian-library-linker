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
    const provider = new OfflineBibleCitationProvider(repository);
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
});
