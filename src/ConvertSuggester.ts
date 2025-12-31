import { App, FuzzySuggestModal } from 'obsidian';
import { ConversionType } from './utils/convertLinks';
import type JWLibraryLinkerPlugin from '@/main';

export class ConvertSuggester extends FuzzySuggestModal<string> {
  private plugin: JWLibraryLinkerPlugin;
  private t: (key: string, variables?: Record<string, string>) => string;
  private onChoose: (type: ConversionType) => void;
  private convertTypes: ConversionType[] = ['all', 'bible', 'publication'];

  emptyStateText: string;

  constructor(app: App, plugin: JWLibraryLinkerPlugin, onChoose: (type: ConversionType) => void) {
    super(app);
    this.plugin = plugin;
    this.t = this.plugin.getTranslationService().t.bind(this.plugin.getTranslationService());
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
