import type { Language } from '@/types';

export const LANGUAGE_LABELS: Record<Language, string> = {
  E: 'English',
  X: 'Deutsch',
  FI: 'Suomi',
  S: 'Español',
  O: 'Nederlands',
  KO: '한국어',
  TPO: 'Português (Portugal)',
  F: 'Français',
  C: 'Hrvatski',
  VT: 'Việt',
};

const EPUB_LANGUAGE_TO_PLUGIN_LANGUAGE: Record<string, Language> = {
  en: 'E',
  de: 'X',
  fi: 'FI',
  es: 'S',
  nl: 'O',
  ko: 'KO',
  fr: 'F',
  pt: 'TPO',
  'pt-pt': 'TPO',
  hr: 'C',
  vi: 'VT',
};

export function getLanguageLabel(language: Language): string {
  return LANGUAGE_LABELS[language];
}

export function mapEpubLanguageToPluginLanguage(language: string): Language | null {
  const normalized = language.trim().toLowerCase().replace('_', '-');
  return EPUB_LANGUAGE_TO_PLUGIN_LANGUAGE[normalized] ?? null;
}
