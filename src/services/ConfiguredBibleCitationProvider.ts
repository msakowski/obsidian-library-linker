import type {
  BibleCitationProvider,
  BibleCitationResult,
  BibleReference,
  Language,
  LinkReplacerSettings,
} from '@/types';

type TranslateFn = (key: string, variables?: Record<string, string>) => string;

export class ConfiguredBibleCitationProvider implements BibleCitationProvider {
  constructor(
    private readonly getSettings: () => LinkReplacerSettings,
    private readonly offlineProvider: BibleCitationProvider,
    private readonly onlineProvider: BibleCitationProvider,
    private readonly t: TranslateFn,
  ) {}

  /**
   * Offline first: the imported Bible is always checked first. The online
   * provider is only asked when the offline lookup fails and online fallback
   * is allowed.
   */
  async getCitation(reference: BibleReference, language: Language): Promise<BibleCitationResult> {
    const offlineResult = await this.offlineProvider.getCitation(reference, language);
    if (offlineResult.success) {
      return offlineResult;
    }

    if (!this.getSettings().offlineBible.allowOnlineFallback) {
      return {
        ...offlineResult,
        error: `${offlineResult.error ?? this.t('errors.offlineBibleLookupFailed')} ${this.t('errors.onlineFallbackDisabled')}`,
      };
    }

    return this.onlineProvider.getCitation(reference, language);
  }

  async isLanguageAvailable(language: Language): Promise<boolean> {
    if (await this.offlineProvider.isLanguageAvailable(language)) {
      return true;
    }

    if (!this.getSettings().offlineBible.allowOnlineFallback) {
      return false;
    }

    return this.onlineProvider.isLanguageAvailable(language);
  }
}
