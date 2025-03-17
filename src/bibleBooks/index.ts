import { bibleBooksDE } from '@/bibleBooks/de';
import { bibleBooksEN } from '@/bibleBooks/en';
import type { BibleBook, Language } from '@/types';

export const getBibleBooks = (language: Language): readonly BibleBook[] => {
  switch (language) {
    case 'E':
      return bibleBooksEN;
    case 'X':
      return bibleBooksDE;
    default:
      throw new Error('errors.unsupportedLanguage');
  }
};

export const getBibleBookById = (id: number, language: Language): BibleBook | undefined => {
  return getBibleBooks(language).find((book) => book.id === id);
};

export const bibleBookExists = (id: number): boolean => {
  return id >= 1 && id <= 66;
};
