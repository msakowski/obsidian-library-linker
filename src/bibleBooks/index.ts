import { bibleBooksDE } from '@/bibleBooks/de';
import { bibleBooksEN } from '@/bibleBooks/en';
import type { BibleBook, Language } from '@/types';
import { Notice } from 'obsidian';
import { TranslationService } from '@/services/TranslationService';

export const getBibleBooks = (language: Language): readonly BibleBook[] | null => {
  const t = TranslationService.getInstance().t.bind(TranslationService.getInstance());

  switch (language) {
    case 'E':
      return bibleBooksEN;
    case 'X':
      return bibleBooksDE;
    default:
      new Notice(t('errors.unsupportedLanguage', { language }));
      return null;
  }
};
