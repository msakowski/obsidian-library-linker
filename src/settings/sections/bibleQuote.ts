import { MarkdownRenderer, Setting } from 'obsidian';
import { BIBLE_QUOTE_TEMPLATES } from '@/types';
import { convertBibleTextToMarkdownLink } from '@/utils/convertBibleTextToMarkdownLink';
import { formatBibleText } from '@/utils/formatBibleText';
import { MarkdownComponent } from '@/settings/MarkdownComponent';
import { createSettingGroup } from '@/settings/createSettingGroup';
import type { SettingsTabContext } from '@/settings/types';

export function renderBibleQuote(tab: SettingsTabContext, container: HTMLElement): void {
  const items = createSettingGroup(
    container,
    tab.t('settings.bibleQuote.name'),
    tab.t('settings.bibleQuote.description'),
  );

  // Template textarea
  new Setting(items)
    .setName(tab.t('settings.bibleQuote.template.name'))
    .setDesc(tab.t('settings.bibleQuote.template.description'))
    .setClass('setting-item--quote')
    .addTextArea((text) => {
      text
        .setValue(tab.plugin.settings.bibleQuote.template)
        .setPlaceholder('{bibleRefLinked}\\n> {quote}')
        .onChange(async (value) => {
          tab.plugin.settings.bibleQuote.template = value;
          await tab.plugin.saveSettings();
          tab.updateBibleQuotePreview();
        });
      text.inputEl.rows = 4;
      text.inputEl.cols = 50;
    });

  const presetOnClick = async (template: string) => {
    tab.plugin.settings.bibleQuote.template = template;
    await tab.plugin.saveSettings();
    tab.display();
    tab.updateBibleQuotePreview();
  };

  // Template presets sub-section
  new Setting(items)
    .setName(tab.t('settings.bibleQuote.presets.name'))
    .addButton((cb) =>
      cb
        .setButtonText(tab.t('settings.bibleQuote.presets.short'))
        .onClick(() => presetOnClick(BIBLE_QUOTE_TEMPLATES.short)),
    )
    .addButton((cb) =>
      cb
        .setButtonText(tab.t('settings.bibleQuote.presets.plain'))
        .onClick(() => presetOnClick(BIBLE_QUOTE_TEMPLATES.plain)),
    )
    .addButton((cb) =>
      cb
        .setButtonText(tab.t('settings.bibleQuote.presets.foldable'))
        .onClick(() => presetOnClick(BIBLE_QUOTE_TEMPLATES.foldable)),
    )
    .addButton((cb) =>
      cb
        .setButtonText(tab.t('settings.bibleQuote.presets.expanded'))
        .onClick(() => presetOnClick(BIBLE_QUOTE_TEMPLATES.expanded)),
    );

  // Preview sub-section
  new Setting(items).setName(tab.t('settings.bibleQuote.preview.name'));
  items.createDiv({ attr: { id: 'bible-quote-preview-container' } });
}

export function updateBibleQuotePreview(tab: SettingsTabContext): void {
  const container = activeDocument.getElementById('bible-quote-preview-container');
  if (!container) return;

  const sampleReference = { book: 40, chapter: 24, verseRanges: [{ start: 14, end: 14 }] };

  const bibleRefLinked = convertBibleTextToMarkdownLink(sampleReference, tab.plugin.settings);
  if (!bibleRefLinked) return;

  const bibleRef = formatBibleText(
    sampleReference,
    tab.plugin.settings.bookLength,
    tab.plugin.settings.language,
  );

  // TODO: Replace with actual quote from the Bible
  const sampleText =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

  const markdown = tab.plugin.settings.bibleQuote.template
    .replace(/\{bibleRef\}/g, bibleRef)
    .replace(/\{bibleRefLinked\}/g, bibleRefLinked)
    .replace(/\{quote\}/g, sampleText);

  container.empty();
  const component = new MarkdownComponent();
  void MarkdownRenderer.render(tab.app, markdown, container, '.', component);
  tab.plugin.addChild(component);
}
