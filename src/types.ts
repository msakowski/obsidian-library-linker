import { bibleBooksDE } from '@/bibleBooks';

export interface LinkReplacerSettings {
  useShortNames: boolean;
}

export interface BibleBook {
  id: number;
  prefix?: string;
  aliases: readonly string[];
  longName: string;
  shortName: string;
}

export type BibleBookAbbreviations = readonly string[];
export type BibleBooks = readonly BibleBookAbbreviations[];

export type BibleBookId = (typeof bibleBooksDE)[number]['id'];

export interface VerseRange {
  start: string;
  end: string;
}

export interface BibleReference {
  book: string;
  chapter: string;
  verseRanges?: VerseRange[]; // For complex verse references with multiple ranges
}

export interface BibleSuggestion {
  text: string;
  command: 'link' | 'open';
  description: string;
  linkIndex?: number;
}
