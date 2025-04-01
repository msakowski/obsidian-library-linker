import { Editor, Notice, Plugin } from 'obsidian';
import { convertLinks, convertWebLink } from '@/utils/convertLinks';
import { convertBibleTextToMarkdownLink } from '@/utils/convertBibleTextToLink';
import type { BibleReference, LinkReplacerSettings } from '@/types';
import { parseBibleReference } from '@/utils/parseBibleReference';
import { TranslationService } from '@/services/TranslationService';
import { JWLibraryLinkerSettings } from './JWLibraryLinkerSettings';
import { BibleReferenceSuggester } from '@/BibleReferenceSuggester';

export const matchingBibleReferenceRegex =
  /(?:[1-5]?[A-Za-zäöü]{2,24}\s*\d+:\d+(?:-\d+)?(?:\s*,\s*\d+(?:-\d+)?)*\s*,?\s*)/gi;
// 24 random number. Apostelgeschichte is 17 characters long.
// should be enough for language support.

const DEFAULT_SETTINGS: LinkReplacerSettings = {
  useShortNames: false,
  language: 'E',
  openAutomatically: false,
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

    // Add command to link unlinked Bible references
    this.addCommand({
      id: 'link-unlinked-bible-references',
      name: this.t('commands.linkUnlinkedBibleReferences'),
      editorCallback: (editor: Editor) => {
        const currentContent = editor.getValue();
        const lines = currentContent.split('\n');

        let foundReferences: {
          line: number;
          index: number;
          text: string;
          reference: BibleReference;
        }[] = [];

        // Scan each line for Bible references using the findBibleReferenceRegex
        lines.forEach((line, lineIndex) => {
          let match;
          while ((match = matchingBibleReferenceRegex.exec(line)) !== null) {
            try {
              const reference = parseBibleReference(match[0], this.settings.language);
              if (reference) {
                foundReferences.push({
                  line: lineIndex,
                  index: match.index,
                  text: match[0],
                  reference: reference,
                });
              }
            } catch {
              // Skip invalid references
              continue;
            }
          }
        });

        if (foundReferences.length === 0) {
          new Notice(this.t('notices.noBibleReferencesFound'));
          return;
        }

        // Sort references by position (line ascending, then index within line ascending)
        // This ensures we process them in document order
        const sortedRefs = [...foundReferences].sort((a, b) =>
          a.line === b.line ? a.index - b.index : a.line - b.line,
        );

        // Batch all changes in a single transaction
        editor.transaction({
          changes: sortedRefs
            .map((ref) => {
              const convertedLink = convertBibleTextToMarkdownLink(
                ref.reference,
                this.settings.useShortNames,
                this.settings.language,
              );

              if (convertedLink) {
                return {
                  from: { line: ref.line, ch: ref.index },
                  to: { line: ref.line, ch: ref.index + ref.text.length },
                  text: convertedLink,
                };
              }
              return null;
            })
            .filter((change) => change !== null),
        });

        new Notice(
          this.t('notices.convertedBibleReferences', { count: sortedRefs.length.toString() }),
        );
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
