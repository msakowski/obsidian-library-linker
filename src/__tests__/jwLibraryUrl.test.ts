import { describe, expect, test } from 'vitest';

import {
  extractWtLocale,
  isBibleFinderHref,
  parseVerseFinderHref,
  resolveCitationLanguage,
} from '@/utils/jwLibraryUrl';

// Real addresses taken from the user's vault (_jw_probe_note.txt).
const PLUGIN_LINK = 'jwlibrary:///finder?bible=49005003&wtlocale=K';
const SHARE_LINK =
  'jwlibrary:///finder?srcid=jwlshare&wtlocale=K&prefer=lang&pub=nwtsty&bible=43003010';
const SHARE_RANGE_LINK =
  'jwlibrary:///finder?srcid=jwlshare&wtlocale=K&prefer=lang&pub=nwtsty&bible=40024003-40024014';
const BIBLE_IN_MIDDLE_LINK = 'jwlibrary:///finder?srcid=jwlshare&bible=45005010&wtlocale=K';

describe('isBibleFinderHref', () => {
  test('accepts verse finder links', () => {
    expect(isBibleFinderHref(PLUGIN_LINK)).toBe(true);
    expect(isBibleFinderHref(SHARE_LINK)).toBe(true);
  });

  test('rejects other jwlibrary links and web links', () => {
    expect(isBibleFinderHref('jwlibrary:///publication?pub=nwtsty')).toBe(false);
    expect(isBibleFinderHref('https://www.jw.org')).toBe(false);
  });
});

describe('parseVerseFinderHref', () => {
  test('parses the plugin link format', () => {
    expect(parseVerseFinderHref(PLUGIN_LINK)).toEqual({
      book: 49,
      chapter: 5,
      verseRanges: [{ start: 3, end: 3 }],
    });
  });

  test('parses a JW Library share link where bible is the last parameter', () => {
    expect(parseVerseFinderHref(SHARE_LINK)).toEqual({
      book: 43,
      chapter: 3,
      verseRanges: [{ start: 10, end: 10 }],
    });
  });

  test('parses a verse range from a share link', () => {
    expect(parseVerseFinderHref(SHARE_RANGE_LINK)).toEqual({
      book: 40,
      chapter: 24,
      verseRanges: [{ start: 3, end: 14 }],
    });
  });

  test('parses bible when it sits in the middle of the query', () => {
    expect(parseVerseFinderHref(BIBLE_IN_MIDDLE_LINK)).toEqual({
      book: 45,
      chapter: 5,
      verseRanges: [{ start: 10, end: 10 }],
    });
  });

  test('returns null for a short code', () => {
    expect(parseVerseFinderHref('jwlibrary:///finder?srcid=jwlshare&bible=4300301')).toBeNull();
  });

  test('returns null for an en dash instead of a hyphen', () => {
    expect(
      parseVerseFinderHref(
        'jwlibrary:///finder?srcid=jwlshare&bible=43003010\u201340024014&wtlocale=K',
      ),
    ).toBeNull();
  });

  test('returns null for an em dash instead of a hyphen', () => {
    expect(
      parseVerseFinderHref(
        'jwlibrary:///finder?srcid=jwlshare&bible=43003010\u201440024014&wtlocale=K',
      ),
    ).toBeNull();
  });

  test('returns null for a half range', () => {
    expect(parseVerseFinderHref('jwlibrary:///finder?bible=43003010-')).toBeNull();
    expect(parseVerseFinderHref('jwlibrary:///finder?bible=43003010-400240&wtlocale=K')).toBeNull();
  });

  test('returns null when bible is missing', () => {
    expect(parseVerseFinderHref('jwlibrary:///finder?wtlocale=K')).toBeNull();
  });

  test('returns null for non-finder links', () => {
    expect(parseVerseFinderHref('jwlibrary:///publication?pub=nwtsty')).toBeNull();
    expect(parseVerseFinderHref('https://www.jw.org')).toBeNull();
  });
});

describe('extractWtLocale', () => {
  test('reads the language code from the link', () => {
    expect(extractWtLocale(SHARE_LINK)).toBe('K');
    expect(extractWtLocale(BIBLE_IN_MIDDLE_LINK)).toBe('K');
  });

  test('returns null when no wtlocale is present', () => {
    expect(extractWtLocale('jwlibrary:///finder?bible=49005003')).toBeNull();
  });
});

describe('resolveCitationLanguage', () => {
  test('prefers the language pinned inside the link', () => {
    expect(resolveCitationLanguage(SHARE_LINK, 'U')).toBe('K');
  });

  test('falls back to the setting when the link has no language', () => {
    expect(resolveCitationLanguage('jwlibrary:///finder?bible=49005003', 'U')).toBe('U');
  });

  test('ignores unknown language codes', () => {
    expect(resolveCitationLanguage('jwlibrary:///finder?bible=49005003&wtlocale=ZZ', 'U')).toBe(
      'U',
    );
    expect(resolveCitationLanguage('jwlibrary:///finder?bible=49005003&wtlocale=zz', 'U')).toBe(
      'U',
    );
  });
});
