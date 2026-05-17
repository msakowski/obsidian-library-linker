import { Notice, Platform, Setting } from 'obsidian';
import type { Language } from '@/types';
import { getOfflineBibleAbsolutePath } from '@/services/PluginDataPathService';
import { logger } from '@/utils/logger';
import { LANGUAGE_LABELS } from '@/consts/languages';
import type { SettingsTabContext } from '@/settings/types';
import { createSettingGroup } from '@/settings/createSettingGroup';

export async function renderOfflineBible(
  tab: SettingsTabContext,
  container: HTMLElement,
): Promise<void> {
  const items = createSettingGroup(
    container,
    tab.t('settings.offlineBible.name'),
    tab.t('settings.offlineBible.description'),
  );

  const content = items.createDiv();
  await renderOfflineBibleContent(tab, content);
}

async function renderOfflineBibleContent(
  tab: SettingsTabContext,
  container: HTMLElement,
): Promise<void> {
  container.empty();

  new Setting(container)
    .setName(tab.t('settings.offlineBible.enabled.name'))
    .setDesc(tab.t('settings.offlineBible.enabled.description'))
    .addToggle((toggle) =>
      toggle.setValue(tab.plugin.settings.offlineBible.enabled).onChange(async (value) => {
        tab.plugin.settings.offlineBible.enabled = value;
        await tab.plugin.saveSettings();
        void renderOfflineBibleContent(tab, container);
      }),
    );

  new Setting(container)
    .setName(tab.t('settings.offlineBible.preferOffline.name'))
    .setDesc(tab.t('settings.offlineBible.preferOffline.description'))
    .addToggle((toggle) =>
      toggle
        .setValue(tab.plugin.settings.offlineBible.preferOffline)
        .setDisabled(!tab.plugin.settings.offlineBible.enabled)
        .onChange(async (value) => {
          tab.plugin.settings.offlineBible.preferOffline = value;
          await tab.plugin.saveSettings();
          void renderOfflineBibleContent(tab, container);
        }),
    );

  new Setting(container)
    .setName(tab.t('settings.offlineBible.allowOnlineFallback.name'))
    .setDesc(tab.t('settings.offlineBible.allowOnlineFallback.description'))
    .addToggle((toggle) =>
      toggle
        .setValue(tab.plugin.settings.offlineBible.allowOnlineFallback)
        .setDisabled(!tab.plugin.settings.offlineBible.enabled)
        .onChange(async (value) => {
          tab.plugin.settings.offlineBible.allowOnlineFallback = value;
          await tab.plugin.saveSettings();
        }),
    );

  const actionsSetting = new Setting(container)
    .setName(tab.t('settings.offlineBible.actions.name'))
    .setDesc(tab.t('settings.offlineBible.actions.description'))
    .addButton((button) => {
      if (tab.importInFlight) {
        button.setButtonText(tab.t('settings.offlineBible.actions.importing')).setDisabled(true);
      } else {
        button
          .setButtonText(tab.t('settings.offlineBible.actions.import'))
          .setCta()
          .onClick(() => {
            void handleBibleImport(tab, container);
          });
      }
    });

  if (Platform.isDesktopApp) {
    actionsSetting.addButton((button) =>
      button.setButtonText(tab.t('settings.offlineBible.actions.openFolder')).onClick(() => {
        void openOfflineBibleFolder(tab);
      }),
    );
  }

  await renderInstalledBibleList(tab, container);
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

  new Setting(wrapper)
    .setName(tab.t('settings.offlineBible.installedList.name'))
    .setDesc(tab.t('settings.offlineBible.installedList.description'));

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
          .setWarning()
          .onClick(() => {
            void handleBibleRemoval(tab, language, wrapper);
          }),
      );
  }
}

async function handleBibleImport(tab: SettingsTabContext, container: HTMLElement): Promise<void> {
  const selectedFile = await selectEpubFile(tab);
  if (!selectedFile) return;

  const importService = tab.plugin.getEpubImportService();
  tab.importInFlight = true;
  void renderOfflineBibleContent(tab, container);

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
    void renderOfflineBibleContent(tab, container);
  }
}

async function handleBibleRemoval(
  tab: SettingsTabContext,
  language: Language,
  container: HTMLElement,
): Promise<void> {
  await tab.plugin.getOfflineBibleRepository()?.removeLanguage(language);
  new Notice(tab.t('notices.offlineBibleRemoved', { language: LANGUAGE_LABELS[language] }));
  void renderOfflineBibleContent(tab, container);
}

async function openOfflineBibleFolder(tab: SettingsTabContext): Promise<void> {
  if (!Platform.isDesktop) return;
  const folderPath = getOfflineBibleAbsolutePath(tab.app, tab.plugin.manifest.id);
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- dynamic require for desktop-only Node.js API
  const { mkdir } = require('fs/promises') as typeof import('fs/promises');
  await mkdir(folderPath, { recursive: true });
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
    input.style.display = 'none';

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
