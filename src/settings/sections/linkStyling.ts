import { MarkdownRenderer, Setting } from 'obsidian';
import { DEFAULT_SETTINGS, DEFAULT_STYLES } from '@/main';
import type { BibleReference, BookLength, LinkStyles } from '@/types';
import { convertBibleTextToMarkdownLink } from '@/utils/convertBibleTextToMarkdownLink';
import { logger } from '@/utils/logger';
import { MarkdownComponent } from '@/settings/MarkdownComponent';
import { renderMarkdown } from '@/settings/renderMarkdown';
import { createSettingGroup } from '@/settings/createSettingGroup';
import type { SettingsTabContext } from '@/settings/types';

const previewReferences: BibleReference[] = [
  { book: 66, chapter: 21, verseRanges: [{ start: 4, end: 4 }] },
  {
    book: 19,
    chapter: 23,
    verseRanges: [
      { start: 1, end: 3 },
      { start: 5, end: 5 },
      { start: 7, end: 9 },
    ],
  },
  { book: 13, chapter: 29, verseRanges: [{ start: 11, end: 11 }] },
];

function presetButton(
  tab: SettingsTabContext,
  container: HTMLElement,
  reference: BibleReference,
  styles: LinkStyles,
  name: string,
): void {
  const text = convertBibleTextToMarkdownLink(reference, {
    ...tab.plugin.settings,
    ...styles,
  });
  const linkEl = container.createEl('a', {
    text,
    cls: 'preset-button',
    attr: { id: `button-${name}-preset` },
  });
  void renderMarkdown(tab.app, tab.plugin, `button-${name}-preset`, text || '');

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
    tab.plugin.settings.prefixOutsideLink = styles.prefixOutsideLink;
    tab.plugin.settings.prefixInsideLink = styles.prefixInsideLink;
    tab.plugin.settings.suffixInsideLink = styles.suffixInsideLink;
    tab.plugin.settings.suffixOutsideLink = styles.suffixOutsideLink;
    void tab.plugin.saveSettings();
    tab.display();
    tab.updatePreview();
  });
}

