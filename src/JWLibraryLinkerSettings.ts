import { PluginSettingTab, App, Setting, MarkdownRenderer } from 'obsidian';
import JWLibraryLinkerPlugin, { DEFAULT_SETTINGS, DEFAULT_STYLES } from '@/main';
import { TranslationService } from '@/services/TranslationService';
import type { Language, BibleReference, LinkStyles } from '@/types';
import { convertBibleTextToMarkdownLink } from '@/utils/convertBibleTextToMarkdownLink';

export class JWLibraryLinkerSettings extends PluginSettingTab {
  plugin: JWLibraryLinkerPlugin;
  private t = TranslationService.getInstance().t.bind(TranslationService.getInstance());

  private markdownRenderer = (containerId: string, markdown: string) => {
    const container = document.getElementById(containerId);
    if (container) {
      // Clear previous content
      container.empty();

      // Render markdown to HTML
      MarkdownRenderer.render(this.app, markdown, container, '.', this.plugin);
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
    this.markdownRenderer(`button-${name}-preset`, text || '');

    // Add event listener to prevent default action of inner links
    const internalLinks = linkEl.querySelectorAll('a');
    internalLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default link action
        // Don't stop propagation - allow the event to bubble up
      });
    });

    linkEl.addEventListener('click', async () => {
      this.plugin.settings.prefixOutsideLink = styles.prefixOutsideLink;
      this.plugin.settings.prefixInsideLink = styles.prefixInsideLink;
      this.plugin.settings.suffixInsideLink = styles.suffixInsideLink;
      this.plugin.settings.suffixOutsideLink = styles.suffixOutsideLink;
      await this.plugin.saveSettings();
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
      .setName(this.t('settings.openAutomatically.name'))
      .setDesc(this.t('settings.openAutomatically.description'))
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.openAutomatically).onChange(async (value) => {
          this.plugin.settings.openAutomatically = value;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName(this.t('settings.updatedLinkStrukture.name'))
      .setDesc(this.t('settings.updatedLinkStrukture.description'))
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({
            keepCurrentStructure: this.t('settings.updatedLinkStrukture.keepCurrentStructure'),
            usePluginSettings: this.t('settings.updatedLinkStrukture.usePluginSettings'),
          })
          .setValue(this.plugin.settings.updatedLinkStrukture)
          .onChange(async (value: 'keepCurrentStructure' | 'usePluginSettings') => {
            this.plugin.settings.updatedLinkStrukture = value;
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
          this.updatePreview();
        }),
      );

    // Add Link Styling section

    const linkStylingContainer = containerEl.createDiv({
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

    new Setting(containerEl)
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
          .onChange(async (value: LinkStyles['bookLength']) => {
            this.plugin.settings.bookLength = value;
            await this.plugin.saveSettings();
            this.updatePreview();
          }),
      );

    // Prefix outside link
    new Setting(containerEl)
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
    new Setting(containerEl)
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
    new Setting(containerEl)
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
    new Setting(containerEl)
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

    console.log('hellooo');

    // Presets row
    const presetContainer = containerEl.createDiv({
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

    this.presetButton(
      presetButtonsContainer,
      this.previewReferences[2],
      {
        ...DEFAULT_STYLES,
        fontStyle: this.plugin.settings.fontStyle,
      },
      'default',
    );

    this.presetButton(
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

    this.presetButton(
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
    new Setting(containerEl)
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
          .onChange(async (value: LinkStyles['fontStyle']) => {
            this.plugin.settings.fontStyle = value;
            await this.plugin.saveSettings();
            this.updatePreview();
          }),
      );

    const previewContainer = containerEl.createDiv({
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

    // Add some CSS for the preview section
    const style = document.createElement('style');
    style.textContent = `
      b, strong {
        font-weight: bolder;
      }

      .setting-item--input input {
        width: 8ch;
      }

      .setting-item--preview,
      .setting-item--presets,
      .setting-item--linkStyling {
        display: block;
      }

      .setting-item--preview {
        padding-top: 32px;
      }

      .setting-item--presets {
        justify-content: space-between;

        .setting-item-heading {
          white-space: nowrap;
          margin-top: 0 !important;
        }
      }

      .preset-buttons-container {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 12px;
      }

      .preset-button {
        --text-color: var(--text-normal);
        -webkit-app-region: no-drag;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: var(--font-ui-small);
        border-radius: var(--button-radius);
        border: 0;
        padding: var(--size-4-1) var(--size-4-3);
        height: var(--input-height);
        font-family: var(--font-interface);
        font-weight: var(--input-font-weight);
        cursor: var(--cursor);
        outline: none;
        user-select: none;
        white-space: nowrap;
        color: var(--text-color);
        background-color: var(--interactive-normal);
        box-shadow: var(--input-shadow);

        &:hover {
          color: inherit;
          cursor: pointer;
          text-decoration: none;
        }

        p {
          margin: 0;
        }
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
        convertBibleTextToMarkdownLink(reference, this.plugin.settings),
      );

      console.log(markdownLinks, this.plugin.settings);

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
        this.markdownRenderer(`preview-container-${index}`, markdown);
      });
    } catch (error) {
      console.debug(error);
    }
  }
}
