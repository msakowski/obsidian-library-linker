// Unmock BibleTextFetcher in case other tests mocked it
jest.unmock('@/services/BibleTextFetcher');

// Mock obsidian module (uses __mocks__/obsidian.ts)
jest.mock('obsidian');
jest.mock('child_process', () => ({
  execFile: jest.fn(),
}));

import { BibleTextFetcher } from '@/services/BibleTextFetcher';
import { Platform, requestUrl } from 'obsidian';
import { execFile } from 'child_process';

const mockedRequestUrl = requestUrl as jest.Mock;
const mockedExecFile = execFile as unknown as jest.Mock;
const mockedPlatform = Platform as { isDesktopApp: boolean; isMobileApp: boolean };

jest.mock('util', () => {
  const actual = jest.requireActual<typeof import('util')>('util');
  return {
    ...actual,
    promisify: jest.fn((fn: (...args: unknown[]) => void) => {
      return (...args: unknown[]) =>
        new Promise((resolve, reject) => {
          fn(...args, (error: Error | null, stdout: string) => {
            if (error) {
              reject(error);
              return;
            }
            resolve({ stdout });
          });
        });
    }),
  };
});

describe('BibleTextFetcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedRequestUrl.mockReset();
    mockedExecFile.mockReset();
    mockedPlatform.isDesktopApp = false;
    mockedPlatform.isMobileApp = true;
    BibleTextFetcher.clearCache();
  });

  describe('buildWOLUrl', () => {
    test('builds correct URL for English', () => {
      expect(BibleTextFetcher.buildWOLUrl(40, 24, 'E')).toBe(
        'https://wol.jw.org/en/wol/b/r1/lp-e/nwt/40/24',
      );
    });

    test('builds correct URL for German', () => {
      expect(BibleTextFetcher.buildWOLUrl(40, 24, 'X')).toBe(
        'https://wol.jw.org/de/wol/b/r10/lp-x/nwt/40/24',
      );
    });

    test('builds correct URL for Korean', () => {
      expect(BibleTextFetcher.buildWOLUrl(1, 1, 'KO')).toBe(
        'https://wol.jw.org/ko/wol/b/r8/lp-ko/nwt/1/1',
      );
    });

    test('builds correct URL for Portuguese', () => {
      expect(BibleTextFetcher.buildWOLUrl(66, 21, 'TPO')).toBe(
        'https://wol.jw.org/pt_pt/wol/b/r5/lp-t/nwt/66/21',
      );
    });

    test('builds correct URL for Croatian', () => {
      expect(BibleTextFetcher.buildWOLUrl(19, 23, 'C')).toBe(
        'https://wol.jw.org/hr/wol/b/r19/lp-c/nwt/19/23',
      );
    });
  });

  describe('fetchBibleText', () => {
    describe('jw.org HTML format (id="v{padded}")', () => {
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

    describe('WOL HTML format (id="v{book}-{ch}-{v}-{seg}")', () => {
      test('extracts Matt 24:14 from WOL format', async () => {
        const html = `
          <div class="section" data-key="40-24-14">
            <span id="v40-24-14-1" class="v"><a href="#" class="vl vx vp">14 </a>And this good news of the Kingdom will be preached in all the inhabited earth for a witness to all the nations,<a class="b" href="#">+</a> and then the end will come.</span>
          </div>
          <div class="section" data-key="40-24-15">
            <span id="v40-24-15-1" class="v"><a href="#" class="vl vx vp">15 </a>Therefore, when you catch sight of the disgusting thing</span>
          </div>
        `;

        mockedRequestUrl.mockResolvedValue({ status: 200, text: html });

        const result = await BibleTextFetcher.fetchBibleText(
          {
            book: 40,
            chapter: 24,
            verseRanges: [{ start: 14, end: 14 }],
          },
          'E',
        );

        expect(result.success).toBe(true);
        expect(result.text).toContain('good news of the Kingdom');
        expect(result.text).toContain('and then the end will come');
        expect(result.text).not.toContain('disgusting thing');
        // Footnote markers should be removed
        expect(result.text).not.toContain('+');
      });

      test('extracts verse range from WOL format', async () => {
        const html = `
          <span id="v40-24-14-1" class="v"><a href="#" class="vl vx vp">14 </a>And this good news of the Kingdom will be preached.</span>
          <span id="v40-24-15-1" class="v"><a href="#" class="vl vx vp">15 </a>Therefore, when you catch sight of the disgusting thing.</span>
          <span id="v40-24-16-1" class="v"><a href="#" class="vl vx vp">16 </a>Then let those in Judea begin fleeing.</span>
        `;

        mockedRequestUrl.mockResolvedValue({ status: 200, text: html });

        const result = await BibleTextFetcher.fetchBibleText(
          {
            book: 40,
            chapter: 24,
            verseRanges: [{ start: 14, end: 15 }],
          },
          'E',
        );

        expect(result.success).toBe(true);
        expect(result.text).toContain('good news of the Kingdom');
        expect(result.text).toContain('disgusting thing');
        expect(result.text).not.toContain('Judea');
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

    describe('network fallback behavior', () => {
      test('falls back to curl when requestUrl fails on desktop', async () => {
        const html = `
          <span id="v40-24-14-1" class="v"><a href="#" class="vl vx vp">14 </a>And this good news of the Kingdom will be preached.</span>
        `;
        const curlStdout =
          `${html}\n` +
          '__JWLINKER_CURL_META__200\thttps://wol.jw.org/en/wol/b/r1/lp-e/nwt/40/24\ttext/html; charset=utf-8\t1.234';

        mockedRequestUrl.mockRejectedValue(new Error('net::ERR_HTTP2_PROTOCOL_ERROR'));
        mockedPlatform.isDesktopApp = true;
        mockedPlatform.isMobileApp = false;
        mockedExecFile.mockImplementation(
          (
            _file: string,
            _args: string[],
            _options: Record<string, unknown>,
            callback: (error: Error | null, stdout: string) => void,
          ) => callback(null, curlStdout),
        );

        const result = await BibleTextFetcher.fetchBibleText(
          {
            book: 40,
            chapter: 24,
            verseRanges: [{ start: 14, end: 14 }],
          },
          'E',
        );

        expect(result.success).toBe(true);
        expect(result.text).toContain('good news of the Kingdom');
        expect(mockedExecFile).toHaveBeenCalledWith(
          'curl',
          expect.arrayContaining([
            '-sS',
            '-L',
            '--compressed',
            '--max-time',
            '30',
            '--output',
            '-',
            '--write-out',
          ]),
          { maxBuffer: 1024 * 1024 },
          expect.any(Function),
        );
      });

      test('does not fall back to curl on mobile', async () => {
        mockedRequestUrl.mockRejectedValue(new Error('net::ERR_HTTP2_PROTOCOL_ERROR'));
        mockedPlatform.isDesktopApp = false;
        mockedPlatform.isMobileApp = true;

        const result = await BibleTextFetcher.fetchBibleText(
          {
            book: 40,
            chapter: 24,
            verseRanges: [{ start: 14, end: 14 }],
          },
          'E',
        );

        expect(result.success).toBe(false);
        expect(result.error).toContain('ERR_HTTP2_PROTOCOL_ERROR');
        expect(mockedExecFile).not.toHaveBeenCalled();
      });

      test('returns combined error when requestUrl and curl both fail', async () => {
        mockedRequestUrl.mockRejectedValue(new Error('net::ERR_HTTP2_PROTOCOL_ERROR'));
        mockedPlatform.isDesktopApp = true;
        mockedPlatform.isMobileApp = false;
        mockedExecFile.mockImplementation(
          (
            _file: string,
            _args: string[],
            _options: Record<string, unknown>,
            callback: (error: Error | null, stdout: string) => void,
          ) => callback(new Error('spawn curl ENOENT'), ''),
        );

        const result = await BibleTextFetcher.fetchBibleText(
          {
            book: 43,
            chapter: 3,
            verseRanges: [{ start: 16, end: 16 }],
          },
          'E',
        );

        expect(result.success).toBe(false);
        expect(result.error).toContain('All fetch methods failed');
      });

      test('remembers curl unavailability across requests', async () => {
        mockedRequestUrl.mockRejectedValue(new Error('net::ERR_HTTP2_PROTOCOL_ERROR'));
        mockedPlatform.isDesktopApp = true;
        mockedPlatform.isMobileApp = false;
        mockedExecFile.mockImplementation(
          (
            _file: string,
            _args: string[],
            _options: Record<string, unknown>,
            callback: (error: Error | null, stdout: string) => void,
          ) => callback(new Error('spawn curl ENOENT'), ''),
        );

        // First call: curl is tried and fails with ENOENT
        await BibleTextFetcher.fetchBibleText(
          { book: 43, chapter: 3, verseRanges: [{ start: 16, end: 16 }] },
          'E',
        );
        expect(mockedExecFile).toHaveBeenCalledTimes(1);

        // Second call: curl should be skipped entirely
        mockedExecFile.mockClear();
        await BibleTextFetcher.fetchBibleText(
          { book: 43, chapter: 4, verseRanges: [{ start: 1, end: 1 }] },
          'E',
        );
        expect(mockedExecFile).not.toHaveBeenCalled();
      });
    });
  });

  describe('chapter-level caching', () => {
    test('makes only one HTTP request for two verses in the same chapter', async () => {
      const chapterHtml = `
        <span id="v40-24-14-1" class="v"><a href="#" class="vl">14 </a>And this good news of the Kingdom will be preached.</span>
        <span id="v40-24-15-1" class="v"><a href="#" class="vl">15 </a>Therefore, when you catch sight of the disgusting thing.</span>
      `;
      mockedRequestUrl.mockResolvedValue({ status: 200, text: chapterHtml });

      const r1 = await BibleTextFetcher.fetchBibleText(
        { book: 40, chapter: 24, verseRanges: [{ start: 14, end: 14 }] },
        'E',
      );
      const r2 = await BibleTextFetcher.fetchBibleText(
        { book: 40, chapter: 24, verseRanges: [{ start: 15, end: 15 }] },
        'E',
      );

      expect(mockedRequestUrl).toHaveBeenCalledTimes(1);
      expect(r1.success).toBe(true);
      expect(r2.success).toBe(true);
      expect(r1.text).toContain('good news of the Kingdom');
      expect(r2.text).toContain('disgusting thing');
    });

    test('fetches separately for different chapters', async () => {
      const html1 = `<span id="v40-24-14-1" class="v"><a class="vl">14 </a>Good news</span>`;
      const html2 = `<span id="v40-25-1-1" class="v"><a class="vl">1 </a>The kingdom of the heavens</span>`;
      mockedRequestUrl
        .mockResolvedValueOnce({ status: 200, text: html1 })
        .mockResolvedValueOnce({ status: 200, text: html2 });

      await BibleTextFetcher.fetchBibleText(
        { book: 40, chapter: 24, verseRanges: [{ start: 14, end: 14 }] },
        'E',
      );
      await BibleTextFetcher.fetchBibleText(
        { book: 40, chapter: 25, verseRanges: [{ start: 1, end: 1 }] },
        'E',
      );

      expect(mockedRequestUrl).toHaveBeenCalledTimes(2);
    });

    test('fetches separately for the same chapter in different languages', async () => {
      const htmlE = `<span id="v40-24-14-1" class="v"><a class="vl">14 </a>Good news</span>`;
      const htmlX = `<span id="v40-24-14-1" class="v"><a class="vl">14 </a>Gute Botschaft</span>`;
      mockedRequestUrl
        .mockResolvedValueOnce({ status: 200, text: htmlE })
        .mockResolvedValueOnce({ status: 200, text: htmlX });

      await BibleTextFetcher.fetchBibleText(
        { book: 40, chapter: 24, verseRanges: [{ start: 14, end: 14 }] },
        'E',
      );
      await BibleTextFetcher.fetchBibleText(
        { book: 40, chapter: 24, verseRanges: [{ start: 14, end: 14 }] },
        'X',
      );

      expect(mockedRequestUrl).toHaveBeenCalledTimes(2);
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
      const html1 = `<span id="v40-24-14-1" class="v"><a class="vl">14 </a>Good news</span>`;
      const html2 = `<span id="v40-25-1-1" class="v"><a class="vl">1 </a>The kingdom</span>`;
      mockedRequestUrl
        .mockResolvedValueOnce({ status: 200, text: html1 })
        .mockResolvedValueOnce({ status: 200, text: html2 });

      const p1 = BibleTextFetcher.fetchBibleText(
        { book: 40, chapter: 24, verseRanges: [{ start: 14, end: 14 }] },
        'E',
      );
      await jest.runAllTimersAsync();
      const r1 = await p1;
      expect(r1.success).toBe(true);
      expect(mockedRequestUrl).toHaveBeenCalledTimes(1);

      // Second request immediately — throttle delay kicks in
      const p2 = BibleTextFetcher.fetchBibleText(
        { book: 40, chapter: 25, verseRanges: [{ start: 1, end: 1 }] },
        'E',
      );
      // Before timers advance, second HTTP request has not been made
      expect(mockedRequestUrl).toHaveBeenCalledTimes(1);

      await jest.runAllTimersAsync();
      const r2 = await p2;
      expect(r2.success).toBe(true);
      expect(mockedRequestUrl).toHaveBeenCalledTimes(2);
    });

    test('does not throttle cache hits', async () => {
      const html = `
        <span id="v40-24-14-1" class="v"><a class="vl">14 </a>Good news</span>
        <span id="v40-24-15-1" class="v"><a class="vl">15 </a>Disgusting thing</span>
      `;
      mockedRequestUrl.mockResolvedValue({ status: 200, text: html });

      const p1 = BibleTextFetcher.fetchBibleText(
        { book: 40, chapter: 24, verseRanges: [{ start: 14, end: 14 }] },
        'E',
      );
      await jest.runAllTimersAsync();
      await p1;
      expect(mockedRequestUrl).toHaveBeenCalledTimes(1);

      // Cache hit — resolves immediately without timers
      const r2 = await BibleTextFetcher.fetchBibleText(
        { book: 40, chapter: 24, verseRanges: [{ start: 15, end: 15 }] },
        'E',
      );

      expect(r2.success).toBe(true);
      expect(mockedRequestUrl).toHaveBeenCalledTimes(1);
    });
  });
});
