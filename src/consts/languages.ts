import { Language, LanguageInfo } from '@/types';
import languageJson from '@/consts/languages.json';

// obsidian language
export const LOCALES = [
  'en',
  'de',
  'fi',
  'es',
  'nl',
  'ko',
  'fr',
  'pt_pt',
  'hr',
  'vi',
  'cs',
] as const;

// plugin language
export const LANGUAGE_CODES = [
  'E',
  'X',
  'FI',
  'S',
  'O',
  'KO',
  'F',
  'TPO',
  'C',
  'VT',
  'B',
  // Sign languages
  'ASL',
  'LSA',
  'AUS',
  'OGS',
  'SBF',
  'BVL',
  'BSL',
  'BFL',
  'CRS',
  'SCH',
  'LSC',
  'SCR',
  'HZJ',
  'CBS',
  'NGT',
  'SEC',
  'FID',
  'LSF',
  'DGS',
  'LSG',
  'SHO',
  'ISG',
  'LSI',
  'JML',
  'KSL',
  'CML',
  'LSM',
  'NZS',
  'LSN',
  'PSL',
  'LSP',
  'SPE',
  'LGP',
  'LSQ',
  'LSS',
  'LSE',
  'LSU',
  'LSV',
  'SLV',
] as const;

/**
 * Central language configuration.
 */
export const LANGUAGES = Object.fromEntries(
  languageJson.map((lang) => [lang.code as Language, lang]),
) as Record<Language, LanguageInfo>;

type LanguageInfoPlus = Omit<LanguageInfo, 'code'> & { code: Language };

export const LANGUAGE_ARRAY = languageJson as LanguageInfoPlus[];

export const LANGUAGE_LABELS: Record<Language, string> = Object.fromEntries(
  languageJson.map((lang) => [lang.code as Language, lang.vernacular]),
) as Record<Language, string>;
