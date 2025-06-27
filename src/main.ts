import { Editor, Notice, Plugin } from 'obsidian';
import { ConversionType, convertLinks } from '@/utils/convertLinks';
import type { LinkReplacerSettings, LinkStyles } from '@/types';
import { TranslationService } from '@/services/TranslationService';
import { JWLibraryLinkerSettings } from '@/JWLibraryLinkerSettings';
import { BibleReferenceSuggester } from '@/BibleReferenceSuggester';
import { linkUnlinkedBibleReferences } from '@/utils/linkUnlinkedBibleReferences';
import { ConvertSuggester } from './ConvertSuggester';

export const DEFAULT_STYLES: LinkStyles = {
  bookLength: 'medium',
  prefixOutsideLink: '',
  prefixInsideLink: '',
  suffixInsideLink: '',
  suffixOutsideLink: ' ',
  fontStyle: 'normal',
};

export const DEFAULT_SETTINGS: LinkReplacerSettings = {
  language: 'E',
  openAutomatically: false,
  updatedLinkStructure: 'keepCurrentStructure',
  noLanguageParameter: false,
  ...DEFAULT_STYLES,
};

export default class JWLibraryLinkerPlugin extends Plugin {
  settings: LinkReplacerSettings = DEFAULT_SETTINGS;
  private bibleSuggester: BibleReferenceSuggester = new BibleReferenceSuggester(this);
  private t = TranslationService.getInstance().t.bind(TranslationService.getInstance());

  async onload() {
    await this.loadSettings();

    // Add settings tab
    this.addSettingTab(new JWLibraryLinkerSettings(this.app, this));

    // Add command to link unlinked Bible references
    this.addCommand({
      id: 'link-unlinked-bible-references',
      name: this.t('commands.linkUnlinkedBibleReferences'),
      editorCallback: (editor: Editor) => {
        const selection = {
          text: editor.getSelection(),
          from: editor.getCursor('from'),
          to: editor.getCursor('to'),
        };

        if (!selection) {
          new Notice(this.t('notices.pleaseSelectText'));
          return;
        }

        linkUnlinkedBibleReferences(selection.text, this.settings, ({ changes, error }) => {
          if (changes.length > 0) {
            editor.transaction({
              changes: changes.map((change) => ({
                ...change,
                from: {
                  line: change.from.line + selection.from.line,
                  ch: change.from.ch + selection.from.ch,
                },
                to: {
                  line: change.to.line + selection.from.line,
                  ch: change.to.ch + selection.from.ch,
                },
              })),
            });

            new Notice(
              this.t('notices.convertedBibleReferences', {
                count: String(changes.length),
              }),
            );
          } else {
            new Notice(this.t(error || 'notices.noBibleReferencesFound'));
          }
        });
      },
    });

    this.addCommand({
      id: 'convert-jw-links',
      name: this.t('commands.convertToJWLibraryLinks'),
      editorCallback: (editor: Editor) => {
        const selection = editor.getSelection();
        if (!selection) {
          new Notice(this.t('notices.pleaseSelectText'));
          return;
        }

        new ConvertSuggester(this.app, (selectedType: ConversionType) => {
          const convertedLinks = convertLinks(selection, selectedType, this.settings);
          if (selection !== convertedLinks) {
            editor.replaceSelection(convertedLinks);
          }
        }).open();
      },
    });

    this.bibleSuggester = new BibleReferenceSuggester(this);
    this.registerEditorSuggest(this.bibleSuggester);
  }

  onunload() {
    // Clean up plugin resources if needed
  }

  async loadSettings() {
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...((await this.loadData()) as LinkReplacerSettings),
    };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
