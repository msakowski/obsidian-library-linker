import { en } from '@/locale/en';
import { de } from '@/locale/de';
import type { Language } from '@/types';

export class TranslationService {
  private static instance: TranslationService;
  private currentLanguage: Language = 'en';
  private translations: Record<Language, typeof en> = {
    en,
    de,
  };

  private constructor() {}

  public static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  public setLanguage(language: Language): void {
    this.currentLanguage = language;
  }

  public t(key: string, variables: Record<string, string> = {}): string {
    const keys = key.split('.');
    let value: any = this.translations[this.currentLanguage];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    if (typeof value === 'string') {
      return this.replaceVariables(value, variables);
    }

    return key;
  }

  private replaceVariables(text: string, variables: Record<string, string>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }
}
