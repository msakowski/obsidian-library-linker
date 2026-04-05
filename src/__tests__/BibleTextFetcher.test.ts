// @jest-environment jsdom

// Unmock BibleTextFetcher in case other tests mocked it
jest.unmock('@/services/BibleTextFetcher');

// Mock obsidian module (uses __mocks__/obsidian.ts)
jest.mock('obsidian');

import { BibleTextFetcher } from '@/services/BibleTextFetcher';
import { requestUrl } from 'obsidian';

const mockedRequestUrl = requestUrl as jest.Mock;

describe('BibleTextFetcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedRequestUrl.mockReset();
    BibleTextFetcher.clearCache();
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

        mockedRequestUrl.mockResolvedValue({ status: 200, text: html });

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

        mockedRequestUrl.mockResolvedValue({ status: 200, text: html });

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

        mockedRequestUrl.mockResolvedValue({ status: 200, text: html });

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

        mockedRequestUrl.mockResolvedValue({ status: 200, text: html });

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

        mockedRequestUrl.mockResolvedValue({ status: 200, text: html });

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

        mockedRequestUrl.mockResolvedValue({ status: 200, text: html });

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

        mockedRequestUrl.mockResolvedValue({ status: 200, text: html });

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

  describe('chapter-level caching', () => {
    test('makes only one HTTP request for two verses in the same chapter', async () => {
      const chapterHtml = `
        <div id="bibleText">
          <span class="verse" id="v43003016"><span class="chapterNum"><a>16 </a></span> For God loved the world so much</span>
          <span class="verse" id="v43003017"><sup class="verseNum"><a>17 </a></sup> For God did not send his Son</span>
        </div>
      `;
      mockedRequestUrl.mockResolvedValue({ status: 200, text: chapterHtml });

      const r1 = await BibleTextFetcher.fetchBibleText(
        { book: 43, chapter: 3, verseRanges: [{ start: 16, end: 16 }] },
        'E',
      );
      const r2 = await BibleTextFetcher.fetchBibleText(
        { book: 43, chapter: 3, verseRanges: [{ start: 17, end: 17 }] },
        'E',
      );

      expect(mockedRequestUrl).toHaveBeenCalledTimes(1);
      expect(r1.success).toBe(true);
      expect(r2.success).toBe(true);
      expect(r1.text).toContain('For God loved the world so much');
      expect(r2.text).toContain('For God did not send his Son');
    });

    test('fetches separately for different chapters', async () => {
      const html1 = `<span class="verse" id="v43003016"><span class="chapterNum">16 </span>For God loved the world</span>`;
      const html2 = `<span class="verse" id="v43004006"><span class="chapterNum">6 </span>Jesus said to her</span>`;
      mockedRequestUrl
        .mockResolvedValueOnce({ status: 200, text: html1 })
        .mockResolvedValueOnce({ status: 200, text: html2 });

      await BibleTextFetcher.fetchBibleText(
        { book: 43, chapter: 3, verseRanges: [{ start: 16, end: 16 }] },
        'E',
      );
      await BibleTextFetcher.fetchBibleText(
        { book: 43, chapter: 4, verseRanges: [{ start: 6, end: 6 }] },
        'E',
      );

      expect(mockedRequestUrl).toHaveBeenCalledTimes(2);
    });

    test('fetches separately for the same chapter in different languages', async () => {
      const htmlE = `<span class="verse" id="v43003016"><span class="chapterNum">16 </span>For God loved the world</span>`;
      const htmlX = `<span class="verse" id="v43003016"><span class="chapterNum">16 </span>Denn Gott hat die Welt so sehr geliebt</span>`;
      mockedRequestUrl
        .mockResolvedValueOnce({ status: 200, text: htmlE })
        .mockResolvedValueOnce({ status: 200, text: htmlX });

      await BibleTextFetcher.fetchBibleText(
        { book: 43, chapter: 3, verseRanges: [{ start: 16, end: 16 }] },
        'E',
      );
      await BibleTextFetcher.fetchBibleText(
        { book: 43, chapter: 3, verseRanges: [{ start: 16, end: 16 }] },
        'X',
      );

      expect(mockedRequestUrl).toHaveBeenCalledTimes(2);
    });

    test('always fetches chapter at verse 001 regardless of requested verse', async () => {
      const html = `<span class="verse" id="v43003016"><span class="chapterNum">16 </span>For God loved the world</span>`;
      mockedRequestUrl.mockResolvedValue({ status: 200, text: html });

      await BibleTextFetcher.fetchBibleText(
        { book: 43, chapter: 3, verseRanges: [{ start: 16, end: 16 }] },
        'E',
      );

      const [[callArg]] = mockedRequestUrl.mock.calls as [[{ url: string }]];
      expect(callArg.url).toContain('43003001');
    });
  });

  describe('request throttling', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('throttles consecutive requests for different chapters', async () => {
      const html1 = `<span class="verse" id="v43003016"><span class="chapterNum">16 </span>For God loved the world</span>`;
      const html2 = `<span class="verse" id="v43004006"><span class="chapterNum">6 </span>Jesus said to her</span>`;
      mockedRequestUrl
        .mockResolvedValueOnce({ status: 200, text: html1 })
        .mockResolvedValueOnce({ status: 200, text: html2 });

      // First request — no previous request, no throttle wait
      const p1 = BibleTextFetcher.fetchBibleText(
        { book: 43, chapter: 3, verseRanges: [{ start: 16, end: 16 }] },
        'E',
      );
      await jest.runAllTimersAsync();
      const r1 = await p1;
      expect(r1.success).toBe(true);
      expect(mockedRequestUrl).toHaveBeenCalledTimes(1);

      // Second request immediately after — throttle delay kicks in before the HTTP request
      const p2 = BibleTextFetcher.fetchBibleText(
        { book: 43, chapter: 4, verseRanges: [{ start: 6, end: 6 }] },
        'E',
      );
      // Before timers run, the second HTTP request has not been made yet
      expect(mockedRequestUrl).toHaveBeenCalledTimes(1);

      await jest.runAllTimersAsync();
      const r2 = await p2;
      expect(r2.success).toBe(true);
      expect(mockedRequestUrl).toHaveBeenCalledTimes(2);
    });

    test('does not throttle cache hits', async () => {
      const chapterHtml = `
        <span class="verse" id="v43003016"><span class="chapterNum">16 </span>For God loved the world</span>
        <span class="verse" id="v43003017"><sup class="verseNum">17 </sup>For God did not send his Son</span>
      `;
      mockedRequestUrl.mockResolvedValue({ status: 200, text: chapterHtml });

      // First request fetches and caches the chapter
      const p1 = BibleTextFetcher.fetchBibleText(
        { book: 43, chapter: 3, verseRanges: [{ start: 16, end: 16 }] },
        'E',
      );
      await jest.runAllTimersAsync();
      await p1;
      expect(mockedRequestUrl).toHaveBeenCalledTimes(1);

      // Second request for same chapter — cache hit, resolves without running any timers
      const p2 = BibleTextFetcher.fetchBibleText(
        { book: 43, chapter: 3, verseRanges: [{ start: 17, end: 17 }] },
        'E',
      );
      const r2 = await p2;

      expect(r2.success).toBe(true);
      expect(mockedRequestUrl).toHaveBeenCalledTimes(1); // Still only 1 HTTP request
    });
  });
});
