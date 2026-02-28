import type { Locale } from '@/types';
import BUNDLED_LOCALES from 'locale:all';

export type Translation = {
  settings: {
    language: { name: string; description: string };
    openAutomatically: { name: string; description: string };
    updatedLinkStructure: {
      name: string;
      description: string;
      keepCurrentStructure: string;
      usePluginSettings: string;
    };
    noLanguageParameter: { name: string; description: string };
    reconvertExistingLinks: { name: string; description: string };
    bookLength: { name: string; description: string; short: string; medium: string; long: string };
    linkStyling: {
      name: string;
      description: string;
      reset: string;
      prefixOutsideLink: { name: string; description: string };
      prefixInsideLink: { name: string; description: string };
      suffixInsideLink: { name: string; description: string };
      suffixOutsideLink: { name: string; description: string };
      presets: { name: string; description: string };
      fontStyle: {
        name: string;
        description: string;
        normal: string;
        italic: string;
        bold: string;
      };
      preview: { name: string };
    };
    bibleQuote: {
      name: string;
      description: string;
      format: {
        name: string;
        description: string;
        short: string;
        longFoldable: string;
        longExpanded: string;
      };
      calloutType: { name: string; description: string };
      preview: { name: string };
    };
  };
  commands: {
    linkUnlinkedBibleReferences: string;
    convertToJWLibraryLinks: string;
    insertBibleQuotes: string;
    insertBibleQuoteAtCursor: string;
  };
  convertSuggester: {
    emptyStateText: string;
    options: { all: string; bible: string; publication: string };
  };
  contextMenu: { insertBibleQuote: string };
  notices: {
    convertedBibleReferences: string;
    pleaseSelectText: string;
    noBibleReferencesFound: string;
    bibleQuotesInserted: string;
    bibleQuotesInsertedSelection: string;
    bibleQuoteInsertedAtCursor: string;
    noBibleLinksFound: string;
    noBibleLinkAtCursor: string;
    bibleQuoteAlreadyExists: string;
    errorInsertingQuotes: string;
  };
  suggestions: {
    createLink: string;
    createLinks: string;
    createAndOpen: string;
    createMultipleAndOpenFirst: string;
    typing: string;
    typingEmpty: string;
  };
  errors: {
    invalidVerseNumber: string;
    versesAscendingOrder: string;
    chaptersAscendingOrder: string;
    invalidVerseFormat: string;
    invalidReferenceFormat: string;
    unsupportedLanguage: string;
  };
};

export class TranslationService {
  private currentLocale: Locale = 'en';
  private translations = new Map<Locale, Translation>();

  /**
   * Initialize with the default locale
   * MUST be called during plugin.onload() before using t()
   */
  async initialize(locale?: Locale): Promise<void> {
    // Detect locale from Obsidian if not provided
    const detectedLocale = locale || this.detectObsidianLocale();
    await this.loadLocale(detectedLocale);
  }

  /**
   * Load a specific locale (async)
   * Can be called to switch languages at runtime
   */
  async loadLocale(locale: Locale): Promise<void> {
    // Return early if already loaded
    if (this.translations.has(locale)) {
      this.currentLocale = locale;
      return;
    }

    const localeFile = `locale/${locale}.yaml`;

    if (localeFile in BUNDLED_LOCALES) {
      const translation = BUNDLED_LOCALES[localeFile] as Translation;
      this.translations.set(locale, translation);
      this.currentLocale = locale;
    } else if (locale !== 'en') {
      // Fallback to English
      console.warn(`Locale ${locale} not found, falling back to English`);
      await this.loadLocale('en');
    } else {
      throw new Error('English locale not found in bundle');
    }
  }

  /**
   * Set locale (triggers async load if not cached)
   * Returns Promise to allow waiting for load completion
   */
  async setLocale(locale: Locale): Promise<void> {
    await this.loadLocale(locale);
  }

  public getCurrentLocale(): Locale {
    return this.currentLocale;
  }

  /**
   * Get translation for a key (synchronous)
   * Assumes the current locale has been loaded via initialize() or loadLocale()
   */
  public t(key: string, variables: Record<string, string> = {}): string {
    const translation = this.translations.get(this.currentLocale);

    if (!translation) {
      console.error(`Locale ${this.currentLocale} not loaded. Call initialize() first.`);
      return key;
    }

    const keys = key.split('.');

    // check if key is in translations. key is a dot separated path to the value like 'general.settings.title'
    const value = keys.reduce((acc: object | string, k) => {
      if (acc && typeof acc === 'object' && k in acc) {
        return acc[k as keyof typeof acc];
      }
      return acc;
    }, translation);

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

  private detectObsidianLocale(): Locale {
    try {
      // Only try to access localStorage in a browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        const obsidianLocale = window.localStorage.getItem('language');
        if (this.isValidLocale(obsidianLocale)) {
          return obsidianLocale as Locale;
        }
      }
    } catch (error) {
      // Fallback to default 'en' if localStorage is not available
      console.debug('Could not access localStorage, using default locale', error);
    }
    return 'en';
  }

  private isValidLocale(locale: string | null): boolean {
    return (
      locale === 'en' ||
      locale === 'de' ||
      locale === 'fi' ||
      locale === 'es' ||
      locale === 'nl' ||
      locale === 'ko' ||
      locale === 'pt' ||
      locale === 'fr' ||
      locale === 'hr'
    );
  }
}
