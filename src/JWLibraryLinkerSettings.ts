import { PluginSettingTab, App, Setting, MarkdownRenderer } from 'obsidian';
import JWLibraryLinkerPlugin from './main';
import { TranslationService } from './services/TranslationService';
import type { Language, BibleReference } from './types';
import { convertBibleTextToMarkdownLink } from './utils/convertBibleTextToLink';

export class JWLibraryLinkerSettings extends PluginSettingTab {
  plugin: JWLibraryLinkerPlugin;
  private t = TranslationService.getInstance().t.bind(TranslationService.getInstance());

  // Sample Bible references for preview
  private previewReferences: BibleReference[] = [
    // Simple reference (Revelation 21:4)
    {
      book: 66,
      chapter: 21,
      verseRanges: [{ start: 4, end: 4 }],
    },
    // Complex reference with multiple ranges (Psalm 23:1-3,5,7-9)
    {
      book: 19,
      chapter: 23,
      verseRanges: [
        { start: 1, end: 3 },
        { start: 5, end: 5 },
        { start: 7, end: 9 },
      ],
    },
    // Book with number prefix (2 Peter 2:9)
    {
      book: 61,
      chapter: 2,
      verseRanges: [{ start: 9, end: 9 }],
    },
  ];

  constructor(app: App, plugin: JWLibraryLinkerPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName(this.t('settings.language.name'))
      .setDesc(this.t('settings.language.description'))
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({
            E: 'English',
            X: 'Deutsch',
            FI: 'Suomi',
          })
          .setValue(this.plugin.settings.language)
          .onChange(async (value: Language) => {
            this.plugin.settings.language = value;
            await this.plugin.saveSettings();
            this.display();
          }),
      );

    new Setting(containerEl)
      .setName(this.t('settings.useShortNames.name'))
      .setDesc(this.t('settings.useShortNames.description'))
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.useShortNames).onChange(async (value) => {
          this.plugin.settings.useShortNames = value;
          await this.plugin.saveSettings();
          this.updatePreview();
        }),
      );

    new Setting(containerEl)
      .setName(this.t('settings.openAutomatically.name'))
      .setDesc(this.t('settings.openAutomatically.description'))
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.openAutomatically).onChange(async (value) => {
          this.plugin.settings.openAutomatically = value;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName(this.t('settings.noLanguageParameter.name'))
      .setDesc(this.t('settings.noLanguageParameter.description'))
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.noLanguageParameter).onChange(async (value) => {
          this.plugin.settings.noLanguageParameter = value;
          await this.plugin.saveSettings();
        }),
      );

    const previewContainer = containerEl.createDiv({
      cls: 'setting-item jw-library-linker-preview',
    });

    // Add preview section
    previewContainer.createEl('h2', {
      text: 'Preview',
      cls: 'jw-library-linker-preview-heading',
    });

    // Create container for preview content
    const previewItemsContainer = previewContainer.createDiv();

    // Create three divs for our markdown content
    for (let i = 0; i < 3; i++) {
      previewItemsContainer.createDiv({
        cls: 'jw-library-linker-markdown-container',
        attr: { id: `preview-container-${i}` },
      });
    }

    // Add some CSS for the preview section
    const style = document.createElement('style');
    style.textContent = `
      .jw-library-linker-preview {
        display: block;
        padding-top: 32px;
      }

      .jw-library-linker-preview-heading {
        margin: 0;
      }
    `;
    document.head.appendChild(style);

    // Initialize preview
    this.updatePreview();
  }

  /**
   * Updates the preview elements with formatted Bible references
   */
  updatePreview(): void {
    try {
      // Generate markdown links for all references first
      const markdownLinks = this.previewReferences.map((reference) =>
        convertBibleTextToMarkdownLink(
          reference,
          this.plugin.settings.useShortNames,
          this.plugin.settings.language,
          this.plugin.settings.noLanguageParameter ? undefined : this.plugin.settings.language,
        ),
      );

      if (!markdownLinks.every(Boolean)) {
        throw new Error('Failed to generate one or more markdown links');
      }

      // Create three markdown paragraphs with the links embedded
      const markdownParagraphs = [
        // First paragraph with inline reference
        `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut in arcu vitae nunc hendrerit tempus ac sed ${markdownLinks[0]} felis. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec gravida turpis eu diam pellentesque, sed rhoncus nulla placerat.`,

        // Second paragraph with only the reference
        `${markdownLinks[1]}`,

        // Third paragraph with reference at the end
        `Nullam faucibus, leo eget tincidunt convallis, sapien nisl tincidunt nulla, nec eleifend arcu risus a tellus. Cras tincidunt fermentum mauris, non tempor nibh tincidunt in. Mauris et diam quis nisl placerat egestas in vitae sem. Sed eget diam consectetur, mollis turpis vel, dignissim tortor. Mauris iaculis ipsum eu ${markdownLinks[2]}`,
      ];

      // Render each markdown paragraph in its container
      markdownParagraphs.forEach((markdown, index) => {
        const container = document.getElementById(`preview-container-${index}`);
        if (container) {
          // Clear previous content
          container.empty();

          // Render markdown to HTML
          MarkdownRenderer.render(this.app, markdown, container, '.', this.plugin);
        }
      });
    } catch (error) {
      console.debug(error);
    }
  }
}
