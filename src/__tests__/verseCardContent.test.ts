import { beforeAll, describe, expect, test } from 'vitest';

import type { BibleCitationResult, BibleReference } from '@/types';
import { loadBibleBooks } from '@/stores/bibleBooks';
import { buildVerseCardContent, type VerseCardContentView } from '@/ui/verseCardContent';
import { formatBibleText } from '@/utils/formatBibleText';
import { createSettings } from './__helpers__/createSettings';

const reference: BibleReference = { book: 43, chapter: 3, verseRanges: [{ start: 10, end: 10 }] };
const t = (key: string): string => `T:${key}`;

const SAMPLE_TEXT =
  'For God loved the world so much that he gave his only-begotten Son.\nJohn 3:16';

function citation(overrides: Partial<BibleCitationResult> = {}): BibleCitationResult {
  return {
    success: true,
    source: 'offline',
    text: SAMPLE_TEXT,
    citation: 'John 3:16',
    ...overrides,
  };
}

function build(result: BibleCitationResult | null, bookLength: 'short' | 'long' = 'short') {
  return buildVerseCardContent({
    reference,
    result,
    settings: createSettings({ bookLength }),
    language: 'E',
    t,
  });
}

beforeAll(() => {
  loadBibleBooks('E');
});

describe('buildVerseCardContent', () => {
  test('shows a loading message while the citation is pending', () => {
    const view = build(null);
    expect(view.state).toBe('loading');
    expect(view.body).toBe('T:card.loading');
    expect(view.source).toBe('');
  });

  test('marks offline text as coming from the archive', () => {
    const view = build(citation({ source: 'offline' }));
    expect(view.state).toBe('ready');
    expect(view.source).toBe('T:card.sourceOffline');
    expect(view.body).toBe(SAMPLE_TEXT);
  });

  test('marks online text as coming from the web', () => {
    const view = build(citation({ source: 'online' }));
    expect(view.source).toBe('T:card.sourceOnline');
  });

  test.each(['errors.offlineBibleNotInstalled', 'errors.offlineBibleVerseMissing', 'network down'])(
    'shows the localized message for a failed lookup (%s)',
    (error) => {
      const view = build(citation({ success: false, text: '', error }));
      expect(view.state).toBe('unavailable');
      expect(view.body).toBe('T:card.unavailable');
      expect(view.body).not.toContain(error);
    },
  );

  test('treats an empty successful text as unavailable instead of an empty card', () => {
    const view = build(citation({ success: true, text: '   ' }));
    expect(view.state).toBe('unavailable');
    expect(view.body).toBe('T:card.unavailable');
  });

  test('keeps the verse text as plain text (no markdown, no link, no callout)', () => {
    const view = build(citation());
    expect(view.body).toBe(SAMPLE_TEXT);
    const views: VerseCardContentView[] = [build(null), view, build(citation({ success: false }))];
    for (const candidate of views) {
      expect(candidate.body).not.toContain('jwlibrary://');
      expect(candidate.body).not.toContain('> [');
      expect(candidate.heading).not.toContain('jwlibrary://');
      expect(candidate.heading).not.toContain('[');
    }
  });

  test('keeps the card body plain under our card preset', () => {
    const view = buildVerseCardContent({
      reference,
      result: citation(),
      settings: createSettings({ bibleQuote: { template: '{bibleRef}\\n\\n{quote}' } }),
      language: 'E',
      t,
    });

    expect(view.heading).toBe(formatBibleText(reference, 'short', 'E'));
    expect(view.body).toBe(SAMPLE_TEXT);
    expect(view.heading).not.toContain('>');
    expect(view.body).not.toContain('>');
    expect(view.body).not.toContain('jwlibrary://');
  });

  test('uses the configured book name length for the heading', () => {
    expect(build(citation(), 'short').heading).toBe(formatBibleText(reference, 'short', 'E'));
    expect(build(citation(), 'long').heading).toBe(formatBibleText(reference, 'long', 'E'));
    expect(build(citation(), 'short').heading).not.toBe(build(citation(), 'long').heading);
  });
});
