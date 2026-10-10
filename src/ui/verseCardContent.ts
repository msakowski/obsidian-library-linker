import type { BibleCitationResult, BibleReference, Language, LinkReplacerSettings } from '@/types';
import { formatBibleText } from '@/utils/formatBibleText';
import { loadBibleBooks } from '@/stores/bibleBooks';
import { logger } from '@/utils/logger';

export type TranslateFn = (key: string, variables?: Record<string, string>) => string;

export interface VerseCardContentInput {
  reference: BibleReference;
  /** null while the citation is still being fetched. */
  result: BibleCitationResult | null;
  settings: LinkReplacerSettings;
  language: Language;
  t: TranslateFn;
}

export type VerseCardState = 'loading' | 'ready' | 'unavailable';

/**
 * Plain data for the card. Deliberately free of markdown, callouts and template variables:
 * the card shows the verse name and the raw verse text, nothing else.
 */
export interface VerseCardContentView {
  heading: string;
  source: string;
  body: string;
  state: VerseCardState;
}

function fallbackReferenceLabel(reference: BibleReference): string {
  const verses = (reference.verseRanges ?? [])
    .map(({ start, end }) => (start === end ? String(start) : `${start}-${end}`))
    .join(',');
  return `${reference.book} ${reference.chapter}:${verses}`;
}

function resolveHeading(
  reference: BibleReference,
  bookLength: LinkReplacerSettings['bookLength'],
  language: Language,
): string {
  try {
    loadBibleBooks(language);
  } catch (error) {
    logger.warn('Verse card: Bible books unavailable for language', language, error);
  }

  try {
    return formatBibleText(reference, bookLength, language);
  } catch (error) {
    logger.warn('Verse card: could not format verse heading', error);
    return fallbackReferenceLabel(reference);
  }
}

export function buildVerseCardContent(input: VerseCardContentInput): VerseCardContentView {
  const { reference, result, settings, language, t } = input;
  const heading = resolveHeading(reference, settings.bookLength, language);

  if (!result) {
    return { heading, source: '', body: t('card.loading'), state: 'loading' };
  }

  const source = result.source === 'offline' ? t('card.sourceOffline') : t('card.sourceOnline');

  if (!result.success || !result.text.trim()) {
    return { heading, source, body: t('card.unavailable'), state: 'unavailable' };
  }

  return { heading, source, body: result.text, state: 'ready' };
}
