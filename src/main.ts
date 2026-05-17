import { Editor, Notice, Plugin, Menu } from 'obsidian';
import { ConversionType, convertLinks } from '@/utils/convertLinks';
import type { LinkReplacerSettings, LinkStyles, BibleQuoteFormat } from '@/types';
import { BIBLE_QUOTE_TEMPLATES } from '@/types';
import { TranslationService } from '@/services/TranslationService';
import { VaultOfflineBibleRepository } from '@/services/VaultOfflineBibleRepository';
import { OfflineBibleCitationProvider } from '@/services/OfflineBibleCitationProvider';
import { OnlineBibleCitationProvider } from '@/services/OnlineBibleCitationProvider';
import { ConfiguredBibleCitationProvider } from '@/services/ConfiguredBibleCitationProvider';
import { BibleEpubImportService } from '@/services/BibleEpubImportService';
import { getOfflineBibleVaultPath } from '@/services/PluginDataPathService';
import { BibleTextFetcher } from '@/services/BibleTextFetcher';
import { loadBibleBooks } from '@/stores/bibleBooks';
import { JWLibraryLinkerSettings } from '@/JWLibraryLinkerSettings';
import { BibleReferenceSuggester } from '@/BibleReferenceSuggester';
import { linkUnlinkedBibleReferences } from '@/utils/linkUnlinkedBibleReferences';
import { ConvertSuggester } from '@/ConvertSuggester';
import { insertAllBibleQuotes, insertBibleQuoteAtCursor } from '@/utils/insertBibleQuotes';
import { logger } from '@/utils/logger';
import { getBookLanguage } from '@/utils/signLanguage';
import { ContentSelection } from '@/utils/findJWLibraryLinks';

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
  linkFormat: 'jwlibrary',
  bibleQuote: {
    template: BIBLE_QUOTE_TEMPLATES.short,
  },
  offlineBible: {
    enabled: true,
    preferOffline: true,
    allowOnlineFallback: true,
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

  private translationService!: TranslationService;
  private bibleSuggester!: BibleReferenceSuggester;
  private offlineBibleRepository!: VaultOfflineBibleRepository;
  private bibleCitationProvider!: ConfiguredBibleCitationProvider;
  private epubImportService!: BibleEpubImportService;

  private t!: (key: string, variables?: Record<string, string>) => string;

  async onload() {
    this.translationService = new TranslationService();
    await this.translationService.initialize();
    this.t = this.translationService.t.bind(this.translationService);
    BibleTextFetcher.initialize(this.app);

    await this.loadSettings();

    const offlineBibleVaultPath = getOfflineBibleVaultPath(this.app, this.manifest.id);
    this.offlineBibleRepository = new VaultOfflineBibleRepository(
      this.app.vault.adapter,
      offlineBibleVaultPath,
    );
    this.epubImportService = new BibleEpubImportService(this.offlineBibleRepository);

    this.bibleCitationProvider = new ConfiguredBibleCitationProvider(
      () => this.settings,
      new OfflineBibleCitationProvider(this.offlineBibleRepository, this.t),
      new OnlineBibleCitationProvider(),
      this.t,
    );

    loadBibleBooks(getBookLanguage(this.settings.language));

    this.addSettingTab(new JWLibraryLinkerSettings(this.app, this));

    this.addCommand({
      id: 'link-unlinked-bible-references',
      name: this.t('commands.linkUnlinkedBibleReferences'),
      icon: 'link-2',
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
      icon: 'link-2',
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
      icon: 'text-quote',
      editorCallback: async (editor: Editor) => {
        const selection = editor.getSelection();
        let contentSelection: ContentSelection | undefined;

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
          const result = await insertAllBibleQuotes(
            editor,
            this.settings,
            this.bibleCitationProvider,
            contentSelection,
          );
          if (result.inserted > 0) {
            const notice = contentSelection
              ? this.t('notices.bibleQuotesInsertedSelection')
              : this.t('notices.bibleQuotesInserted');
            new Notice(notice);
          } else if (result.fetchFailed > 0) {
            new Notice(this.t('notices.bibleQuoteFetchFailed'));
          } else {
            new Notice(this.t('notices.noBibleLinksFound'));
          }
        } catch (error: unknown) {
          logger.error(
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
      icon: 'text-quote',
      editorCallback: async (editor: Editor) => {
        try {
          const result = await insertBibleQuoteAtCursor(
            editor,
            this.settings,
            this.bibleCitationProvider,
          );
          if (result.inserted) {
            new Notice(this.t('notices.bibleQuoteInsertedAtCursor'));
          } else if (result.alreadyExists) {
            new Notice(this.t('notices.bibleQuoteAlreadyExists'));
          } else if (result.fetchFailed) {
            new Notice(this.t('notices.bibleQuoteFetchFailed'));
          } else {
            new Notice(this.t('notices.noBibleLinkAtCursor'));
          }
        } catch (error: unknown) {
          logger.error(
            'Error inserting Bible quote at cursor:',
            error instanceof Error ? error.message : String(error),
          );
          new Notice(this.t('notices.errorInsertingQuotes'));
        }
      },
    });

    this.bibleSuggester = new BibleReferenceSuggester(this);
    this.registerEditorSuggest(this.bibleSuggester);

    this.registerEvent(
      this.app.workspace.on('editor-menu', (menu: Menu, editor: Editor) => {
        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);

        const jwLibraryRegex = /jwlibrary:\/\/\/finder\?bible=\d{8}(?:-\d{8})?(?:&[^)\s]*)?/;
        if (jwLibraryRegex.test(line)) {
          menu.addItem((item) => {
            item
              .setTitle(this.t('contextMenu.insertBibleQuote'))
              .setIcon('quote-glyph')
              .onClick(async () => {
                try {
                  const result = await insertBibleQuoteAtCursor(
                    editor,
                    this.settings,
                    this.bibleCitationProvider,
                  );
                  if (result.inserted) {
                    new Notice(this.t('notices.bibleQuoteInsertedAtCursor'));
                  } else if (result.alreadyExists) {
                    new Notice(this.t('notices.bibleQuoteAlreadyExists'));
                  } else if (result.fetchFailed) {
                    new Notice(this.t('notices.bibleQuoteFetchFailed'));
                  } else {
                    new Notice(this.t('notices.noBibleLinkAtCursor'));
                  }
                } catch (error: unknown) {
                  logger.error(
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

    logger.log('Plugin loaded');
  }

  getTranslationService(): TranslationService {
    return this.translationService;
  }

  getBibleCitationProvider(): ConfiguredBibleCitationProvider {
    return this.bibleCitationProvider;
  }

  getOfflineBibleRepository(): VaultOfflineBibleRepository {
    return this.offlineBibleRepository;
  }

  getEpubImportService(): BibleEpubImportService {
    return this.epubImportService;
  }

  async loadSettings() {
    const savedData = (await this.loadData()) as LinkReplacerSettings;
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...savedData,
      bibleQuote: {
        ...DEFAULT_SETTINGS.bibleQuote,
        ...savedData?.bibleQuote,
      },
      offlineBible: {
        ...DEFAULT_SETTINGS.offlineBible,
        ...savedData?.offlineBible,
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any -- migration from old settings format
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
