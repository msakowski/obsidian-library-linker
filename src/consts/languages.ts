import { Language, LanguageInfo } from '@/types';
import languageJson from '@/consts/languages.json';

// obsidian language
export const LOCALES = [
  'cs',
  'da',
  'de',
  'en',
  'es',
  'fi',
  'fr',
  'hr',
  'ko',
  'nl',
  'pt_pt',
  'vi',
] as const;

// plugin language
export const LANGUAGE_CODES = [
  'B',
  'C',
  'D',
  'E',
  'F',
  'FI',
  'KO',
  'O',
  'S',
  'TPO',
  'VT',
  'X',
  // Sign languages
  'ASL',
  'AUS',
  'BFL',
  'BSL',
  'BVL',
  'CBS',
  'CML',
  'CRS',
  'DGS',
  'FID',
  'HZJ',
  'ISG',
  'JML',
  'KSL',
  'LGP',
  'LSA',
  'LSC',
  'LSE',
  'LSF',
  'LSG',
  'LSI',
  'LSM',
  'LSN',
  'LSP',
  'LSQ',
  'LSS',
  'LSU',
  'LSV',
  'NGT',
  'NZS',
  'OGS',
  'PSL',
  'SBF',
  'SCH',
  'SCR',
  'SEC',
  'SHO',
  'SLV',
  'SPE',
] as const;

/**
 * Central language configuration.
 */
export const LANGUAGES = Object.fromEntries(
  languageJson.map((lang) => [lang.code as Language, lang]),
) as Record<Language, LanguageInfo>;

type LanguageInfoPlus = Omit<LanguageInfo, 'code'> & { code: Language };

const LANGUAGE_ARRAY = languageJson as LanguageInfoPlus[];

export const LANGUAGE_LABELS: Record<Language, string> = Object.fromEntries(
  languageJson.map((lang) => [lang.code as Language, lang.vernacular]),
) as Record<Language, string>;
