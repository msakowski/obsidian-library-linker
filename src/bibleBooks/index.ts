import { bibleBooksDE } from '@/bibleBooks/de';
import { bibleBooksEN } from '@/bibleBooks/en';
import type { Language } from '@/types';

export const getBibleBooks = (language: Language) => {
  switch (language) {
    case 'E':
      return bibleBooksEN;
    case 'X':
      return bibleBooksDE;
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
};
