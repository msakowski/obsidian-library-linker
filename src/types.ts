import { bibleBooksDE } from '@/bibleBooks/de';

export type Locale = 'en' | 'de' | 'fi' | 'es' | 'nl' | 'ko' | 'fr'; // obsidian language

export type Language = 'E' | 'X' | 'FI' | 'S' | 'O' | 'KO' | 'F'; // plugin language

export type BookLength = 'short' | 'medium' | 'long';

export interface LinkStyles {
  bookLength: BookLength;
  prefixOutsideLink: string;
  prefixInsideLink: string;
  suffixInsideLink: string;
  suffixOutsideLink: string;
  fontStyle: 'normal' | 'italic' | 'bold';
}

export type UpdatedLinkStructure = 'keepCurrentStructure' | 'usePluginSettings';

export type BibleQuoteFormat = 'short' | 'long-foldable' | 'long-expanded';

export interface BibleQuoteSettings {
  format: BibleQuoteFormat;
  calloutType: string; // e.g., 'quote', 'note', 'info'
}

export interface LinkReplacerSettings extends LinkStyles {
  language: Language;
  openAutomatically: boolean;
  updatedLinkStructure: UpdatedLinkStructure;
  noLanguageParameter: boolean;
  reconvertExistingLinks: boolean;
  bibleQuote: BibleQuoteSettings;
}

export interface BibleBook {
  id: number;
  prefix?: string;
  aliases: readonly string[];
  name: Record<BookLength, string>;
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
  endChapter?: number; // For multi-chapter references (e.g., "Matt. 3:1-4:11")
  verseRanges?: VerseRange[]; // For complex verse references with multiple ranges
}

export interface BibleSuggestion {
  text: string;
  command: 'formatBook' | 'link' | 'open' | 'typing';
  description: string;
  linkIndex?: number;
}
