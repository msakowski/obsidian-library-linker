import { PluginSettingTab, App, Setting, MarkdownRenderer, Component } from 'obsidian';
import JWLibraryLinkerPlugin, { DEFAULT_SETTINGS, DEFAULT_STYLES } from '@/main';
import { TranslationService } from '@/services/TranslationService';
import type {
  Language,
  BibleReference,
  LinkStyles,
  BookLength,
  UpdatedLinkStructure,
  BibleQuoteFormat,
} from '@/types';
import { convertBibleTextToMarkdownLink } from '@/utils/convertBibleTextToMarkdownLink';

class MarkdownComponent extends Component {
  constructor() {
    super();
  }
}

export class JWLibraryLinkerSettings extends PluginSettingTab {
  plugin: JWLibraryLinkerPlugin;
  private t = TranslationService.getInstance().t.bind(TranslationService.getInstance());

  private markdownRenderer = async (containerId: string, markdown: string) => {
    const container = document.getElementById(containerId);
    if (container) {
      // Clear previous content
      container.empty();

      // Create a new component instance for this render
      const component = new MarkdownComponent();

      // Render markdown to HTML
      await MarkdownRenderer.render(this.app, markdown, container, '.', component);

      // Register the component to ensure proper cleanup
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

    // Add event listener to prevent default action of inner links
    const internalLinks = linkEl.querySelectorAll('a');
    internalLinks.forEach((link) => {
      link.href = '#';
      link.setAttribute(
        'aria-label',
        `Sets: "${styles.prefixOutsideLink}", "${styles.prefixInsideLink}", "${styles.suffixInsideLink}", "${styles.suffixOutsideLink}"`,
      );
      link.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default link action
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
    // Book with number prefix (1 Chronicles 29:11)
    {
      book: 13,
      chapter: 29,
      verseRanges: [{ start: 11, end: 11 }],
    },
  ];

  constructor(app: App, plugin: JWLibraryLinkerPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    // Clear the parent container first
    containerEl.empty();

    const settingsContainer = containerEl.createDiv({
      cls: 'jw-library-linker',
    });

    new Setting(settingsContainer)
      .setName(this.t('settings.language.name'))
      .setDesc(this.t('settings.language.description'))
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({
            E: 'English',
            X: 'Deutsch',
            FI: 'Suomi',
            S: 'Español',
            O: 'Nederlands',
            KO: '한국어',
          } satisfies Record<Language, string>)
          .setValue(this.plugin.settings.language)
          .onChange(async (value) => {
            this.plugin.settings.language = value as Language;
            await this.plugin.saveSettings();
            this.display();
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

    // Add Link Styling section

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

    // Prefix outside link
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

    // Prefix inside link
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

    // Suffix inside link
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

    // Suffix outside link
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

    // Presets row
    const presetContainer = settingsContainer.createDiv({
      cls: 'setting-item setting-item--presets',
    });

    const presetText = presetContainer.createDiv({
      cls: 'setting-item-info',
    });

    presetText.createDiv({
      text: this.t('settings.linkStyling.presets.name'),
      cls: 'setting-item-heading',
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
      {
        ...DEFAULT_STYLES,
        fontStyle: this.plugin.settings.fontStyle,
      },
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

    // Font style
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

    // Add preview section
    previewContainer.createDiv({
      text: this.t('settings.linkStyling.preview.name'),
      cls: 'setting-item-heading',
    });

    // Create container for preview content
    const previewItemsContainer = previewContainer.createDiv();

    // Create three divs for our markdown content
    for (let i = 0; i < 3; i++) {
      previewItemsContainer.createDiv({
        attr: { id: `preview-container-${i}` },
      });
    }

    // Initialize preview
    this.updatePreview();

    // Add Bible Quote Formatting section
    const bibleQuoteContainer = settingsContainer.createDiv({
      cls: 'setting-item setting-item--bibleQuote',
    });

    bibleQuoteContainer.createDiv({
      text: this.t('settings.bibleQuote.name'),
      cls: 'setting-item-heading',
    });

    bibleQuoteContainer.createDiv({
      text: this.t('settings.bibleQuote.description'),
      cls: 'setting-item-description',
    });

    // Bible quote format setting (moved before callout type)
    new Setting(settingsContainer)
      .setName(this.t('settings.bibleQuote.format.name'))
      .setDesc(this.t('settings.bibleQuote.format.description'))
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({
            short: this.t('settings.bibleQuote.format.short'),
            'long-foldable': this.t('settings.bibleQuote.format.longFoldable'),
            'long-expanded': this.t('settings.bibleQuote.format.longExpanded'),
          })
          .setValue(this.plugin.settings.bibleQuote.format)
          .onChange(async (value) => {
            this.plugin.settings.bibleQuote.format = value as BibleQuoteFormat;
            await this.plugin.saveSettings();

            // Show/hide callout type setting based on format
            const isLongFormat = value !== 'short';
            calloutSetting.settingEl.style.display = isLongFormat ? 'flex' : 'none';

            this.updateBibleQuotePreview();
          }),
      );

    // Callout type setting (only shown for long formats)
    const calloutSetting = new Setting(settingsContainer)
      .setName(this.t('settings.bibleQuote.calloutType.name'))
      .setDesc(this.t('settings.bibleQuote.calloutType.description'))
      .addText((text) =>
        text.setValue(this.plugin.settings.bibleQuote.calloutType).onChange(async (value) => {
          this.plugin.settings.bibleQuote.calloutType = value;
          await this.plugin.saveSettings();
          this.updateBibleQuotePreview();
        }),
      );

    // Show/hide callout type setting based on initial format
    const isLongFormat = this.plugin.settings.bibleQuote.format !== 'short';
    calloutSetting.settingEl.style.display = isLongFormat ? 'flex' : 'none';

    // Add Bible quote preview section
    const bibleQuotePreviewContainer = settingsContainer.createDiv({
      cls: 'setting-item setting-item--bibleQuotePreview',
    });

    bibleQuotePreviewContainer.createDiv({
      text: this.t('settings.bibleQuote.preview.name'),
      cls: 'setting-item-heading',
    });

    // Create container for bible quote preview content
    bibleQuotePreviewContainer.createDiv({
      attr: { id: 'bible-quote-preview-container' },
    });

    // Initialize bible quote preview
    this.updateBibleQuotePreview();
  }

  /**
   * Updates the Bible quote preview with the selected format
   */
  updateBibleQuotePreview(): void {
    const container = document.getElementById('bible-quote-preview-container');
    if (!container) return;

    // Sample Bible reference for preview
    const sampleReference = {
      book: 40,
      chapter: 24,
      verseRanges: [{ start: 14, end: 14 }],
    };

    // Generate the link
    const link = convertBibleTextToMarkdownLink(sampleReference, this.plugin.settings);
    if (!link) return;

    // Sample lorem ipsum text for preview
    const sampleText =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

    let markdown = '';
    const format = this.plugin.settings.bibleQuote.format;
    const calloutType = this.plugin.settings.bibleQuote.calloutType;

    switch (format) {
      case 'short':
        markdown = `${link}\n> ${sampleText}`;
        break;
      case 'long-foldable':
        markdown = `> [!${calloutType}]- ${link}\n> ${sampleText}`;
        break;
      case 'long-expanded':
        markdown = `> [!${calloutType}] ${link}\n> ${sampleText}`;
        break;
    }

    // Clear previous content
    container.empty();

    // Create a new component instance for this render
    const component = new MarkdownComponent();

    // Render markdown to HTML
    void MarkdownRenderer.render(this.app, markdown, container, '.', component);

    // Register the component to ensure proper cleanup
    this.plugin.addChild(component);
  }

  /**
   * Updates the preview elements with formatted Bible references
   */
  updatePreview(): void {
    try {
      // Generate markdown links for all references first
      const markdownLinks = this.previewReferences.map((reference) =>
        convertBibleTextToMarkdownLink(reference, this.plugin.settings),
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

          // Create a new component instance for this render
          const component = new MarkdownComponent();

          // Render markdown to HTML
          void MarkdownRenderer.render(this.app, markdown, container, '.', component);

          // Register the component to ensure proper cleanup
          this.plugin.addChild(component);
        }
      });
    } catch (err: unknown) {
      // Safe error logging
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.debug(errorMessage);
    }
  }
}
