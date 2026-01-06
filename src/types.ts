export type Locale = 'en' | 'de' | 'fi' | 'es' | 'nl' | 'ko' | 'fr' | 'pt'; // obsidian language

export type Language = 'E' | 'X' | 'FI' | 'S' | 'O' | 'KO' | 'F' | 'TPO'; // plugin language

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

export const BIBLE_QUOTE_TEMPLATES = {
  short: '{bibleRefLinked}\n> {quote}',
  plain: '> {bibleRefLinked}\n> {quote}',
  foldable: '> [!quote]- {bibleRefLinked}\n> {quote}',
  expanded: '> [!quote] {bibleRefLinked}\n> {quote}',
} as const;

export interface BibleQuoteSettings {
  template: string; // Template for quote formatting
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

// Bible book IDs range from 1 (Genesis) to 66 (Revelation)
export type BibleBookId = number;

export interface VerseRange {
  start: number;
  end: number;
}

export interface BibleReference {
  book: BibleBookId;
  chapter: number;
  endChapter?: number; // For multi-chapter references (e.g., "Matt. 3:1-4:11")
  verseRanges?: VerseRange[]; // For complex verse references with multiple ranges
  isWholeChapter?: boolean; // True when referencing an entire chapter (e.g., "1 Kings 1")
}

export interface BibleSuggestion {
  text: string;
  command: 'formatBook' | 'link' | 'open' | 'typing';
  description: string;
  linkIndex?: number;
}
