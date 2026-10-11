import { Notice, Platform, Setting } from 'obsidian';
import type { Language } from '@/types';
import {
  getOfflineBibleAbsolutePath,
  getOfflineBibleVaultPath,
} from '@/services/PluginDataPathService';
import { logger } from '@/utils/logger';
import { LANGUAGE_LABELS } from '@/consts/languages';
import type { SettingsTabContext } from '@/settings/types';
import type { SettingDefinitionGroup } from 'obsidian';

export function getOfflineBibleDefinitions(tab: SettingsTabContext): SettingDefinitionGroup {
  return {
    type: 'group',
    cls: 'jw-library-linker',
    heading: tab.t('settings.offlineBible.name'),
    items: [
      {
        name: tab.t('settings.offlineBible.enabled.name'),
        desc: tab.t('settings.offlineBible.enabled.description'),
        render: (setting, group): void => {
          const description = group.listEl.createDiv({
            cls: 'setting-item-description',
            text: tab.t('settings.offlineBible.description'),
          });
          group.listEl.prepend(description);
          setting.addToggle((toggle) =>
            toggle.setValue(tab.plugin.settings.offlineBible.enabled).onChange(async (value) => {
              tab.plugin.settings.offlineBible.enabled = value;
              await tab.plugin.saveSettings();
              tab.update();
            }),
          );
        },
      },
      {
        name: tab.t('settings.offlineBible.preferOffline.name'),
        desc: tab.t('settings.offlineBible.preferOffline.description'),
        render: (setting): void => {
          setting.addToggle((toggle) =>
            toggle
              .setValue(tab.plugin.settings.offlineBible.preferOffline)
              .setDisabled(!tab.plugin.settings.offlineBible.enabled)
              .onChange(async (value) => {
                tab.plugin.settings.offlineBible.preferOffline = value;
                await tab.plugin.saveSettings();
                tab.update();
              }),
          );
        },
      },
      {
        name: tab.t('settings.offlineBible.allowOnlineFallback.name'),
        desc: tab.t('settings.offlineBible.allowOnlineFallback.description'),
        render: (setting): void => {
          setting.addToggle((toggle) =>
            toggle
              .setValue(tab.plugin.settings.offlineBible.allowOnlineFallback)
              .setDisabled(!tab.plugin.settings.offlineBible.enabled)
              .onChange(async (value) => {
                tab.plugin.settings.offlineBible.allowOnlineFallback = value;
                await tab.plugin.saveSettings();
              }),
          );
        },
      },
      {
        name: tab.t('settings.offlineBible.actions.name'),
        desc: tab.t('settings.offlineBible.actions.description'),
        render: (setting): void => {
          const actionsSetting = setting.addButton((button) => {
            if (tab.importInFlight) {
              button
                .setButtonText(tab.t('settings.offlineBible.actions.importing'))
                .setDisabled(true);
            } else {
              button
                .setButtonText(tab.t('settings.offlineBible.actions.import'))
                .setCta()
                .onClick(() => {
                  void handleBibleImport(tab);
                });
            }
          });
          if (Platform.isDesktopApp) {
            actionsSetting.addButton((button) =>
              button
                .setButtonText(tab.t('settings.offlineBible.actions.openFolder'))
                .onClick(() => {
                  void openOfflineBibleFolder(tab);
                }),
            );
          }
        },
      },
      {
        name: tab.t('settings.offlineBible.installedList.name'),
        desc: tab.t('settings.offlineBible.installedList.description'),
        render: (_setting, group): void => {
          const container = group.listEl.createDiv();
          void renderInstalledBibleList(tab, container);
        },
      },
    ],
  };
}

async function renderInstalledBibleList(
  tab: SettingsTabContext,
  wrapper: HTMLElement,
): Promise<void> {
  const repository = tab.plugin.getOfflineBibleRepository();
  const installedLanguages = (await repository?.getInstalledLanguages()) ?? [];
  const entries = await Promise.all(
    installedLanguages.map(async (language) => ({
      language,
      metadata: (await repository?.getMetadata(language)) ?? null,
    })),
  );

  const container = wrapper.createDiv();

  if (entries.length === 0) {
    container.createDiv({
      text: tab.t('settings.offlineBible.installedList.empty'),
      cls: 'setting-item-description',
    });
    return;
  }

  for (const { language, metadata } of entries) {
    if (!metadata) continue;

    new Setting(container)
      .setName(LANGUAGE_LABELS[language])
      // .setDesc(
      //   tab.t('settings.offlineBible.installedList.entry', {
      //     sourceFileName: metadata.sourceFileName,
      //     chapterCount: String(metadata.chapterCount),
      //     importedAt: new Date(metadata.importedAt).toLocaleString(),
      //   }),
      // )
      .addButton((button) =>
        button
          .setButtonText(tab.t('settings.offlineBible.actions.remove'))
          .setIcon('trash')
          .setDestructive()
          .onClick(() => {
            void handleBibleRemoval(tab, language);
          }),
      );
  }
}

async function handleBibleImport(tab: SettingsTabContext): Promise<void> {
  const selectedFile = await selectEpubFile(tab);
  if (!selectedFile) return;

  const importService = tab.plugin.getEpubImportService();
  tab.importInFlight = true;
  tab.update();

  try {
    const result = await importService.importBible({
      fileData: new Uint8Array(await selectedFile.arrayBuffer()),
      sourceFileName: selectedFile.name,
      overwriteExisting: false,
    });

    if (!result.success) {
      if (result.language) {
        new Notice(
          tab.t('notices.offlineBibleAlreadyInstalled', {
            language: LANGUAGE_LABELS[result.language],
          }),
        );
      } else {
        new Notice(result.error ?? tab.t('notices.offlineBibleImportFailed'));
      }
      return;
    }

    new Notice(
      tab.t('notices.offlineBibleImported', {
        language: LANGUAGE_LABELS[result.language ?? tab.plugin.settings.language],
      }),
    );
  } finally {
    tab.importInFlight = false;
    tab.update();
  }
}

async function handleBibleRemoval(tab: SettingsTabContext, language: Language): Promise<void> {
  await tab.plugin.getOfflineBibleRepository()?.removeLanguage(language);
  new Notice(tab.t('notices.offlineBibleRemoved', { language: LANGUAGE_LABELS[language] }));
  tab.update();
}

async function openOfflineBibleFolder(tab: SettingsTabContext): Promise<void> {
  if (!Platform.isDesktop) return;
  const vaultPath = getOfflineBibleVaultPath(tab.app, tab.plugin.manifest.id);
  if (!(await tab.app.vault.adapter.exists(vaultPath))) {
    await tab.app.vault.adapter.mkdir(vaultPath);
  }
  const folderPath = getOfflineBibleAbsolutePath(tab.app, tab.plugin.manifest.id);
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- dynamic require for desktop-only Electron API
  const { shell } = require('electron') as typeof import('electron');
  const error = await shell.openPath(folderPath);

  if (error) {
    logger.error(error);
    new Notice(tab.t('notices.offlineBibleOpenFolderFailed'));
  }
}

function selectEpubFile(tab: SettingsTabContext): Promise<File | null> {
  return new Promise((resolve) => {
    const input = tab.containerEl.createEl('input');
    input.type = 'file';
    input.accept = '.epub,application/epub+zip';
    input.hidden = true;

    input.addEventListener('change', () => {
      resolve(input.files?.[0] ?? null);
      input.remove();
    });
    input.addEventListener('cancel', () => {
      resolve(null);
      input.remove();
    });

    input.click();
  });
}
