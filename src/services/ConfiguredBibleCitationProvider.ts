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

  async getCitation(reference: BibleReference, language: Language): Promise<BibleCitationResult> {
    const settings = this.getSettings();
    const { offlineBible } = settings;

    if (offlineBible.enabled && offlineBible.preferOffline) {
      const offlineResult = await this.offlineProvider.getCitation(reference, language);
      if (offlineResult.success) {
        return offlineResult;
      }

      if (!offlineBible.allowOnlineFallback) {
        return {
          ...offlineResult,
          error: `${offlineResult.error ?? this.t('errors.offlineBibleLookupFailed')} ${this.t('errors.onlineFallbackDisabled')}`,
        };
      }
    }

    const onlineResult = await this.onlineProvider.getCitation(reference, language);
    if (onlineResult.success) {
      return onlineResult;
    }

    if (offlineBible.enabled && !offlineBible.preferOffline) {
      const offlineResult = await this.offlineProvider.getCitation(reference, language);
      if (offlineResult.success) {
        return offlineResult;
      }

      return {
        ...onlineResult,
        error: offlineBible.allowOnlineFallback
          ? onlineResult.error
          : (offlineResult.error ?? onlineResult.error),
      };
    }

    return onlineResult;
  }

  async isLanguageAvailable(language: Language): Promise<boolean> {
    const settings = this.getSettings();

    if (settings.offlineBible.enabled && settings.offlineBible.preferOffline) {
      const offlineAvailable = await this.offlineProvider.isLanguageAvailable(language);
      if (offlineAvailable || !settings.offlineBible.allowOnlineFallback) {
        return offlineAvailable;
      }
    }

    const onlineAvailable = await this.onlineProvider.isLanguageAvailable(language);
    if (onlineAvailable) {
      return true;
    }

    if (settings.offlineBible.enabled && !settings.offlineBible.preferOffline) {
      return this.offlineProvider.isLanguageAvailable(language);
    }

    return false;
  }
}
