import {
  PluginSettingTab,
  App,
  Setting,
  MarkdownRenderer,
  Component,
  Notice,
  Platform,
} from 'obsidian';
import JWLibraryLinkerPlugin, { DEFAULT_SETTINGS, DEFAULT_STYLES } from '@/main';
import type {
  Language,
  BibleReference,
  LinkStyles,
  BookLength,
  UpdatedLinkStructure,
  LinkFormat,
} from '@/types';
import { BIBLE_QUOTE_TEMPLATES } from '@/types';
import { convertBibleTextToMarkdownLink } from '@/utils/convertBibleTextToMarkdownLink';
import { formatBibleText } from '@/utils/formatBibleText';
import { loadBibleBooks } from '@/stores/bibleBooks';
import { getOfflineBibleAbsolutePath } from '@/services/PluginDataPathService';
import { logger } from '@/utils/logger';
import { LANGUAGE_LABELS } from '@/consts/languages';

class MarkdownComponent extends Component {
  constructor() {
    super();
  }
}

export class JWLibraryLinkerSettings extends PluginSettingTab {
  plugin: JWLibraryLinkerPlugin;
  private t: (key: string, variables?: Record<string, string>) => string;

  private markdownRenderer = async (containerId: string, markdown: string) => {
    const container = activeDocument.getElementById(containerId);
    if (container) {
      container.empty();
      const component = new MarkdownComponent();
      await MarkdownRenderer.render(this.app, markdown, container, '.', component);
      this.plugin.addChild(component);
    }
  };

  private presetButton = (
    container: HTMLElement,
    reference: BibleReference,
    styles: LinkStyles,
    name: string,
  ) => {
    const text = convertBibleTextToMarkdownLink(reference, {
      ...this.plugin.settings,
      ...styles,
    });
    const linkEl = container.createEl('a', {
      text,
      cls: 'preset-button',
      attr: { id: `button-${name}-preset` },
    });
    void this.markdownRenderer(`button-${name}-preset`, text || '');

    const internalLinks = linkEl.querySelectorAll('a');
    internalLinks.forEach((link) => {
      link.href = '#';
      link.setAttribute(
        'aria-label',
        `Sets: "${styles.prefixOutsideLink}", "${styles.prefixInsideLink}", "${styles.suffixInsideLink}", "${styles.suffixOutsideLink}"`,
      );
      link.addEventListener('click', (e) => {
        e.preventDefault();
      });
    });

    linkEl.addEventListener('click', () => {
      this.plugin.settings.prefixOutsideLink = styles.prefixOutsideLink;
      this.plugin.settings.prefixInsideLink = styles.prefixInsideLink;
      this.plugin.settings.suffixInsideLink = styles.suffixInsideLink;
      this.plugin.settings.suffixOutsideLink = styles.suffixOutsideLink;
      void this.plugin.saveSettings();
      this.display();
      this.updatePreview();
    });
  };

  private importInFlight = false;

  private previewReferences: BibleReference[] = [
    {
      book: 66,
      chapter: 21,
      verseRanges: [{ start: 4, end: 4 }],
    },
    {
      book: 19,
      chapter: 23,
      verseRanges: [
        { start: 1, end: 3 },
        { start: 5, end: 5 },
        { start: 7, end: 9 },
      ],
    },
    {
      book: 13,
      chapter: 29,
      verseRanges: [{ start: 11, end: 11 }],
    },
  ];

  constructor(app: App, plugin: JWLibraryLinkerPlugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.t = this.plugin.getTranslationService().t.bind(this.plugin.getTranslationService());
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    const settingsContainer = containerEl.createDiv({
      cls: 'jw-library-linker',
    });

    new Setting(settingsContainer)
      .setName(this.t('settings.language.name'))
      .setDesc(this.t('settings.language.description'))
      .addDropdown((dropdown) =>
        dropdown
          .addOptions(LANGUAGE_LABELS)
          .setValue(this.plugin.settings.language)
          .onChange(async (value) => {
            const newLanguage = value as Language;
            loadBibleBooks(newLanguage);
            this.plugin.settings.language = newLanguage;
            await this.plugin.saveSettings();
            this.display();
          }),
      );

    // Link format toggle
    new Setting(settingsContainer)
      .setName('Link format')
      .setDesc(
        '"JW Library app" opens directly in the JW Library app (jwlibrary://). ' +
        '"JW.org share link" also works in browsers and is better for sharing notes with others.',
      )
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({
            jwlibrary: 'JW Library app (jwlibrary://)',
            'jworg-finder': 'JW.org share link (jw.org/finder)',
          })
          .setValue(this.plugin.settings.linkFormat ?? 'jwlibrary')
          .onChange(async (value) => {
            this.plugin.settings.linkFormat = value as LinkFormat;
            await this.plugin.saveSettings();
            this.updatePreview();
          }),
      );

