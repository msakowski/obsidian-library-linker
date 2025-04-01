import { bibleBooksDE } from '@/bibleBooks/de';

export type Locale = 'en' | 'de' | 'fi'; // obsidian language

export type Language = 'E' | 'X' | 'FI'; // plugin language

export interface LinkStyles {
  prefixOutsideLink: string;
  prefixInsideLink: string;
  suffixInsideLink: string;
  suffixOutsideLink: string;
  fontStyle: 'normal' | 'italic' | 'bold';
}

export interface LinkReplacerSettings extends LinkStyles {
  useShortNames: boolean;
  language: Language;
  openAutomatically: boolean;
  updatedLinkStrukture: 'keepCurrentStructure' | 'usePluginSettings';
  noLanguageParameter: boolean;
}

export interface BibleBook {
  id: number;
  prefix?: string;
  aliases: readonly string[];
  longName: string;
  shortName: string;
  chapters: number;
}

export type BibleBookAbbreviations = readonly string[];
export type BibleBooks = readonly BibleBookAbbreviations[];

export type BibleBookId = (typeof bibleBooksDE)[number]['id'];

export interface VerseRange {
  start: number;
  end: number;
}

export interface BibleReference {
  book: BibleBookId;
  chapter: number;
  verseRanges?: VerseRange[]; // For complex verse references with multiple ranges
}

export interface BibleSuggestion {
  text: string;
  command: 'formatBook' | 'link' | 'open' | 'typing';
  description: string;
  linkIndex?: number;
}
