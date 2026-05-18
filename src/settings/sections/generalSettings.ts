import { Setting } from 'obsidian';
import type { Language, UpdatedLinkStructure } from '@/types';
import { loadBibleBooks } from '@/stores/bibleBooks';
import { LANGUAGE_ARRAY } from '@/consts/languages';
import { createSettingGroup } from '@/settings/createSettingGroup';
import { LanguageSuggest } from '@/settings/LanguageSuggest';
import type { SettingsTabContext } from '@/settings/types';

const findVernacular = (settingCode: Language) =>
  LANGUAGE_ARRAY.find(({ code }) => code === settingCode)?.vernacular;

export function renderGeneralSettings(tab: SettingsTabContext, container: HTMLElement): void {
  const items = createSettingGroup(container);

  new Setting(items)
    .setName(tab.t('settings.language.name'))
    .setDesc(tab.t('settings.language.description'))
    .addSearch((search) => {
      const currentVernacular =
        findVernacular(tab.plugin.settings.language) ?? tab.plugin.settings.language;
      search.setValue(currentVernacular);

      new LanguageSuggest(tab.plugin.app, search.inputEl, (lang) => {
        const vernacular = findVernacular(lang) ?? lang;
        search.setValue(vernacular);
        loadBibleBooks(lang);
        tab.plugin.settings.language = lang;
        void tab.plugin.saveSettings().then(() => tab.display());
      });
    });

  new Setting(items)
    .setName(tab.t('settings.openAutomatically.name'))
    .setDesc(tab.t('settings.openAutomatically.description'))
    .addToggle((toggle) =>
      toggle.setValue(tab.plugin.settings.openAutomatically).onChange(async (value) => {
        tab.plugin.settings.openAutomatically = value;
        await tab.plugin.saveSettings();
      }),
    );

  new Setting(items)
    .setName(tab.t('settings.updatedLinkStructure.name'))
    .setDesc(tab.t('settings.updatedLinkStructure.description'))
    .addDropdown((dropdown) =>
      dropdown
        .addOptions({
          keepCurrentStructure: tab.t('settings.updatedLinkStructure.keepCurrentStructure'),
          usePluginSettings: tab.t('settings.updatedLinkStructure.usePluginSettings'),
        })
        .setValue(tab.plugin.settings.updatedLinkStructure)
        .onChange(async (value) => {
          tab.plugin.settings.updatedLinkStructure = value as UpdatedLinkStructure;
          await tab.plugin.saveSettings();
        }),
    );

  new Setting(items)
    .setName(tab.t('settings.noLanguageParameter.name'))
    .setDesc(tab.t('settings.noLanguageParameter.description'))
    .addToggle((toggle) =>
      toggle.setValue(tab.plugin.settings.noLanguageParameter).onChange(async (value) => {
        tab.plugin.settings.noLanguageParameter = value;
        await tab.plugin.saveSettings();
        tab.updatePreview();
      }),
    );

  new Setting(items)
    .setName(tab.t('settings.reconvertExistingLinks.name'))
    .setDesc(tab.t('settings.reconvertExistingLinks.description'))
    .addToggle((toggle) =>
      toggle.setValue(tab.plugin.settings.reconvertExistingLinks).onChange(async (value) => {
        tab.plugin.settings.reconvertExistingLinks = value;
        await tab.plugin.saveSettings();
      }),
    );
}
