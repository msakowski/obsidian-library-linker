import { Editor, Plugin } from 'obsidian';
import { convertLinks, convertWebLink } from '@/utils/convertLinks';
import { convertBibleTextToMarkdownLink } from '@/utils/convertBibleTextToLink';
import type { LinkReplacerSettings } from '@/types';
import { parseBibleReference } from '@/utils/parseBibleReference';
import { TranslationService } from '@/services/TranslationService';
import { JWLibraryLinkerSettings } from './JWLibraryLinkerSettings';
import { BibleReferenceSuggester } from '@/BibleReferenceSuggester';

const DEFAULT_SETTINGS: LinkReplacerSettings = {
  useShortNames: false,
  language: 'E',
  openAutomatically: false,
  noLanguageParameter: false,
};

export default class JWLibraryLinkerPlugin extends Plugin {
  settings: LinkReplacerSettings;
  private bibleSuggester: BibleReferenceSuggester;
  private t = TranslationService.getInstance().t.bind(TranslationService.getInstance());

  async onload() {
    await this.loadSettings();

    // Add settings tab
    this.addSettingTab(new JWLibraryLinkerSettings(this.app, this));

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
        const currentContent = editor.getSelection();
        const updatedContent = convertLinks(currentContent, 'bible');
        if (currentContent !== updatedContent) {
          editor.setValue(updatedContent);
        }
      },
    });

    this.addCommand({
      id: 'replace-web-links',
      name: this.t('commands.replaceWebLinks'),
      editorCallback: (editor: Editor) => {
        const currentContent = editor.getValue();
        const updatedContent = convertLinks(currentContent, 'web');
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
          const reference = parseBibleReference(selection, this.settings.language);
          const convertedLink = convertBibleTextToMarkdownLink(
            reference,
            this.settings.useShortNames,
            this.settings.language,
            this.settings.noLanguageParameter ? undefined : this.settings.language
          );
          if (convertedLink) {
            editor.replaceSelection(convertedLink);
          }
        }
      },
    });

    // Add command for converting jw.org links to jwlibrary:// links
    this.addCommand({
      id: 'convert-web-link',
      name: this.t('commands.convertWebLink'),
      editorCallback: (editor: Editor) => {
        const currentContent = editor.getSelection();
        const updatedContent = convertWebLink(currentContent);
        if (currentContent !== updatedContent) {
          editor.replaceSelection(updatedContent);
        }
      },
    });

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
