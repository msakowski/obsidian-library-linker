import { bibleBooksDE } from '@/bibleBooks/de';
import { bibleBooksEN } from '@/bibleBooks/en';
import { bibleBooksFI } from '@/bibleBooks/fi';
import { bibleBooksES } from '@/bibleBooks/es';
import { chapterCounts } from '@/bibleBooks/chapterCounts';
import type { BibleBook, Language } from '@/types';

type BibleBookWithoutChapters = Omit<BibleBook, 'chapters'>;

export const getBibleBooks = (language: Language): readonly BibleBook[] => {
  let books: readonly BibleBookWithoutChapters[];
  switch (language) {
    case 'E':
      books = bibleBooksEN;
      break;
    case 'X':
      books = bibleBooksDE;
      break;
    case 'FI':
      books = bibleBooksFI;
      break;
    case 'S':
      books = bibleBooksES;
      break;
    default:
      throw new Error('errors.unsupportedLanguage');
  }
  return books.map((book) => ({
    ...book,
    chapters: chapterCounts[book.id],
  }));
};

export const getBibleBookById = (id: number, language: Language): BibleBook | undefined => {
  return getBibleBooks(language).find((book) => book.id === id);
};

export const bibleBookExists = (id: number): boolean => {
  return id >= 1 && id <= 66;
};
