import type { BibleCitationProvider, BibleCitationResult, BibleReference, Language } from '@/types';
import type { OfflineBibleRepository } from '@/types';
import { formatBibleText } from '@/utils/formatBibleText';
import { getLanguageLabel } from '@/utils/languageMetadata';

export class OfflineBibleCitationProvider implements BibleCitationProvider {
  constructor(private readonly repository: OfflineBibleRepository) {}

  async getCitation(reference: BibleReference, language: Language): Promise<BibleCitationResult> {
    const metadata = await this.repository.getMetadata(language);

    if (!metadata) {
      return {
        success: false,
        source: 'offline',
        text: '',
        citation: '',
        error: `No offline Bible is installed for ${getLanguageLabel(language)}. Import a Bible EPUB in settings to enable offline quotes.`,
      };
    }

    const text = await this.repository.getVerseRange(reference, language);

    if (!text) {
      return {
        success: false,
        source: 'offline',
        text: '',
        citation: '',
        error: `The requested verses are missing or unreadable in the offline Bible for ${getLanguageLabel(language)}.`,
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
