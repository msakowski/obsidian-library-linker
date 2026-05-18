import { App, PluginSettingTab } from 'obsidian';
import type JWLibraryLinkerPlugin from '@/main';
import { renderGeneralSettings } from '@/settings/sections/generalSettings';
import { renderLinkStyling, updateLinkStylingPreview } from '@/settings/sections/linkStyling';
import { renderBibleQuote, updateBibleQuotePreview } from '@/settings/sections/bibleQuote';
import { renderOfflineBible } from '@/settings/sections/offlineBible';

export class JWLibraryLinkerSettings extends PluginSettingTab {
  plugin: JWLibraryLinkerPlugin;
  t: (key: string, variables?: Record<string, string>) => string;
  importInFlight = false;

  constructor(app: App, plugin: JWLibraryLinkerPlugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.t = this.plugin.getTranslationService().t.bind(this.plugin.getTranslationService());
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    const settingsContainer = containerEl.createDiv({ cls: 'jw-library-linker' });

    renderGeneralSettings(this, settingsContainer);
    renderLinkStyling(this, settingsContainer);
    renderBibleQuote(this, settingsContainer);
    void renderOfflineBible(this, settingsContainer);

    this.updatePreview();
    this.updateBibleQuotePreview();
  }

  updatePreview(): void {
    updateLinkStylingPreview(this);
  }

  updateBibleQuotePreview(): void {
    updateBibleQuotePreview(this);
  }
}