    new Setting(settingsContainer)
      .setName(this.t('settings.openAutomatically.name'))
      .setDesc(this.t('settings.openAutomatically.description'))
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.openAutomatically).onChange(async (value) => {
          this.plugin.settings.openAutomatically = value;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(settingsContainer)
      .setName(this.t('settings.updatedLinkStructure.name'))
      .setDesc(this.t('settings.updatedLinkStructure.description'))
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({
            keepCurrentStructure: this.t('settings.updatedLinkStructure.keepCurrentStructure'),
            usePluginSettings: this.t('settings.updatedLinkStructure.usePluginSettings'),
          })
          .setValue(this.plugin.settings.updatedLinkStructure)
          .onChange(async (value) => {
            this.plugin.settings.updatedLinkStructure = value as UpdatedLinkStructure;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(settingsContainer)
      .setName(this.t('settings.noLanguageParameter.name'))
      .setDesc(this.t('settings.noLanguageParameter.description'))
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.noLanguageParameter).onChange(async (value) => {
          this.plugin.settings.noLanguageParameter = value;
          await this.plugin.saveSettings();
          this.updatePreview();
        }),
      );

    new Setting(settingsContainer)
      .setName(this.t('settings.reconvertExistingLinks.name'))
      .setDesc(this.t('settings.reconvertExistingLinks.description'))
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.reconvertExistingLinks).onChange(async (value) => {
          this.plugin.settings.reconvertExistingLinks = value;
          await this.plugin.saveSettings();
        }),
      );

    const linkStylingContainer = settingsContainer.createDiv({
      cls: 'setting-item setting-item--linkStyling',
    });

    linkStylingContainer.createDiv({
      text: this.t('settings.linkStyling.name'),
      cls: 'setting-item-heading',
    });

    linkStylingContainer.createDiv({
      text: this.t('settings.linkStyling.description'),
      cls: 'setting-item-description',
    });

    new Setting(settingsContainer)
      .setName(this.t('settings.bookLength.name'))
      .setDesc(this.t('settings.bookLength.description'))
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({
            short: this.t('settings.bookLength.short'),
            medium: this.t('settings.bookLength.medium'),
            long: this.t('settings.bookLength.long'),
          })
          .setValue(this.plugin.settings.bookLength)
          .onChange(async (value) => {
            this.plugin.settings.bookLength = value as BookLength;
            await this.plugin.saveSettings();
            this.updatePreview();
          }),
      );

    new Setting(settingsContainer)
      .setClass('setting-item--input')
      .setName(this.t('settings.linkStyling.prefixOutsideLink.name'))
      .setDesc(this.t('settings.linkStyling.prefixOutsideLink.description'))
      .addText((text) =>
        text.setValue(this.plugin.settings.prefixOutsideLink).onChange(async (value) => {
          this.plugin.settings.prefixOutsideLink = value;
          await this.plugin.saveSettings();
          this.updatePreview();
        }),
      )
      .addExtraButton((button) => {
        button
          .setIcon('reset')
          .setTooltip(
            `${this.t('settings.linkStyling.reset', {
              default: DEFAULT_SETTINGS.prefixOutsideLink || '​',
            })}`,
          )
          .onClick(async () => {
            this.plugin.settings.prefixOutsideLink = DEFAULT_SETTINGS.prefixOutsideLink;
            await this.plugin.saveSettings();
            this.display();
            this.updatePreview();
          });
      });

    new Setting(settingsContainer)
      .setClass('setting-item--input')
      .setName(this.t('settings.linkStyling.prefixInsideLink.name'))
      .setDesc(this.t('settings.linkStyling.prefixInsideLink.description'))
      .addText((text) =>
        text.setValue(this.plugin.settings.prefixInsideLink).onChange(async (value) => {
          this.plugin.settings.prefixInsideLink = value;
          await this.plugin.saveSettings();
          this.updatePreview();
        }),
      )
      .addExtraButton((button) => {
        button
          .setIcon('reset')
          .setTooltip(
            `${this.t('settings.linkStyling.reset', {
              default: DEFAULT_SETTINGS.prefixInsideLink || '​',
            })}`,
          )
          .onClick(async () => {
            this.plugin.settings.prefixInsideLink = DEFAULT_SETTINGS.prefixInsideLink;
            await this.plugin.saveSettings();
            this.display();
            this.updatePreview();
          });
      });

    new Setting(settingsContainer)
      .setClass('setting-item--input')
      .setName(this.t('settings.linkStyling.suffixInsideLink.name'))
      .setDesc(this.t('settings.linkStyling.suffixInsideLink.description'))
      .addText((text) =>
        text.setValue(this.plugin.settings.suffixInsideLink).onChange(async (value) => {
          this.plugin.settings.suffixInsideLink = value;
          await this.plugin.saveSettings();
          this.updatePreview();
        }),
      )
      .addExtraButton((button) => {
        button
          .setIcon('reset')
          .setTooltip(
            `${this.t('settings.linkStyling.reset', {
              default: DEFAULT_SETTINGS.suffixInsideLink || '​',
            })}`,
          )
          .onClick(async () => {
            this.plugin.settings.suffixInsideLink = DEFAULT_SETTINGS.suffixInsideLink;
            await this.plugin.saveSettings();
            this.display();
            this.updatePreview();
          });
      });

    new Setting(settingsContainer)
      .setClass('setting-item--input')
      .setName(this.t('settings.linkStyling.suffixOutsideLink.name'))
      .setDesc(this.t('settings.linkStyling.suffixOutsideLink.description'))
      .addText((text) =>
        text.setValue(this.plugin.settings.suffixOutsideLink).onChange(async (value) => {
          this.plugin.settings.suffixOutsideLink = value;
          await this.plugin.saveSettings();
          this.updatePreview();
        }),
      )
      .addExtraButton((button) => {
        button
          .setIcon('reset')
          .setTooltip(
            `${this.t('settings.linkStyling.reset', {
              default: DEFAULT_SETTINGS.suffixOutsideLink || '​',
            })}`,
          )
          .onClick(async () => {
            this.plugin.settings.suffixOutsideLink = DEFAULT_SETTINGS.suffixOutsideLink;
            await this.plugin.saveSettings();
            this.display();
            this.updatePreview();
          });
      });

    const presetContainer = settingsContainer.createDiv({
      cls: 'setting-item setting-item--presets',
    });

    const presetText = presetContainer.createDiv({
      cls: 'setting-item-info',
    });

    presetText.createDiv({
      text: this.t('settings.linkStyling.presets.name'),
      cls: 'setting-item-h1',
    });

    presetText.createDiv({
      text: this.t('settings.linkStyling.presets.description'),
      cls: 'setting-item-description',
    });

    const presetButtonsContainer = presetContainer.createDiv({
      cls: 'preset-buttons-container',
    });

    void this.presetButton(
      presetButtonsContainer,
      this.previewReferences[2],
      { ...DEFAULT_STYLES, fontStyle: this.plugin.settings.fontStyle },
      'default',
    );

    void this.presetButton(
      presetButtonsContainer,
      this.previewReferences[2],
      {
        ...this.plugin.settings,
        prefixOutsideLink: '(',
        prefixInsideLink: '',
        suffixInsideLink: '',
        suffixOutsideLink: ')',
      },
      'parentheses',
    );

    void this.presetButton(
      presetButtonsContainer,
      this.previewReferences[2],
      {
        ...this.plugin.settings,
        prefixOutsideLink: '📖 ',
        prefixInsideLink: '',
        suffixInsideLink: '',
        suffixOutsideLink: '',
      },
      'bookEmoji',
    );

    new Setting(settingsContainer)
      .setName(this.t('settings.linkStyling.fontStyle.name'))
      .setDesc(this.t('settings.linkStyling.fontStyle.description'))
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({
            normal: this.t('settings.linkStyling.fontStyle.normal'),
            italic: this.t('settings.linkStyling.fontStyle.italic'),
            bold: this.t('settings.linkStyling.fontStyle.bold'),
          })
          .setValue(this.plugin.settings.fontStyle)
          .onChange(async (value) => {
            this.plugin.settings.fontStyle = value as LinkStyles['fontStyle'];
            await this.plugin.saveSettings();
            this.updatePreview();
          }),
      );

    const previewContainer = settingsContainer.createDiv({
      cls: 'setting-item setting-item--preview',
    });

    previewContainer.createDiv({
      text: this.t('settings.linkStyling.preview.name'),
      cls: 'setting-item-h1',
    });

    const previewItemsContainer = previewContainer.createDiv();

    for (let i = 0; i < 3; i++) {
      previewItemsContainer.createDiv({
        attr: { id: `preview-container-${i}` },
      });
    }

    this.updatePreview();

    const bibleQuoteContainer = settingsContainer.createDiv({
      cls: 'setting-item setting-item--column setting-item--bibleQuote',
    });

    const bibleQuoteInfo = bibleQuoteContainer.createDiv({
      cls: 'setting-item-info',
    });

    bibleQuoteInfo.createDiv({
      text: this.t('settings.bibleQuote.name'),
      cls: 'setting-item-h1',
    });

    bibleQuoteInfo.createDiv({
      text: this.t('settings.bibleQuote.description'),
      cls: 'setting-item-description',
    });

    const templatePresetContainer = bibleQuoteContainer.createDiv({
      cls: 'setting-item-presets',
    });

    templatePresetContainer.createDiv({
      text: this.t('settings.bibleQuote.presets.name'),
      cls: 'setting-item-h2',
    });

    const buttonsRow = templatePresetContainer.createDiv({
      cls: 'preset-buttons-container',
    });

    this.createPresetButton(buttonsRow, 'short', BIBLE_QUOTE_TEMPLATES.short);
    this.createPresetButton(buttonsRow, 'plain', BIBLE_QUOTE_TEMPLATES.plain);
    this.createPresetButton(buttonsRow, 'foldable', BIBLE_QUOTE_TEMPLATES.foldable);
    this.createPresetButton(buttonsRow, 'expanded', BIBLE_QUOTE_TEMPLATES.expanded);

    new Setting(bibleQuoteContainer)
      .setName(this.t('settings.bibleQuote.template.name'))
      .setDesc(this.t('settings.bibleQuote.template.description'))
      .setClass('setting-item--quote')
      .addTextArea((text) => {
        text
          .setValue(this.plugin.settings.bibleQuote.template)
          .setPlaceholder('{bibleRefLinked}\\n> {quote}')
          .onChange(async (value) => {
            this.plugin.settings.bibleQuote.template = value;
            await this.plugin.saveSettings();
            this.updateBibleQuotePreview();
          });
        text.inputEl.rows = 4;
        text.inputEl.cols = 50;
      });

    const bibleQuotePreviewContainer = bibleQuoteContainer.createDiv({
      cls: 'setting-item-preview',
    });

    bibleQuotePreviewContainer.createDiv({
      text: this.t('settings.bibleQuote.preview.name'),
      cls: 'setting-item-h2',
    });

    bibleQuotePreviewContainer.createDiv({
      attr: { id: 'bible-quote-preview-container' },
    });

    this.updateBibleQuotePreview();

    const offlineBibleContainer = settingsContainer.createDiv({
      cls: 'setting-item setting-item--column setting-item--offlineBible',
    });

    void this.renderOfflineBibleSection(offlineBibleContainer);
  }

  updateBibleQuotePreview(): void {
    const container = activeDocument.getElementById('bible-quote-preview-container');
    if (!container) return;

    const sampleReference = {
      book: 40,
      chapter: 24,
      verseRanges: [{ start: 14, end: 14 }],
    };

    const bibleRefLinked = convertBibleTextToMarkdownLink(sampleReference, this.plugin.settings);
    if (!bibleRefLinked) return;

    const bibleRef = formatBibleText(
      sampleReference,
      this.plugin.settings.bookLength,
      this.plugin.settings.language,
    );

    const sampleText =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

    const markdown = this.plugin.settings.bibleQuote.template
      .replace(/\{bibleRef\}/g, bibleRef)
      .replace(/\{bibleRefLinked\}/g, bibleRefLinked)
      .replace(/\{quote\}/g, sampleText);

    container.empty();
    const component = new MarkdownComponent();
    void MarkdownRenderer.render(this.app, markdown, container, '.', component);
    this.plugin.addChild(component);
  }

  createPresetButton(container: HTMLElement, name: string, template: string): void {
    const button = container.createEl('button', {
      text: this.t(`settings.bibleQuote.presets.${name}`),
      cls: 'mod-cta preset-button',
    });

    button.addEventListener('click', () => {
      void (async () => {
        this.plugin.settings.bibleQuote.template = template;
        await this.plugin.saveSettings();
        this.display();
        this.updateBibleQuotePreview();
      })();
    });
  }

  private async renderOfflineBibleSection(container: HTMLElement): Promise<void> {
    container.empty();

    container.createDiv({
      text: this.t('settings.offlineBible.name'),
      cls: 'setting-item-h1',
    });

    container.createDiv({
      text: this.t('settings.offlineBible.description'),
      cls: 'setting-item-description',
    });

    new Setting(container)
      .setName(this.t('settings.offlineBible.enabled.name'))
      .setDesc(this.t('settings.offlineBible.enabled.description'))
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.offlineBible.enabled).onChange(async (value) => {
          this.plugin.settings.offlineBible.enabled = value;
          await this.plugin.saveSettings();
          void this.renderOfflineBibleSection(container);
        }),
      );

    new Setting(container)
      .setName(this.t('settings.offlineBible.preferOffline.name'))
      .setDesc(this.t('settings.offlineBible.preferOffline.description'))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.offlineBible.preferOffline)
          .setDisabled(!this.plugin.settings.offlineBible.enabled)
          .onChange(async (value) => {
            this.plugin.settings.offlineBible.preferOffline = value;
            await this.plugin.saveSettings();
            void this.renderOfflineBibleSection(container);
          }),
      );

    new Setting(container)
      .setName(this.t('settings.offlineBible.allowOnlineFallback.name'))
      .setDesc(this.t('settings.offlineBible.allowOnlineFallback.description'))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.offlineBible.allowOnlineFallback)
          .setDisabled(!this.plugin.settings.offlineBible.enabled)
          .onChange(async (value) => {
            this.plugin.settings.offlineBible.allowOnlineFallback = value;
            await this.plugin.saveSettings();
          }),
      );

    await this.renderInstalledBibleList(container);

    const actionsSetting = new Setting(container)
      .setName(this.t('settings.offlineBible.actions.name'))
      .setDesc(this.t('settings.offlineBible.actions.description'))
      .addButton((button) => {
        if (this.importInFlight) {
          button.setButtonText(this.t('settings.offlineBible.actions.importing')).setDisabled(true);
        } else {
          button
            .setButtonText(this.t('settings.offlineBible.actions.import'))
            .setCta()
            .onClick(() => {
              void this.handleBibleImport(container);
            });
        }
      });

    if (Platform.isDesktopApp) {
      actionsSetting.addButton((button) =>
        button.setButtonText(this.t('settings.offlineBible.actions.openFolder')).onClick(() => {
          void this.openOfflineBibleFolder();
        }),
      );
    }
  }

  private async renderInstalledBibleList(container: HTMLElement): Promise<void> {
    const repository = this.plugin.getOfflineBibleRepository();
    const installedLanguages = (await repository?.getInstalledLanguages()) ?? [];
    const entries = await Promise.all(
      installedLanguages.map(async (language) => ({
        language,
        metadata: (await repository?.getMetadata(language)) ?? null,
      })),
    );

    const listSetting = new Setting(container)
      .setName(this.t('settings.offlineBible.installedList.name'))
      .setDesc(this.t('settings.offlineBible.installedList.description'));
    listSetting.settingEl.addClass('setting-item--column');

    if (entries.length === 0) {
      container.createDiv({
        text: this.t('settings.offlineBible.installedList.empty'),
        cls: 'setting-item-description',
      });
      return;
    }

    for (const { language, metadata } of entries) {
      if (!metadata) continue;

      new Setting(container)
        .setName(LANGUAGE_LABELS[language])
        .setDesc(
          this.t('settings.offlineBible.installedList.entry', {
            sourceFileName: metadata.sourceFileName,
            chapterCount: String(metadata.chapterCount),
            importedAt: new Date(metadata.importedAt).toLocaleString(),
          }),
        )
        .addButton((button) =>
          button
            .setButtonText(this.t('settings.offlineBible.actions.remove'))
            .setWarning()
            .onClick(() => {
              void this.handleBibleRemoval(language, container);
            }),
        );
    }
  }

  private async handleBibleImport(container: HTMLElement): Promise<void> {
    const selectedFile = await this.selectEpubFile();
    if (!selectedFile) return;

    const importService = this.plugin.getEpubImportService();
    this.importInFlight = true;
    void this.renderOfflineBibleSection(container);

    try {
      const result = await importService.importBible({
        fileData: new Uint8Array(await selectedFile.arrayBuffer()),
        sourceFileName: selectedFile.name,
        overwriteExisting: false,
      });

      if (!result.success) {
        if (result.language) {
          new Notice(
            this.t('notices.offlineBibleAlreadyInstalled', {
              language: LANGUAGE_LABELS[result.language],
            }),
          );
        } else {
          new Notice(result.error ?? this.t('notices.offlineBibleImportFailed'));
        }
        return;
      }

      new Notice(
        this.t('notices.offlineBibleImported', {
          language: LANGUAGE_LABELS[result.language ?? this.plugin.settings.language],
        }),
      );
    } finally {
      this.importInFlight = false;
      void this.renderOfflineBibleSection(container);
    }
  }

  private async handleBibleRemoval(language: Language, container: HTMLElement): Promise<void> {
    await this.plugin.getOfflineBibleRepository()?.removeLanguage(language);
    new Notice(this.t('notices.offlineBibleRemoved', { language: LANGUAGE_LABELS[language] }));
    void this.renderOfflineBibleSection(container);
  }

  private async openOfflineBibleFolder(): Promise<void> {
    if (!Platform.isDesktop) return;
    const folderPath = getOfflineBibleAbsolutePath(this.app, this.plugin.manifest.id);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { mkdir } = require('fs/promises') as typeof import('fs/promises');
    await mkdir(folderPath, { recursive: true });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { shell } = require('electron') as typeof import('electron');
    const error = await shell.openPath(folderPath);

    if (error) {
      logger.error(error);
      new Notice(this.t('notices.offlineBibleOpenFolderFailed'));
    }
  }

  private async selectEpubFile(): Promise<File | null> {
    return await new Promise((resolve) => {
      const input = this.containerEl.createEl('input');
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

  updatePreview(): void {
    try {
      const markdownLinks = this.previewReferences.map((reference) =>
        convertBibleTextToMarkdownLink(reference, this.plugin.settings),
      );

      if (!markdownLinks.every(Boolean)) {
        throw new Error('Failed to generate one or more markdown links');
      }

      const markdownParagraphs = [
        `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut in arcu vitae nunc hendrerit tempus ac sed ${markdownLinks[0]} felis. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec gravida turpis eu diam pellentesque, sed rhoncus nulla placerat.`,
        `${markdownLinks[1]}`,
        `Nullam faucibus, leo eget tincidunt convallis, sapien nisl tincidunt nulla, nec eleifend arcu risus a tellus. Cras tincidunt fermentum mauris, non tempor nibh tincidunt in. Mauris et diam quis nisl placerat egestas in vitae sem. Sed eget diam consectetur, mollis turpis vel, dignissim tortor. Mauris iaculis ipsum eu ${markdownLinks[2]}`,
      ];

      markdownParagraphs.forEach((markdown, index) => {
        const container = activeDocument.getElementById(`preview-container-${index}`);
        if (container) {
          container.empty();
          const component = new MarkdownComponent();
          void MarkdownRenderer.render(this.app, markdown, container, '.', component);
          this.plugin.addChild(component);
        }
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      logger.error(errorMessage);
    }
  }
}
