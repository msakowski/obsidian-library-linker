import { Editor, Notice, Plugin, Menu } from 'obsidian';
import { ConversionType, convertLinks } from '@/utils/convertLinks';
import type { LinkReplacerSettings, LinkStyles, BibleQuoteFormat } from '@/types';
import { BIBLE_QUOTE_TEMPLATES } from '@/types';
import { FileLoaderService } from '@/services/FileLoaderService';
import { TranslationService } from '@/services/TranslationService';
import { initializeBibleBooks, loadBibleBooks } from '@/stores/bibleBooks';
import { JWLibraryLinkerSettings } from '@/JWLibraryLinkerSettings';
import { BibleReferenceSuggester } from '@/BibleReferenceSuggester';
import { linkUnlinkedBibleReferences } from '@/utils/linkUnlinkedBibleReferences';
import { ConvertSuggester } from './ConvertSuggester';
import {
  insertAllBibleQuotes,
  insertBibleQuoteAtCursor,
  type ContentSelection,
} from '@/utils/insertBibleQuotes';

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
  reconvertExistingLinks: false,
  bibleQuote: {
    template: BIBLE_QUOTE_TEMPLATES.short,
  },
  ...DEFAULT_STYLES,
};

function migrateFormatToTemplate(format: BibleQuoteFormat): string {
  switch (format) {
    case 'short':
      return BIBLE_QUOTE_TEMPLATES.short;
    case 'long-foldable':
      return BIBLE_QUOTE_TEMPLATES.foldable;
    case 'long-expanded':
      return BIBLE_QUOTE_TEMPLATES.expanded;
    default:
      return BIBLE_QUOTE_TEMPLATES.short;
  }
}

export default class JWLibraryLinkerPlugin extends Plugin {
  settings: LinkReplacerSettings = DEFAULT_SETTINGS;

  // Services
  private fileLoader!: FileLoaderService;
  private translationService!: TranslationService;
  private bibleSuggester!: BibleReferenceSuggester;

  // Convenience binding for backward compatibility
  private t!: (key: string, variables?: Record<string, string>) => string;

  async onload() {
    // Step 1: Initialize file loader
    this.fileLoader = new FileLoaderService(this.app, this.manifest.dir || '');

    // Step 2: Initialize translation service
    this.translationService = new TranslationService(this.fileLoader);
    await this.translationService.initialize();
    this.t = this.translationService.t.bind(this.translationService);

    // Step 3: Load settings (may update language)
    await this.loadSettings();

    // Step 4: Initialize bible books store with saved language
    initializeBibleBooks(this.fileLoader);
    await loadBibleBooks(this.settings.language);

    // Step 5: Initialize UI components
    this.bibleSuggester = new BibleReferenceSuggester(this);

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

        if (!selection.text) {
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

        new ConvertSuggester(this.app, this, (selectedType: ConversionType) => {
          const convertedLinks = convertLinks(selection, selectedType, this.settings);
          if (selection !== convertedLinks) {
            editor.replaceSelection(convertedLinks);
          }
        }).open();
      },
    });

    this.addCommand({
      id: 'insert-bible-quotes',
      name: this.t('commands.insertBibleQuotes'),
      editorCallback: async (editor: Editor) => {
        const selection = editor.getSelection();
        let contentSelection: ContentSelection | undefined;

        // If text is selected, work only on the selection
        if (selection) {
          const selectionRange = editor.listSelections()[0];
          const startLine = Math.min(selectionRange.anchor.line, selectionRange.head.line);
          const endLine = Math.max(selectionRange.anchor.line, selectionRange.head.line);
          contentSelection = {
            text: selection,
            startLine,
            endLine,
          };
        }

        try {
          const count = await insertAllBibleQuotes(editor, this.settings, false, contentSelection);
          if (count > 0) {
            const notice = contentSelection
              ? this.t('notices.bibleQuotesInsertedSelection')
              : this.t('notices.bibleQuotesInserted');
            new Notice(notice);
          } else {
            new Notice(this.t('notices.noBibleLinksFound'));
          }
        } catch (error: unknown) {
          console.error(
            'Error inserting Bible quotes:',
            error instanceof Error ? error.message : String(error),
          );
          new Notice(this.t('notices.errorInsertingQuotes'));
        }
      },
    });

    this.addCommand({
      id: 'insert-bible-quote-at-cursor',
      name: this.t('commands.insertBibleQuoteAtCursor'),
      editorCallback: async (editor: Editor) => {
        try {
          const result = await insertBibleQuoteAtCursor(editor, this.settings);
          if (result.inserted) {
            new Notice(this.t('notices.bibleQuoteInsertedAtCursor'));
          } else if (result.alreadyExists) {
            new Notice(this.t('notices.bibleQuoteAlreadyExists'));
          } else {
            new Notice(this.t('notices.noBibleLinkAtCursor'));
          }
        } catch (error: unknown) {
          console.error(
            'Error inserting Bible quote at cursor:',
            error instanceof Error ? error.message : String(error),
          );
          new Notice(this.t('notices.errorInsertingQuotes'));
        }
      },
    });

    this.bibleSuggester = new BibleReferenceSuggester(this);
    this.registerEditorSuggest(this.bibleSuggester);

    // Register context menu for JW Library links
    this.registerEvent(
      this.app.workspace.on('editor-menu', (menu: Menu, editor: Editor) => {
        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);

        // Check if the cursor line contains a JW Library link
        const jwLibraryRegex = /jwlibrary:\/\/\/finder\?bible=\d{8}(?:-\d{8})?(?:&[^)\s]*)?/;
        if (jwLibraryRegex.test(line)) {
          menu.addItem((item) => {
            item
              .setTitle(this.t('contextMenu.insertBibleQuote'))
              .setIcon('quote-glyph')
              .onClick(async () => {
                try {
                  const result = await insertBibleQuoteAtCursor(editor, this.settings);
                  if (result.inserted) {
                    new Notice(this.t('notices.bibleQuoteInsertedAtCursor'));
                  } else if (result.alreadyExists) {
                    new Notice(this.t('notices.bibleQuoteAlreadyExists'));
                  } else {
                    new Notice(this.t('notices.noBibleLinkAtCursor'));
                  }
                } catch (error: unknown) {
                  console.error(
                    'Error inserting Bible quote from context menu:',
                    error instanceof Error ? error.message : String(error),
                  );
                  new Notice(this.t('notices.errorInsertingQuotes'));
                }
              });
          });
        }
      }),
    );
  }

  /**
   * Get the translation service instance
   */
  getTranslationService(): TranslationService {
    return this.translationService;
  }

  onunload() {
    // Clean up plugin resources if needed
  }

  async loadSettings() {
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...((await this.loadData()) as LinkReplacerSettings),
    };

    // Migrate old format to template
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    const oldFormat = (this.settings.bibleQuote as any).format as BibleQuoteFormat | undefined;
    if (oldFormat && !this.settings.bibleQuote.template) {
      this.settings.bibleQuote.template = migrateFormatToTemplate(oldFormat);
      await this.saveSettings();
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