export function renderLinkStyling(tab: SettingsTabContext, container: HTMLElement): void {
  const items = createSettingGroup(
    container,
    tab.t('settings.linkStyling.name'),
    tab.t('settings.linkStyling.description'),
  );

  new Setting(items)
    .setName(tab.t('settings.bookLength.name'))
    .setDesc(tab.t('settings.bookLength.description'))
    .addDropdown((dropdown) =>
      dropdown
        .addOptions({
          short: tab.t('settings.bookLength.short'),
          medium: tab.t('settings.bookLength.medium'),
          long: tab.t('settings.bookLength.long'),
        })
        .setValue(tab.plugin.settings.bookLength)
        .onChange(async (value) => {
          tab.plugin.settings.bookLength = value as BookLength;
          await tab.plugin.saveSettings();
          tab.updatePreview();
        }),
    );

  new Setting(items)
    .setClass('setting-item--input')
    .setName(tab.t('settings.linkStyling.prefixOutsideLink.name'))
    .setDesc(tab.t('settings.linkStyling.prefixOutsideLink.description'))
    .addText((text) =>
      text.setValue(tab.plugin.settings.prefixOutsideLink).onChange(async (value) => {
        tab.plugin.settings.prefixOutsideLink = value;
        await tab.plugin.saveSettings();
        tab.updatePreview();
      }),
    )
    .addExtraButton((button) => {
      button
        .setIcon('reset')
        .setTooltip(
          tab.t('settings.linkStyling.reset', {
            default: DEFAULT_SETTINGS.prefixOutsideLink || '​',
          }),
        )
        .onClick(async () => {
          tab.plugin.settings.prefixOutsideLink = DEFAULT_SETTINGS.prefixOutsideLink;
          await tab.plugin.saveSettings();
          tab.display();
          tab.updatePreview();
        });
    });

  new Setting(items)
    .setClass('setting-item--input')
    .setName(tab.t('settings.linkStyling.prefixInsideLink.name'))
    .setDesc(tab.t('settings.linkStyling.prefixInsideLink.description'))
    .addText((text) =>
      text.setValue(tab.plugin.settings.prefixInsideLink).onChange(async (value) => {
        tab.plugin.settings.prefixInsideLink = value;
        await tab.plugin.saveSettings();
        tab.updatePreview();
      }),
    )
    .addExtraButton((button) => {
      button
        .setIcon('reset')
        .setTooltip(
          tab.t('settings.linkStyling.reset', {
            default: DEFAULT_SETTINGS.prefixInsideLink || '​',
          }),
        )
        .onClick(async () => {
          tab.plugin.settings.prefixInsideLink = DEFAULT_SETTINGS.prefixInsideLink;
          await tab.plugin.saveSettings();
          tab.display();
          tab.updatePreview();
        });
    });

  new Setting(items)
    .setClass('setting-item--input')
    .setName(tab.t('settings.linkStyling.suffixInsideLink.name'))
    .setDesc(tab.t('settings.linkStyling.suffixInsideLink.description'))
    .addText((text) =>
      text.setValue(tab.plugin.settings.suffixInsideLink).onChange(async (value) => {
        tab.plugin.settings.suffixInsideLink = value;
        await tab.plugin.saveSettings();
        tab.updatePreview();
      }),
    )
    .addExtraButton((button) => {
      button
        .setIcon('reset')
        .setTooltip(
          tab.t('settings.linkStyling.reset', {
            default: DEFAULT_SETTINGS.suffixInsideLink || '​',
          }),
        )
        .onClick(async () => {
          tab.plugin.settings.suffixInsideLink = DEFAULT_SETTINGS.suffixInsideLink;
          await tab.plugin.saveSettings();
          tab.display();
          tab.updatePreview();
        });
    });

  new Setting(items)
    .setClass('setting-item--input')
    .setName(tab.t('settings.linkStyling.suffixOutsideLink.name'))
    .setDesc(tab.t('settings.linkStyling.suffixOutsideLink.description'))
    .addText((text) =>
      text.setValue(tab.plugin.settings.suffixOutsideLink).onChange(async (value) => {
        tab.plugin.settings.suffixOutsideLink = value;
        await tab.plugin.saveSettings();
        tab.updatePreview();
      }),
    )
    .addExtraButton((button) => {
      button
        .setIcon('reset')
        .setTooltip(
          tab.t('settings.linkStyling.reset', {
            default: DEFAULT_SETTINGS.suffixOutsideLink || '​',
          }),
        )
        .onClick(async () => {
          tab.plugin.settings.suffixOutsideLink = DEFAULT_SETTINGS.suffixOutsideLink;
          await tab.plugin.saveSettings();
          tab.display();
          tab.updatePreview();
        });
    });

  new Setting(items)
    .setName(tab.t('settings.linkStyling.fontStyle.name'))
    .setDesc(tab.t('settings.linkStyling.fontStyle.description'))
    .addDropdown((dropdown) =>
      dropdown
        .addOptions({
          normal: tab.t('settings.linkStyling.fontStyle.normal'),
          italic: tab.t('settings.linkStyling.fontStyle.italic'),
          bold: tab.t('settings.linkStyling.fontStyle.bold'),
        })
        .setValue(tab.plugin.settings.fontStyle)
        .onChange(async (value) => {
          tab.plugin.settings.fontStyle = value as LinkStyles['fontStyle'];
          await tab.plugin.saveSettings();
          tab.updatePreview();
        }),
    );

  // Presets row
  new Setting(items)
    .setName(tab.t('settings.linkStyling.presets.name'))
    .setDesc(tab.t('settings.linkStyling.presets.description'));

  const presetButtonsContainer = items.createDiv({ cls: 'preset-buttons-container' });
  presetButton(
    tab,
    presetButtonsContainer,
    previewReferences[2],
    { ...DEFAULT_STYLES, fontStyle: tab.plugin.settings.fontStyle },
    'default',
  );
  presetButton(
    tab,
    presetButtonsContainer,
    previewReferences[2],
    {
      ...tab.plugin.settings,
      prefixOutsideLink: '(',
      prefixInsideLink: '',
      suffixInsideLink: '',
      suffixOutsideLink: ')',
    },
    'parentheses',
  );
  presetButton(
    tab,
    presetButtonsContainer,
    previewReferences[2],
    {
      ...tab.plugin.settings,
      prefixOutsideLink: '📖 ',
      prefixInsideLink: '',
      suffixInsideLink: '',
      suffixOutsideLink: '',
    },
    'bookEmoji',
  );

  // Preview
  new Setting(items).setName(tab.t('settings.linkStyling.preview.name'));

  const previewItemsContainer = items.createDiv();
  for (let i = 0; i < 3; i++) {
    previewItemsContainer.createDiv({ attr: { id: `preview-container-${i}` } });
  }
}

export function updateLinkStylingPreview(tab: SettingsTabContext): void {
  try {
    const markdownLinks = previewReferences.map((reference) =>
      convertBibleTextToMarkdownLink(reference, tab.plugin.settings),
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
        void MarkdownRenderer.render(tab.app, markdown, container, '.', component);
        tab.plugin.addChild(component);
      }
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    logger.error(errorMessage);
  }
}
