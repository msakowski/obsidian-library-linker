import type { Language, UpdatedLinkStructure } from '@/types';
import { loadBibleBooks } from '@/stores/bibleBooks';
import { LANGUAGE_ARRAY } from '@/consts/languages';
import type { SettingDefinitionGroup } from 'obsidian';
import { LanguageSuggest } from '@/settings/LanguageSuggest';
import type { SettingsTabContext } from '@/settings/types';

const findVernacular = (settingCode: Language) =>
  LANGUAGE_ARRAY.find(({ code }) => code === settingCode)?.vernacular;

export function getGeneralSettingsDefinitions(tab: SettingsTabContext): SettingDefinitionGroup {
  return {
    type: 'group',
    cls: 'jw-library-linker',

    items: [
      {
        name: tab.t('settings.language.name'),
        desc: tab.t('settings.language.description'),
        render: (setting): void => {
          setting.addSearch((search) => {
            const currentVernacular =
              findVernacular(tab.plugin.settings.language) ?? tab.plugin.settings.language;
            search.setValue(currentVernacular);

            new LanguageSuggest(tab.plugin.app, search.inputEl, (lang) => {
              const vernacular = findVernacular(lang) ?? lang;
              search.setValue(vernacular);
              loadBibleBooks(lang);
              tab.plugin.settings.language = lang;
              void tab.plugin.saveSettings().then(() => tab.update());
            });
          });
        },
      },
      {
        name: tab.t('settings.openAutomatically.name'),
        desc: tab.t('settings.openAutomatically.description'),
        render: (setting): void => {
          setting.addToggle((toggle) =>
            toggle.setValue(tab.plugin.settings.openAutomatically).onChange(async (value) => {
              tab.plugin.settings.openAutomatically = value;
              await tab.plugin.saveSettings();
            }),
          );
        },
      },
      {
        name: tab.t('settings.updatedLinkStructure.name'),
        desc: tab.t('settings.updatedLinkStructure.description'),
        render: (setting): void => {
          setting.addDropdown((dropdown) =>
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
        },
      },
      {
        name: tab.t('settings.noLanguageParameter.name'),
        desc: tab.t('settings.noLanguageParameter.description'),
        render: (setting): void => {
          setting.addToggle((toggle) =>
            toggle.setValue(tab.plugin.settings.noLanguageParameter).onChange(async (value) => {
              tab.plugin.settings.noLanguageParameter = value;
              await tab.plugin.saveSettings();
              tab.updatePreview();
            }),
          );
        },
      },
      {
        name: tab.t('settings.reconvertExistingLinks.name'),
        desc: tab.t('settings.reconvertExistingLinks.description'),
        render: (setting): void => {
          setting.addToggle((toggle) =>
            toggle.setValue(tab.plugin.settings.reconvertExistingLinks).onChange(async (value) => {
              tab.plugin.settings.reconvertExistingLinks = value;
              await tab.plugin.saveSettings();
            }),
          );
        },
      },
    ],
  };
}
