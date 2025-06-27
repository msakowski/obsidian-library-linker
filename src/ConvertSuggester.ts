import { App, FuzzySuggestModal } from 'obsidian';
import { TranslationService } from './services/TranslationService';
import { ConversionType } from './utils/convertLinks';

export class ConvertSuggester extends FuzzySuggestModal<string> {
  private t = TranslationService.getInstance().t.bind(TranslationService.getInstance());
  private onChoose: (type: ConversionType) => void;
  private convertTypes: ConversionType[] = ['all', 'bible', 'publication', 'web'];

  emptyStateText: string;

  constructor(app: App, onChoose: (type: ConversionType) => void) {
    super(app);
    this.onChoose = onChoose;
    this.emptyStateText = this.t('convertSuggester.emptyStateText');
  }

  getItems(): string[] {
    return this.convertTypes;
  }

  getItemText(type: ConversionType): string {
    return this.t(`convertSuggester.options.${type}`);
  }

  onChooseItem(type: ConversionType): void {
    this.onChoose(type);
  }
}
