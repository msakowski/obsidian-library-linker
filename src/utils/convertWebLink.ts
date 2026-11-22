import { chapterCounts } from '@/consts/chapterCounts';
import { padBook, padChapter, padVerse } from '@/utils/padNumber';
import type { ConversionType } from '@/utils/convertLinks';

/** Convert only explicit targets; never resolve citation indirections or fetch pages. */
export function convertWebLink(input: string, type: ConversionType): string | null {
  // The caller passes the Markdown destination. Titles and whitespace are not URL data.
  if (/\s/.test(input)) return null;
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return null;
  }
  if (
    url.protocol !== 'https:' ||
    !['www.jw.org', 'jw.org', 'wol.jw.org'].includes(url.hostname) ||
    url.username ||
    url.password ||
    url.port
  )
    return null;

  if (url.hostname === 'wol.jw.org') {
    const target = wolTarget(url);
    if (!target) return null;
    url = new URL(`https://www.jw.org/finder?${target.toString()}`);
  }
  if (url.pathname !== '/finder' || url.hash) return null;

  const allowedKeys = new Set(['bible', 'docid', 'par', 'wtlocale', 'pub', 'srcid', 'prefer']);
  const seen = new Set<string>();
  for (const key of url.searchParams.keys()) {
    if (!allowedKeys.has(key) || seen.has(key)) return null;
    if (key !== 'srcid' && key !== 'prefer' && !url.searchParams.get(key)) return null;
    seen.add(key);
  }
  const bible = url.searchParams.get('bible');
  const docid = url.searchParams.get('docid');
  const params = new URLSearchParams();
  if (
    bible &&
    !docid &&
    validBibleTarget(bible) &&
    !url.searchParams.has('par') &&
    type !== 'publication'
  ) {
    params.set('bible', bible);
  } else if (docid && !bible && /^\d+$/.test(docid) && type !== 'bible') {
    params.set('docid', docid);
    const paragraph = url.searchParams.get('par');
    if (paragraph) {
      if (!validParagraph(paragraph)) return null;
      params.set('par', paragraph);
    }
  } else return null;

  const language = url.searchParams.get('wtlocale');
  if (language) params.set('wtlocale', language);
  const publication = url.searchParams.get('pub');
  if (publication) params.set('pub', publication);
  return `jwlibrary:///finder?${params.toString()}`;
}

function wolTarget(url: URL): URLSearchParams | null {
  if (url.search) return null;
  const document = url.pathname.match(/^\/[^/]+\/wol\/d\/r\d+\/lp-([a-z-]+)\/(\d+)$/i);
  if (document && !url.hash) {
    return new URLSearchParams({ docid: document[2], wtlocale: document[1].toUpperCase() });
  }
  const bible = url.pathname.match(
    /^\/[^/]+\/wol\/b\/r\d+\/lp-([a-z-]+)\/([a-z0-9]+)\/(\d+)\/(\d+)$/i,
  );
  const verses = url.hash.match(/^#v=(\d+):(\d+):(\d+)(?:-(\d+):(\d+):(\d+))?$/);
  if (!bible || !verses) return null;
  const [, book, chapter, verse, endBook, endChapter, endVerse] = verses;
  if (Number(book) !== Number(bible[3]) || Number(chapter) !== Number(bible[4])) return null;
  const code = (b: string, c: string, v: string) =>
    `${padBook(Number(b))}${padChapter(Number(c))}${padVerse(Number(v))}`;
  const start = code(book, chapter, verse);
  const end = endBook ? code(endBook, endChapter, endVerse) : start;
  return new URLSearchParams({
    bible: start === end ? start : `${start}-${end}`,
    wtlocale: bible[1].toUpperCase(),
    pub: bible[2],
  });
}

function validBibleTarget(value: string): boolean {
  if (!/^\d{8}(?:-\d{8})?$/.test(value)) return false;
  const codes = value.split('-');
  for (const code of codes) {
    const book = Number(code.slice(0, 2));
    const chapter = Number(code.slice(2, 5));
    if (!chapterCounts[book] || chapter < 1 || chapter > chapterCounts[book]) return false;
  }
  return (
    codes.length === 1 || (codes[0].slice(0, 2) === codes[1].slice(0, 2) && codes[0] <= codes[1])
  );
}

function validParagraph(value: string): boolean {
  if (!/^\d+(?:-\d+)?$/.test(value)) return false;
  const [start, end = start] = value.split('-').map(Number);
  return start > 0 && end >= start;
}
