import type { Language, Locale } from '@/types';
import { LANGUAGE_ARRAY } from '@/consts/languages';

export function getLanguageFromLocale(locale: Locale): Language | undefined {
  return LANGUAGE_ARRAY.find((l) => l.locale === locale)?.code;
}
