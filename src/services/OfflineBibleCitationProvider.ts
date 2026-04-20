import { LANGUAGE_LABELS } from '@/consts/languages';
import type { BibleCitationProvider, BibleCitationResult, BibleReference, Language } from '@/types';
import type { OfflineBibleRepository } from '@/types';
import { formatBibleText } from '@/utils/formatBibleText';

type TranslateFn = (key: string, variables?: Record<string, string>) => string;

export class OfflineBibleCitationProvider implements BibleCitationProvider {
  constructor(
    private readonly repository: OfflineBibleRepository,
    private readonly t: TranslateFn,
  ) {}

  async getCitation(reference: BibleReference, language: Language): Promise<BibleCitationResult> {
    const metadata = await this.repository.getMetadata(language);

    if (!metadata) {
      return {
        success: false,
        source: 'offline',
        text: '',
        citation: '',
        error: this.t('errors.offlineBibleNotInstalled', { language: LANGUAGE_LABELS[language] }),
      };
    }

    const text = await this.repository.getVerseRange(reference, language);

    if (!text) {
      return {
        success: false,
        source: 'offline',
        text: '',
        citation: '',
        error: this.t('errors.offlineBibleVerseMissing', { language: LANGUAGE_LABELS[language] }),
      };
    }

    return {
      success: true,
      source: 'offline',
      text,
      citation: formatBibleText(reference, 'medium', language),
    };
  }

  async isLanguageAvailable(language: Language): Promise<boolean> {
    return (await this.repository.getMetadata(language)) !== null;
  }
}
