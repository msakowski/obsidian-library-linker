import type { Language, Locale } from '@/types';
import { LANGUAGE_ARRAY, LOCALES } from '@/consts/languages';
import { getBookLanguage } from '@/utils/signLanguage';

export function getLocaleFromLanguage(
  language: Language,
  { fallbackToSpoken = false }: { fallbackToSpoken?: boolean } = {},
): Locale | undefined {
  const resolved = fallbackToSpoken ? getBookLanguage(language) : language;
  const locale = LANGUAGE_ARRAY.find((l) => l.code === resolved)?.locale;
  if (locale && (LOCALES as readonly string[]).includes(locale)) {
    return locale as Locale;
  }
  return undefined;
}
