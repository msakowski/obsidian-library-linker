// obsidian language
export type Locale =
  | 'en'
  | 'de'
  | 'da'
  | 'fi'
  | 'es'
  | 'nl'
  | 'ko'
  | 'fr'
  | 'pt'
  | 'hr'
  | 'vi'
  | 'cs';

// plugin language
export type Language =
  | 'E'
  | 'X'
  | 'D'
  | 'FI'
  | 'S'
  | 'O'
  | 'KO'
  | 'F'
  | 'TPO'
  | 'C'
  | 'VT'
  | 'B'
  // Sign languages
  | 'ASL'
  | 'LSA'
  | 'AUS'
  | 'OGS'
  | 'SBF'
  | 'BVL'
  | 'BSL'
  | 'BFL'
  | 'CRS'
  | 'SCH'
  | 'LSC'
  | 'SCR'
  | 'HZJ'
  | 'CBS'
  | 'NGT'
  | 'SEC'
  | 'FID'
  | 'LSF'
  | 'DGS'
  | 'LSG'
  | 'SHO'
  | 'ISG'
  | 'LSI'
  | 'JML'
  | 'KSL'
  | 'CML'
  | 'LSM'
  | 'NZS'
  | 'LSN'
  | 'PSL'
  | 'LSP'
  | 'SPE'
  | 'LGP'
  | 'LSQ'
  | 'LSS'
  | 'LSE'
  | 'LSU'
  | 'LSV'
  | 'SLV';

export interface LanguageInfo {
  code: string;
  locale: string;
  importAliases?: string[];
  vernacular: string;
  script: string;
  name: string;
  isSignLanguage: boolean;
  isRTL: boolean;
}

export type BookLength = 'short' | 'medium' | 'long';

export interface LinkStyles {
  bookLength: BookLength;
  prefixOutsideLink: string;
  prefixInsideLink: string;
  suffixInsideLink: string;
  suffixOutsideLink: string;
  fontStyle: 'normal' | 'italic' | 'bold';
}

export type UpdatedLinkStructure = 'keepCurrentStructure' | 'usePluginSettings';

export type BibleQuoteFormat = 'short' | 'long-foldable' | 'long-expanded';

export const BIBLE_QUOTE_TEMPLATES = {
  short: '{bibleRefLinked}\n> {quote}',
  plain: '> {bibleRefLinked}\n> {quote}',
  foldable: '> [!quote]- {bibleRefLinked}\n> {quote}',
  expanded: '> [!quote] {bibleRefLinked}\n> {quote}',
} as const;

interface BibleQuoteSettings {
  template: string; // Template for quote formatting
}

interface OfflineBibleSettings {
  enabled: boolean;
  preferOffline: boolean;
  allowOnlineFallback: boolean;
}

export interface LinkReplacerSettings extends LinkStyles {
  language: Language;
  openAutomatically: boolean;
  updatedLinkStructure: UpdatedLinkStructure;
  noLanguageParameter: boolean;
  reconvertExistingLinks: boolean;
  bibleQuote: BibleQuoteSettings;
  offlineBible: OfflineBibleSettings;
}

export interface BibleBook {
  id: number;
  prefix?: string;
  aliases: readonly string[];
  name: Record<BookLength, string>;
  chapters: number;
}

export interface VerseRange {
  start: number;
  end: number;
}

export interface BibleReference {
  book: number;
  chapter: number;
  endChapter?: number; // For multi-chapter references (e.g., "Matt. 3:1-4:11")
  verseRanges?: VerseRange[]; // For complex verse references with multiple ranges
}

export interface OfflineBibleCorpusMetadata {
  language: Language;
  sourceFileName: string;
  sourceFileChecksum: string;
  importedAt: string;
  contentVersion?: string;
  bookCount: number;
  chapterCount: number;
  verseCount: number;
}

export interface OfflineBibleChapter {
  language: Language;
  book: number;
  chapter: number;
  title?: string;
  verses: Record<string, string>;
  source: {
    sourceFileChecksum: string;
    importedAt: string;
  };
}

export interface BibleImportRequest {
  filePath?: string;
  fileData?: Uint8Array;
  sourceFileName?: string;
  language?: Language;
  overwriteExisting: boolean;
}

export interface BibleImportResult {
  success: boolean;
  language?: Language;
  warnings: string[];
  error?: string;
  metadata?: OfflineBibleCorpusMetadata;
}

type CitationSource = 'offline' | 'online';

export interface BibleCitationResult {
  success: boolean;
  source: CitationSource;
  text: string;
  citation: string;
  error?: string;
}

export interface BibleCitationProvider {
  getCitation(reference: BibleReference, language: Language): Promise<BibleCitationResult>;
  isLanguageAvailable(language: Language): Promise<boolean>;
}

export interface OfflineBibleRepository {
  getInstalledLanguages(): Promise<Language[]>;
  getMetadata(language: Language): Promise<OfflineBibleCorpusMetadata | null>;
  getChapter(
    language: Language,
    book: number,
    chapter: number,
  ): Promise<OfflineBibleChapter | null>;
  getVerseRange(reference: BibleReference, language: Language): Promise<string | null>;
  saveCorpus(metadata: OfflineBibleCorpusMetadata, chapters: OfflineBibleChapter[]): Promise<void>;
  removeLanguage(language: Language): Promise<void>;
}

export interface EpubImportService {
  importBible(request: BibleImportRequest): Promise<BibleImportResult>;
}

export interface BibleSuggestion {
  text: string;
  command: 'formatBook' | 'link' | 'open' | 'typing';
  description: string;
  linkIndex?: number;
}
