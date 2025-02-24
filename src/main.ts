import {
  App,
  Editor,
  EditorPosition,
  EditorSuggest,
  EditorSuggestContext,
  EditorSuggestTriggerInfo,
  Plugin,
  PluginSettingTab,
  Setting,
} from 'obsidian';
import { convertLinks } from '@/utils/convertLinks';
import {
  convertBibleTextToLink,
  convertBibleTextToMarkdownLink,
} from '@/utils/convertBibleTextToLink';
import type { BibleReference, BibleSuggestion, Language, LinkReplacerSettings } from '@/types';
import { formatBibleText } from '@/utils/formatBibleText';
import { parseBibleReference } from '@/utils/parseBibleReference';
import { formatJWLibraryLink } from '@/utils/formatJWLibraryLink';
import { TranslationService } from '@/services/TranslationService';

export const matchingBibleReferenceRegex =
  /^(?:[1-5]?[A-Za-zäöü]{1,4}\s*\d+:\d+(?:-\d+)?(?:\s*,\s*\d+(?:-\d+)?)*\s*,?\s*)?$/i;

const DEFAULT_SETTINGS: LinkReplacerSettings = {
  useShortNames: false,
  language: 'E',
};

class BibleReferenceSuggester extends EditorSuggest<BibleSuggestion> {
  plugin: LibraryLinkerPlugin;
  private t = TranslationService.getInstance().t.bind(TranslationService.getInstance());

  constructor(plugin: LibraryLinkerPlugin) {
    super(plugin.app);
    this.plugin = plugin;
  }

  onTrigger(cursor: EditorPosition, editor: Editor): EditorSuggestTriggerInfo | null {
    const line = editor.getLine(cursor.line);
    const subString = line.substring(0, cursor.ch);

    // Find position of /b
    const commandIndex = subString.lastIndexOf('/b');
    if (commandIndex === -1) return null;

    // Get the text after /b
    const afterCommand = subString.slice(commandIndex + 2).trim();

    // Match the Bible reference
    const match = afterCommand.match(matchingBibleReferenceRegex);

    if (!match) return null;

    return {
      start: {
        ch: commandIndex, // Start from the /b
        line: cursor.line,
      },
      end: cursor,
      query: afterCommand,
    };
  }

  getSuggestions(context: EditorSuggestContext): BibleSuggestion[] {
    const query = context.query;

    // Regex that handles both with and without space, including complex verse references
    if (query.match(matchingBibleReferenceRegex)) {
      const formattedText = formatBibleText(query, true, this.plugin.settings.language); // Use short format

      let reference: BibleReference;
      try {
        reference = parseBibleReference(query, this.plugin.settings.language);
      } catch {
        return [];
      }

      const links = formatJWLibraryLink(reference, this.plugin.settings.language);
      const hasMultipleLinks = Array.isArray(links) && links.length > 1;

      const suggestions: BibleSuggestion[] = [
        {
          text: query,
          command: 'link',
          description: hasMultipleLinks
            ? this.t('suggestions.createLinks', { text: formattedText })
            : this.t('suggestions.createLink', { text: formattedText }),
        },
      ];

      // If there are multiple links, add individual open options
      if (hasMultipleLinks) {
        const verseRanges = reference.verseRanges!.map((range) => {
          const start = parseInt(range.start);
          const end = parseInt(range.end);
          return start === end ? start.toString() : `${start}-${end}`;
        });

        verseRanges.forEach((range, i) => {
          suggestions.push({
            text: query,
            command: 'open',
            description: this.t('suggestions.createAndOpenVerse', { verse: range }),
            linkIndex: i,
          });
        });
      } else {
        suggestions.push({
          text: query,
          command: 'open',
          description: this.t('suggestions.createAndOpen', { text: formattedText }),
        });
      }

      return suggestions;
    }
    return [];
  }

  renderSuggestion(suggestion: BibleSuggestion, el: HTMLElement): void {
    el.setText(suggestion.description);
  }

  selectSuggestion(suggestion: BibleSuggestion): void {
    if (!this.context) return;

    const { context } = this;
    const editor = context.editor;

    // Convert the Bible reference to a link
    const convertedLink = convertBibleTextToMarkdownLink(
      suggestion.text,
      this.plugin.settings.useShortNames,
      this.plugin.settings.language,
    );

    // Replace the entire command and reference with the converted link
    editor.replaceRange(convertedLink, context.start, context.end);

    // Handle opening links
    if (suggestion.command === 'open') {
      const url = convertBibleTextToLink(suggestion.text, this.plugin.settings.language);
      if (Array.isArray(url)) {
        // For open-specific, open the specified link, otherwise open first
        window.open(url[suggestion.linkIndex || 0]);
      } else {
        window.open(url);
      }
    }
  }
}

export default class LibraryLinkerPlugin extends Plugin {
  settings: LinkReplacerSettings;
  private bibleSuggester: BibleReferenceSuggester;
  private t = TranslationService.getInstance().t.bind(TranslationService.getInstance());

  async onload() {
    await this.loadSettings();

    // Add the command for all link replacement
    this.addCommand({
      id: 'replace-links',
      name: this.t('commands.replaceLinks'),
      editorCallback: (editor: Editor) => {
        const currentContent = editor.getValue();
        const updatedContent = convertLinks(currentContent, 'all');
        if (currentContent !== updatedContent) {
          editor.setValue(updatedContent);
        }
      },
    });

    // Add command for Bible links only
    this.addCommand({
      id: 'replace-bible-links',
      name: this.t('commands.replaceBibleLinks'),
      editorCallback: (editor: Editor) => {
        const currentContent = editor.getValue();
        const updatedContent = convertLinks(currentContent, 'bible');
        if (currentContent !== updatedContent) {
          editor.setValue(updatedContent);
        }
      },
    });

    // Add command for publication links only
    this.addCommand({
      id: 'replace-publication-links',
      name: this.t('commands.replacePublicationLinks'),
      editorCallback: (editor: Editor) => {
        const currentContent = editor.getValue();
        const updatedContent = convertLinks(currentContent, 'publication');
        if (currentContent !== updatedContent) {
          editor.setValue(updatedContent);
        }
      },
    });

    // Add command for Bible text conversion
    this.addCommand({
      id: 'convert-bible-text',
      name: this.t('commands.convertBibleReference'),
      editorCallback: (editor: Editor) => {
        const selection = editor.getSelection();
        if (selection) {
          const convertedLink = convertBibleTextToMarkdownLink(
            selection,
            this.settings.useShortNames,
            this.settings.language,
          );
          editor.replaceSelection(convertedLink);
        }
      },
    });

    // Add settings tab
    this.addSettingTab(new LinkReplacerSettingTab(this.app, this));
    this.bibleSuggester = new BibleReferenceSuggester(this);
    this.registerEditorSuggest(this.bibleSuggester);
  }

  onunload() {
    // Clean up plugin resources if needed
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class LinkReplacerSettingTab extends PluginSettingTab {
  plugin: LibraryLinkerPlugin;
  private t = TranslationService.getInstance().t.bind(TranslationService.getInstance());

  constructor(app: App, plugin: LibraryLinkerPlugin) {
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
        }),
      );
  }
}
