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
import type { BibleSuggestion, LinkReplacerSettings } from '@/types';
import { formatBibleText } from '@/utils/formatBibleText';

const DEFAULT_SETTINGS: LinkReplacerSettings = {
  useShortNames: false,
};

class BibleReferenceSuggester extends EditorSuggest<BibleSuggestion> {
  plugin: LibraryLinkerPlugin;

  constructor(plugin: LibraryLinkerPlugin) {
    super(plugin.app);
    this.plugin = plugin;
  }

  onTrigger(cursor: EditorPosition, editor: Editor): EditorSuggestTriggerInfo | null {
    const line = editor.getLine(cursor.line);
    const subString = line.substring(0, cursor.ch);

    // Modified regex to handle bullet points and other list markers at start of line
    const match = subString.match(
      /(?:^|\s)(?:[-*+]\s+)?\/b\s+([a-z0-9äöüß]+\s*\d+:\d+(?:(?:-\d+)|(?:,\s*\d+(?:-\d+)?)*)?)?$/i,
    );

    if (!match) return null;

    return {
      start: {
        ch: match.index! + match[0].indexOf('/'), // Adjust start position to the actual command
        line: cursor.line,
      },
      end: cursor,
      query: match[1] || '',
    };
  }

  getSuggestions(context: EditorSuggestContext): BibleSuggestion[] {
    const query = context.query;

    // Regex that handles both with and without space, including complex verse references
    if (query.match(/^[a-z0-9äöüß]+\s*\d+:\d+(?:(?:-\d+)|(?:,\s*\d+(?:-\d+)?)*)?$/i)) {
      const formattedText = formatBibleText(query, true); // Use short format
      return [
        {
          text: query,
          command: 'link',
          description: `Create link: ${formattedText}`,
        },
        {
          text: query,
          command: 'open',
          description: `Create and open: ${formattedText}`,
        },
      ];
    }
    return [];
  }

  renderSuggestion(suggestion: BibleSuggestion, el: HTMLElement): void {
    el.setText(`${suggestion.description}`);
  }

  selectSuggestion(suggestion: BibleSuggestion): void {
    if (!this.context) return;

    const { context } = this;
    const editor = context.editor;

    // Convert the Bible reference to a link
    const convertedLink = convertBibleTextToMarkdownLink(
      suggestion.text,
      this.plugin.settings.useShortNames,
    );

    // Replace the entire command and reference with the converted link
    editor.replaceRange(convertedLink, context.start, context.end);

    // If this was a /bo command, open the link
    if (suggestion.command === 'open') {
      const url = convertBibleTextToLink(suggestion.text);
      if (Array.isArray(url)) {
        // Open first link in sequence
        window.open(url[0]);
        // TODO: maybe add options to command list for each link?
      } else {
        window.open(url);
      }
    }
  }
}

export default class LibraryLinkerPlugin extends Plugin {
  settings: LinkReplacerSettings;
  private bibleSuggester: BibleReferenceSuggester;

  async onload() {
    await this.loadSettings();

    // Add the command for all link replacement
    this.addCommand({
      id: 'replace-links',
      name: 'Replace all links',
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
      name: 'Replace Bible verse links',
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
      name: 'Replace publication links',
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
      name: 'Convert Bible reference to Library link',
      editorCallback: (editor: Editor) => {
        const selection = editor.getSelection();
        if (selection) {
          const convertedLink = convertBibleTextToMarkdownLink(
            selection,
            this.settings.useShortNames,
          );
          editor.replaceSelection(convertedLink);
        }
      },
    });

    // Add settings tab
    this.addSettingTab(new LinkReplacerSettingTab(this.app, this));

    // Register the Bible reference suggester
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

  constructor(app: App, plugin: LibraryLinkerPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName('Use short names in Bible links')
      .setDesc(
        'When enabled, Bible references will use abbreviated book names (e.g., "1Pe" instead of "1. Peter")',
      )
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.useShortNames).onChange(async (value) => {
          this.plugin.settings.useShortNames = value;
          await this.plugin.saveSettings();
        }),
      );
  }
}
