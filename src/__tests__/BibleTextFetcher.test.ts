// Unmock BibleTextFetcher in case other tests mocked it
jest.unmock('@/services/BibleTextFetcher');

import { BibleTextFetcher } from '@/services/BibleTextFetcher';
import { requestUrl } from 'obsidian';

// Mock Obsidian's requestUrl
jest.mock('obsidian', () => ({
  requestUrl: jest.fn(),
}));

const mockedRequestUrl = requestUrl as jest.Mock;

describe('BibleTextFetcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchBibleText', () => {
    describe('verse 1 extraction (chapter number displayed)', () => {
      test('extracts Prediger 3:1 correctly', async () => {
        const html = `
          <div id="bibleText">
            <span class="verse" id="v21003001"><span class="style-b"><span class="chapterNum"><a href='/de/bibliothek/bibel/studienbibel/buecher/prediger/3/#v21003001' data-anchor='#v21003001'>3 </a></span> Für alles gibt es eine Zeit,</span><span class="newblock"></span><span class="style-z">eine Zeit für jedes Geschehen unter dem Himmel:</span>
            <span class="parabreak"></span></span>
            <span class="verse" id="v21003002"><span class="style-l"> <sup class="verseNum"><a href='/de/bibliothek/bibel/studienbibel/buecher/prediger/3/#v21003002' data-anchor='#v21003002'>2 </a></sup> eine Zeit für die Geburt</span></span>
          </div>
        `;

        mockedRequestUrl.mockResolvedValue({
          status: 200,
          text: html,
        });

        const result = await BibleTextFetcher.fetchBibleText(
          {
            book: 21,
            chapter: 3,
            verseRanges: [{ start: 1, end: 1 }],
          },
          'X',
        );

        expect(result.success).toBe(true);
        expect(result.text).toContain('Für alles gibt es eine Zeit');
        expect(result.text).toContain('eine Zeit für jedes Geschehen unter dem Himmel');
        expect(result.text).not.toContain('eine Zeit für die Geburt');
      });

      test('extracts Psalm 23:1 correctly', async () => {
        const html = `
          <div id="bibleText">
            <span class="verse" id="v19023001"><span class="style-l"><span class="chapterNum"><a href='/de/bibliothek/bibel/studienbibel/buecher/psalmen/23/#v19023001' data-anchor='#v19023001'>23 </a></span> Jehova ist mein Hirte.</span><span class="parabreak"></span>
            <span class="style-z">Mir wird nichts fehlen.</span>
            <span class="parabreak"></span></span>
            <span class="verse" id="v19023002"><span class="style-l"> <sup class="verseNum"><a href='/de/bibliothek/bibel/studienbibel/buecher/psalmen/23/#v19023002' data-anchor='#v19023002'>2 </a></sup> Auf saftigen Weiden</span></span>
          </div>
        `;

        mockedRequestUrl.mockResolvedValue({
          status: 200,
          text: html,
        });

        const result = await BibleTextFetcher.fetchBibleText(
          {
            book: 19,
            chapter: 23,
            verseRanges: [{ start: 1, end: 1 }],
          },
          'X',
        );

        expect(result.success).toBe(true);
        expect(result.text).toContain('Jehova ist mein Hirte');
        expect(result.text).toContain('Mir wird nichts fehlen');
        expect(result.text).not.toContain('Auf saftigen Weiden');
      });

      test('extracts 1. Mose 1:1 correctly', async () => {
        const html = `
          <div id="bibleText">
            <span class="verse" id="v1001001"><span class="style-b"><span class="chapterNum"><a href='/de/bibliothek/bibel/studienbibel/buecher/1-mose/1/#v1001001' data-anchor='#v1001001'>1 </a></span> Am Anfang erschuf Gott Himmel und Erde.</span>
            <span class="parabreak"></span></span>
            <span class="verse" id="v1001002"><span class="style-b first"><sup class="verseNum"><a href='/de/bibliothek/bibel/studienbibel/buecher/1-mose/1/#v1001002' data-anchor='#v1001002'>2 </a></sup> Die Erde nun war formlos</span></span>
          </div>
        `;

        mockedRequestUrl.mockResolvedValue({
          status: 200,
          text: html,
        });

        const result = await BibleTextFetcher.fetchBibleText(
          {
            book: 1,
            chapter: 1,
            verseRanges: [{ start: 1, end: 1 }],
          },
          'X',
        );

        expect(result.success).toBe(true);
        expect(result.text).toContain('Am Anfang erschuf Gott Himmel und Erde');
        expect(result.text).not.toContain('Die Erde nun war formlos');
      });

      test('extracts 1. Petrus 1:1 correctly', async () => {
        const html = `
          <div id="bibleText">
            <span class="verse" id="v60001001"><span class="style-b"><span class="chapterNum"><a href='/de/bibliothek/bibel/studienbibel/buecher/1-petrus/1/#v60001001' data-anchor='#v60001001'>1 </a></span> Petrus, ein Apostel von Jesus Christus, an die vorübergehend Ansässigen</span></span>
            <span class="verse" id="v60001002"><span class="style-b"><sup class="verseNum"><a href='/de/bibliothek/bibel/studienbibel/buecher/1-petrus/1/#v60001002' data-anchor='#v60001002'>2 </a></sup> nach dem Vorherwissen Gottes</span></span>
          </div>
        `;

        mockedRequestUrl.mockResolvedValue({
          status: 200,
          text: html,
        });

        const result = await BibleTextFetcher.fetchBibleText(
          {
            book: 60,
            chapter: 1,
            verseRanges: [{ start: 1, end: 1 }],
          },
          'X',
        );

        expect(result.success).toBe(true);
        expect(result.text).toContain('Petrus, ein Apostel von Jesus Christus');
        expect(result.text).toContain('an die vorübergehend Ansässigen');
        expect(result.text).not.toContain('nach dem Vorherwissen Gottes');
      });
    });

    describe('regular verse extraction (verse number displayed)', () => {
      test('extracts Prediger 3:2 correctly', async () => {
        const html = `
          <div id="bibleText">
            <span class="verse" id="v21003001"><span class="style-b"><span class="chapterNum"><a href='/de/bibliothek/bibel/studienbibel/buecher/prediger/3/#v21003001' data-anchor='#v21003001'>3 </a></span> Für alles gibt es eine Zeit</span></span>
            <span class="verse" id="v21003002"><span class="style-l"> <sup class="verseNum"><a href='/de/bibliothek/bibel/studienbibel/buecher/prediger/3/#v21003002' data-anchor='#v21003002'>2 </a></sup> eine Zeit für die Geburt und eine Zeit für das Sterben,</span><span class="newblock"></span><span class="style-z">eine Zeit zum Pflanzen und eine Zeit, Gepflanztes auszureißen,</span></span>
            <span class="verse" id="v21003003"><span class="newblock"></span><span class="style-l"> <sup class="verseNum"><a href='/de/bibliothek/bibel/studienbibel/buecher/prediger/3/#v21003003' data-anchor='#v21003003'>3 </a></sup> eine Zeit zum Töten</span></span>
          </div>
        `;

        mockedRequestUrl.mockResolvedValue({
          status: 200,
          text: html,
        });

        const result = await BibleTextFetcher.fetchBibleText(
          {
            book: 21,
            chapter: 3,
            verseRanges: [{ start: 2, end: 2 }],
          },
          'X',
        );

        expect(result.success).toBe(true);
        expect(result.text).toContain('eine Zeit für die Geburt');
        expect(result.text).toContain('eine Zeit zum Pflanzen');
        expect(result.text).not.toContain('Für alles gibt es eine Zeit');
        expect(result.text).not.toContain('eine Zeit zum Töten');
      });
    });

    describe('verse range extraction', () => {
      test('extracts Prediger 3:1-2 correctly', async () => {
        const html = `
          <div id="bibleText">
            <span class="verse" id="v21003001"><span class="style-b"><span class="chapterNum"><a href='/de/bibliothek/bibel/studienbibel/buecher/prediger/3/#v21003001' data-anchor='#v21003001'>3 </a></span> Für alles gibt es eine Zeit,</span><span class="newblock"></span><span class="style-z">eine Zeit für jedes Geschehen unter dem Himmel:</span>
            <span class="parabreak"></span></span>
            <span class="verse" id="v21003002"><span class="style-l"> <sup class="verseNum"><a href='/de/bibliothek/bibel/studienbibel/buecher/prediger/3/#v21003002' data-anchor='#v21003002'>2 </a></sup> eine Zeit für die Geburt und eine Zeit für das Sterben,</span><span class="newblock"></span><span class="style-z">eine Zeit zum Pflanzen und eine Zeit, Gepflanztes auszureißen,</span></span>
            <span class="verse" id="v21003003"><span class="newblock"></span><span class="style-l"> <sup class="verseNum"><a href='/de/bibliothek/bibel/studienbibel/buecher/prediger/3/#v21003003' data-anchor='#v21003003'>3 </a></sup> eine Zeit zum Töten</span></span>
          </div>
        `;

        mockedRequestUrl.mockResolvedValue({
          status: 200,
          text: html,
        });

        const result = await BibleTextFetcher.fetchBibleText(
          {
            book: 21,
            chapter: 3,
            verseRanges: [{ start: 1, end: 2 }],
          },
          'X',
        );

        expect(result.success).toBe(true);
        expect(result.text).toContain('Für alles gibt es eine Zeit');
        expect(result.text).toContain('eine Zeit für die Geburt');
        expect(result.text).toContain('eine Zeit zum Pflanzen');
        expect(result.text).not.toContain('eine Zeit zum Töten');
      });
    });

    describe('footnote and cross-reference cleaning', () => {
      test('removes footnotes and cross-references from extracted text', async () => {
        const html = `
          <div id="bibleText">
            <span class="verse" id="v19023001"><span class="chapterNum"><a data-anchor='#v19023001'>23 </a></span> Jehova ist mein Hirte.<a class="xrefLink jsBibleLink" href="#ref">+</a><a class="footnoteLink" href="#fn">*</a></span>
            <span class="verse" id="v19023002"><sup class="verseNum"><a data-anchor='#v19023002'>2 </a></sup> Auf saftigen Weiden</span>
          </div>
        `;

        mockedRequestUrl.mockResolvedValue({
          status: 200,
          text: html,
        });

        const result = await BibleTextFetcher.fetchBibleText(
          {
            book: 19,
            chapter: 23,
            verseRanges: [{ start: 1, end: 1 }],
          },
          'X',
        );

        expect(result.success).toBe(true);
        expect(result.text).toContain('Jehova ist mein Hirte');
        expect(result.text).not.toContain('+');
        expect(result.text).not.toContain('*');
        expect(result.text).not.toContain('xrefLink');
        expect(result.text).not.toContain('footnoteLink');
      });
    });
  });
});
