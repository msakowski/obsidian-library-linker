import { bibleBooksDE } from '@/bibleBooks';

export interface LinkReplacerSettings {
  useShortNames: boolean;
}

export interface BibleBook {
  id: number;
  aliases: readonly string[];
  longName: string;
  shortName: string;
}

export type BibleBookAbbreviations = readonly string[];
export type BibleBooks = readonly BibleBookAbbreviations[];

export type BibleBookId = (typeof bibleBooksDE)[number]['id'];

export interface BibleReference {
  book: string;
  chapter: string;
  verse: string;
  endVerse?: string;
}

export interface BibleSuggestion {
  text: string;
  command: 'link' | 'open';
  description: string;
}
