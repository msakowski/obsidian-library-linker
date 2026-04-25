import { Language, LanguageInfo } from '@/types';
import languageJson from '@/consts/languages.json';

/**
 * Central language configuration.
 */
export const LANGUAGES: Record<Language, LanguageInfo> = Object.fromEntries(
  languageJson.map((lang) => [lang.code as Language, lang]),
) as Record<Language, LanguageInfo>;

type LanguageInfoPlus = Omit<LanguageInfo, 'code'> & { code: Language };

export const LANGUAGE_ARRAY = languageJson as LanguageInfoPlus[];

export const LANGUAGE_LABELS: Record<Language, string> = Object.fromEntries(
  languageJson.map((lang) => [lang.code as Language, lang.vernacular]),
) as Record<Language, string>;
