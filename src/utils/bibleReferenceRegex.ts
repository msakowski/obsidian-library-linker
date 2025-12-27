import type { Language } from '@/types';
import { getLanguageSpecificChars } from '@/utils/getLanguageSpecificChars';

export function getBibleReferenceRegex(language: Language): RegExp {
  const customChars = getLanguageSpecificChars(language);

  return new RegExp(
    `([1-5]{1}\\.?\\s?)?[a-z${customChars}]{1,24}\\.?\\s?\\d+:\\d+(?:-\\d+(?::\\d+)?)?(?:\\s*,\\s*\\d+(?:-\\d+)?)*`,
    'gi',
  );
}

// 24 random number. Apostelgeschichte is 17 characters long.
// should be enough for language support.
// For automatic detection, requires "chapter:verse" format to avoid false positives
// Single-chapter books are supported in manual parsing (parseBibleReference) with "Book verse" format
