import type { BibleReference, Language } from '@/types';
import { LANGUAGE_CODES } from '@/consts/languages';

/**
 * Tolerant parsing of `jwlibrary://` links produced by JW Library.
 *
 * Upstream `parseJWLibraryLink` only accepts `finder?bible=` immediately after the question
 * mark. Links created by the JW Library "Share" button put `bible` at the end of the query
 * (`...?srcid=jwlshare&wtlocale=K&prefer=lang&pub=nwtsty&bible=43003010`), so they must be
 * matched wherever the parameter appears.
 */

// `bible` anywhere in the query. The trailing `(?:&|$)` anchor is what rejects malformed
// values: a code followed by an en/em dash never satisfies it, so the whole match fails.
const BIBLE_PARAM = /(?:^|[?&])bible=([0-9-]+)(?:&|$)/;
const SINGLE_CODE = /^\d{8}$/;
const RANGE_CODE = /^(\d{8})-(\d{8})$/;
const FINDER_PREFIX = /^jwlibrary:\/\/\/?finder(?:[?#]|$)/;
const WTLOCALE_PARAM = /(?:^|[?&])wtlocale=([A-Za-z0-9]+)(?:&|$)/;

/** A verse code is `BBCCCVVV`: two digits of book, three of chapter, three of verse. */
function parseBibleCode(code: string): BibleReference | null {
  if (!SINGLE_CODE.test(code)) return null;

  const book = parseInt(code.substring(0, 2), 10);
  const chapter = parseInt(code.substring(2, 5), 10);
  const verse = parseInt(code.substring(5, 8), 10);

  return {
    book,
    chapter,
    verseRanges: [{ start: verse, end: verse }],
  };
}

/** True when the href addresses the JW Library verse finder, regardless of its parameters. */
export function isBibleFinderHref(href: string): boolean {
  return FINDER_PREFIX.test(href);
}

/** Parse a verse finder href into a reference; returns null for anything not strictly valid. */
export function parseVerseFinderHref(href: string): BibleReference | null {
  if (!isBibleFinderHref(href)) return null;

  const match = BIBLE_PARAM.exec(href);
  if (!match?.[1]) return null;

  const value = match[1];

  if (SINGLE_CODE.test(value)) {
    return parseBibleCode(value);
  }

  const range = RANGE_CODE.exec(value);
  if (!range?.[1] || !range[2]) return null;

  const start = parseBibleCode(range[1]);
  const end = parseBibleCode(range[2]);
  const startRange = start?.verseRanges?.[0];
  const endRange = end?.verseRanges?.[0];
  if (!start || !startRange || !endRange) return null;

  return {
    book: start.book,
    chapter: start.chapter,
    verseRanges: [{ start: startRange.start, end: endRange.start }],
  };
}

/** Extract the `wtlocale` query parameter (the JW Library language code) from an href. */
export function extractWtLocale(href: string): string | null {
  return WTLOCALE_PARAM.exec(href)?.[1] ?? null;
}

/**
 * Language used to fetch and name the verse: the one pinned inside the link when it is a
 * known code, otherwise the plugin setting.
 */
export function resolveCitationLanguage(href: string, fallback: Language): Language {
  const wtlocale = extractWtLocale(href);
  if (wtlocale && (LANGUAGE_CODES as readonly string[]).includes(wtlocale)) {
    return wtlocale as Language;
  }
  return fallback;
}
