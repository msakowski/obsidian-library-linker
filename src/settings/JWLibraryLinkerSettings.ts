import { App, PluginSettingTab } from 'obsidian';
import type { SettingDefinitionItem } from 'obsidian';
import type JWLibraryLinkerPlugin from '@/main';
import { getGeneralSettingsDefinitions } from '@/settings/sections/generalSettings';
import {
  getLinkStylingDefinitions,
  updateLinkStylingPreview,
} from '@/settings/sections/linkStyling';
import { getBibleQuoteDefinitions, updateBibleQuotePreview } from '@/settings/sections/bibleQuote';
import { getOfflineBibleDefinitions } from '@/settings/sections/offlineBible';

export class JWLibraryLinkerSettings extends PluginSettingTab {
  plugin: JWLibraryLinkerPlugin;
  t: (key: string, variables?: Record<string, string>) => string;
  importInFlight = false;

  constructor(app: App, plugin: JWLibraryLinkerPlugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.t = this.plugin.getTranslationService().t.bind(this.plugin.getTranslationService());
  }

  override getSettingDefinitions(): SettingDefinitionItem[] {
    return [
      getGeneralSettingsDefinitions(this),
      getLinkStylingDefinitions(this),
      getBibleQuoteDefinitions(this),
      getOfflineBibleDefinitions(this),
    ];
  }

  updatePreview(): void {
    updateLinkStylingPreview(this);
  }

  updateBibleQuotePreview(): void {
    updateBibleQuotePreview(this);
  }
}
