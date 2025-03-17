import { en } from '@/locale/en';
import { de } from '@/locale/de';
import type { Locale } from '@/types';

export class TranslationService {
  private static instance: TranslationService;
  private currentLocale: Locale = 'en';
  private translations: Record<Locale, typeof en> = {
    en,
    de,
  };

  private constructor() {
    try {
      // Only try to access localStorage in a browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        const obsidianLocale = window.localStorage.getItem('language');
        if (obsidianLocale === 'en' || obsidianLocale === 'de') {
          this.currentLocale = obsidianLocale;
        }
      }
    } catch (error) {
      // Fallback to default 'en' if localStorage is not available
      console.debug('Could not access localStorage, using default locale', error);
    }
  }

  public static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  public setLocale(locale: Locale): void {
    this.currentLocale = locale;
  }

  public getCurrentLocale(): Locale {
    return this.currentLocale;
  }

  public t(key: string, variables: Record<string, string> = {}): string {
    const keys = key.split('.');
    let value: any = this.translations[this.currentLocale];

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
