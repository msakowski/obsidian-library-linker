import { en } from '@/locale/en';
import { de } from '@/locale/de';
import { fi } from '@/locale/fi';
import { es } from '@/locale/es';
import type { Locale } from '@/types';

type Translation = typeof en;

export class TranslationService {
  private static instance: TranslationService;
  private currentLocale: Locale = 'en';
  private translations: Record<Locale, Translation> = {
    en,
    de,
    fi,
    es,
  };

  private constructor() {
    try {
      // Only try to access localStorage in a browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        const obsidianLocale = window.localStorage.getItem('language');
        if (
          obsidianLocale === 'en' ||
          obsidianLocale === 'de' ||
          obsidianLocale === 'fi' ||
          obsidianLocale === 'es'
        ) {
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
    const translations: Translation = this.translations[this.currentLocale];

    // check if key is in translations. key is a dot separated path to the value like 'general.settings.title'
    const value = keys.reduce((acc: object | string, k) => {
      if (acc && typeof acc === 'object' && k in acc) {
        return acc[k as keyof typeof acc];
      }
      return acc;
    }, translations);

    if (typeof value === 'string') {
      return this.replaceVariables(value, variables);
    }

    return key;
  }

  private replaceVariables(text: string, variables: Record<string, string>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
      return variables[key] || match;
    });
  }
}
