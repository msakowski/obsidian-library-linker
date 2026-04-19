import type { BibleCitationProvider, BibleCitationResult, BibleReference, Language } from '@/types';
import { BibleTextFetcher } from '@/services/BibleTextFetcher';

export class OnlineBibleCitationProvider implements BibleCitationProvider {
  async getCitation(reference: BibleReference, language: Language): Promise<BibleCitationResult> {
    const result = await BibleTextFetcher.fetchBibleText(reference, language);

    return {
      success: result.success,
      source: 'online',
      text: result.text,
      citation: result.citation,
      error: result.error,
    };
  }

  isLanguageAvailable(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
