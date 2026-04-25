import type { Language } from '@/types';

/**
 * Maps sign language codes to the spoken language whose Bible book names they use.
 * The sign language code itself is still used as the wtlocale URL parameter.
 */
export const SIGN_LANGUAGE_MAP: Partial<Record<Language, Language>> = {
  // English base
  ASL: 'E',
  BSL: 'E',
  AUS: 'E',
  NZS: 'E',
  ISG: 'E',
  JML: 'E',
  // German base
  DGS: 'X',
  OGS: 'X',
  // Finnish base
  FID: 'FI',
  // Spanish base
  LSM: 'S',
  LSE: 'S',
  LSA: 'S',
  BVL: 'S',
  SCH: 'S',
  LSC: 'S',
  SCR: 'S',
  CBS: 'S',
  SEC: 'S',
  LSG: 'S',
  SHO: 'S',
  LSN: 'S',
  PSL: 'S',
  LSP: 'S',
  SPE: 'S',
  LSS: 'S',
  LSU: 'S',
  LSV: 'S',
  // Dutch base
  NGT: 'O',
  // Korean base
  KSL: 'KO',
  // Portuguese base
  LGP: 'TPO',
  // French base
  LSF: 'F',
  SBF: 'F',
  LSQ: 'F',
  LSI: 'F',
  BFL: 'F',
  CRS: 'F',
  CML: 'F',
  // Croatian base
  HZJ: 'C',
  // Vietnamese base
  SLV: 'VT',
};

/** Returns the language to use for Bible book name lookup, resolving sign languages to their spoken base. */
export function getBookLanguage(language: Language): Language {
  return SIGN_LANGUAGE_MAP[language] ?? language;
}
