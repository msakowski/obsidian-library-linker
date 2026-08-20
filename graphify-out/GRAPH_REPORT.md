# Graph Report - .  (2026-07-05)

## Corpus Check
- 64 files · ~41,492 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 393 nodes · 515 edges · 73 communities (55 shown, 18 thin omitted)
- Extraction: 76% EXTRACTED · 24% INFERRED · 0% AMBIGUOUS · INFERRED: 123 edges (avg confidence: 0.8)
- Token cost: 0 input · 84,258 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Language Suggest Input|Language Suggest Input]]
- [[_COMMUNITY_Settings UI Sections|Settings UI Sections]]
- [[_COMMUNITY_Plugin Core & Lifecycle|Plugin Core & Lifecycle]]
- [[_COMMUNITY_EPUB Bible Import|EPUB Bible Import]]
- [[_COMMUNITY_Bible Text Fetcher (WOL)|Bible Text Fetcher (WOL)]]
- [[_COMMUNITY_Localization & Language System|Localization & Language System]]
- [[_COMMUNITY_Offline Citation & Markdown Render|Offline Citation & Markdown Render]]
- [[_COMMUNITY_Vault Offline Bible Repository|Vault Offline Bible Repository]]
- [[_COMMUNITY_Reference & Convert Suggesters|Reference & Convert Suggesters]]
- [[_COMMUNITY_Bible Books Store & Lookup|Bible Books Store & Lookup]]
- [[_COMMUNITY_Project Conventions & Policy|Project Conventions & Policy]]
- [[_COMMUNITY_Link Parsing & Quote Insertion|Link Parsing & Quote Insertion]]
- [[_COMMUNITY_Translation Service|Translation Service]]
- [[_COMMUNITY_Plugin Data Paths|Plugin Data Paths]]
- [[_COMMUNITY_Bible Quote Feature Design|Bible Quote Feature Design]]
- [[_COMMUNITY_Configured Citation Provider|Configured Citation Provider]]
- [[_COMMUNITY_Publication Link Conversion|Publication Link Conversion]]
- [[_COMMUNITY_Number Padding Utils|Number Padding Utils]]
- [[_COMMUNITY_Citation Routing Logic|Citation Routing Logic]]
- [[_COMMUNITY_JW Library Link Formatting|JW Library Link Formatting]]
- [[_COMMUNITY_Bible Reference Model|Bible Reference Model]]
- [[_COMMUNITY_Git Hooks & CI|Git Hooks & CI]]
- [[_COMMUNITY_Debug Logging|Debug Logging]]
- [[_COMMUNITY_Markdown Component|Markdown Component]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 72|Community 72]]

## God Nodes (most connected - your core abstractions)
1. `BibleEpubImportService` - 21 edges
2. `BibleTextFetcher` - 20 edges
3. `VaultOfflineBibleRepository` - 15 edges
4. `Plugin` - 12 edges
5. `Setting` - 11 edges
6. `renderLinkStyling()` - 10 edges
7. `renderOfflineBibleContent()` - 10 edges
8. `TranslationService` - 9 edges
9. `JWLibraryLinkerPlugin` - 8 edges
10. `renderBibleQuote()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Bun runtime & tooling` --semantically_similar_to--> `Tech stack (TS/esbuild/Vitest)`  [INFERRED] [semantically similar]
  AGENTS.md → DEVELOPMENT.md
- `Respect copyright / no copyrighted content` --semantically_similar_to--> `Security, privacy & compliance policy`  [INFERRED] [semantically similar]
  CONTRIBUTING.md → AGENTS.md
- `Contribution process` --references--> `Contributing a new language`  [EXTRACTED]
  CONTRIBUTING.md → LOCALIZATION.md
- `formatJWLibraryLink` --implements--> `jwlibrary:// deep link`  [INFERRED]
  CLAUDE.md → README.md
- `WOL as primary Bible-text source` --conceptually_related_to--> `Insert Bible quotes feature`  [INFERRED]
  CHANGELOG.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Adding a new language wiring** — localization_adding_new_language, consts_languages_language_codes, consts_languages_languages_json, utils_signlanguage_sign_language_map, localization_biblebooks_yaml, localization_locale_yaml [EXTRACTED 0.90]
- **Bible reference conversion pipeline** — claude_bible_reference_flow, utils_parsebiblereference_parsebiblereference, utils_formatjwlibrarylink_formatjwlibrarylink, readme_jwlibrary_deep_link [EXTRACTED 0.85]
- **Community catalog readiness rules** — agents_community_catalog_review, agents_manifest_rules, agents_security_privacy, agents_definition_of_done [INFERRED 0.75]

## Communities (73 total, 18 thin omitted)

### Community 0 - "Language Suggest Input"
Cohesion: 0.06
Nodes (12): LanguageSuggest, AbstractInputSuggest, App, Editor, EditorPosition, EditorSuggest, FuzzySuggestModal, MarkdownView (+4 more)

### Community 1 - "Settings UI Sections"
Cohesion: 0.16
Nodes (12): createSettingGroup(), renderBibleQuote(), renderGeneralSettings(), presetButton(), renderLinkStyling(), handleBibleImport(), handleBibleRemoval(), renderInstalledBibleList() (+4 more)

### Community 2 - "Plugin Core & Lifecycle"
Cohesion: 0.10
Nodes (7): service: OfflineBibleCitationProvider, service: OnlineBibleCitationProvider, JWLibraryLinkerPlugin, migrateFormatToTemplate(), Component, Plugin, util: linkUnlinkedBibleReferences

### Community 3 - "EPUB Bible Import"
Cohesion: 0.13
Nodes (4): BibleEpubImportService, posixDirname(), getLanguageFromLocale(), webCryptoSha256()

### Community 4 - "Bible Text Fetcher (WOL)"
Cohesion: 0.14
Nodes (3): BibleTextFetcher, OnlineBibleCitationProvider, getLocaleFromLanguage()

### Community 5 - "Localization & Language System"
Cohesion: 0.12
Nodes (22): Sign language support release, Bible reference flow (parse -> format -> markdown), Translation-key error convention, Two language systems (Locale vs Language), LANGUAGE_CODES, languages.json config, LOCALES, esbuild YAML bundling plugin (+14 more)

### Community 6 - "Offline Citation & Markdown Render"
Cohesion: 0.10
Nodes (12): concept: sign language resolves to spoken base for book names, OfflineBibleCitationProvider, renderMarkdown(), updateBibleQuotePreview(), formatJWLibraryLink.test, MarkdownRenderer, signLanguage.test, applyFontStyle() (+4 more)

### Community 7 - "Vault Offline Bible Repository"
Cohesion: 0.16
Nodes (5): VaultOfflineBibleRepository, util: cleanHtmlText, padBook, padChapter, padVerse

### Community 8 - "Reference & Convert Suggesters"
Cohesion: 0.14
Nodes (6): BibleReferenceSuggester, ConvertSuggester, extractBibleReferenceFromMatch(), parseBibleReference(), parseVerseNumber(), parseVerseRanges()

### Community 9 - "Bible Books Store & Lookup"
Cohesion: 0.13
Nodes (12): getBibleBookById(), getBibleBooks(), __getCache(), loadBibleBooks(), initializeTestBibleBooks(), buildBookNameRegex(), cleanTerm(), findBook() (+4 more)

### Community 10 - "Project Conventions & Policy"
Cohesion: 0.14
Nodes (15): Bun runtime & tooling, Business Rules compliance, Community catalog review rules, Definition of done, manifest.json rules, Obsidian plugin template guidelines, Security, privacy & compliance policy, Super strict TypeScript config (+7 more)

### Community 11 - "Link Parsing & Quote Insertion"
Cohesion: 0.28
Nodes (10): cleanHtmlText(), findJWLibraryLinks(), findJWLibraryLinksInLine(), parseJWLibraryLink(), parseSingleBibleCode(), generateBibleQuoteText(), insertAllBibleQuotes(), insertBibleQuoteAtCursor() (+2 more)

### Community 13 - "Plugin Data Paths"
Cohesion: 0.47
Nodes (4): getOfflineBibleAbsolutePath(), getOfflineBibleVaultPath(), openOfflineBibleFolder(), FileSystemAdapter

### Community 14 - "Bible Quote Feature Design"
Cohesion: 0.50
Nodes (5): Offline Bible EPUB import (cross-platform), WOL as primary Bible-text source, Insert Bible quotes feature, Customizable quote template, BibleTextFetcher service

### Community 16 - "Publication Link Conversion"
Cohesion: 0.40
Nodes (3): convertLinks(), convertPublicationReference(), convertLinks.test

### Community 17 - "Number Padding Utils"
Cohesion: 0.70
Nodes (4): padBook(), padChapter(), padNumber(), padVerse()

### Community 18 - "Citation Routing Logic"
Cohesion: 0.67
Nodes (4): ConfiguredBibleCitationProvider class (routes citation requests based on settings), Citation routing logic: preferOffline → online fallback → offline fallback, OfflineBibleCitationProvider class (BibleCitationProvider via OfflineBibleRepository), OnlineBibleCitationProvider class (BibleCitationProvider via BibleTextFetcher)

### Community 21 - "Bible Reference Model"
Cohesion: 0.67
Nodes (3): concept: multi-chapter Bible reference (endChapter field), concept: single-chapter books omit chapter number in formatted text, formatBibleText.test

### Community 22 - "Git Hooks & CI"
Cohesion: 0.67
Nodes (3): simple-git-hooks (pre-commit/pre-push), ESLint + remark linting, GitHub Actions CI (test.yml)

### Community 23 - "Debug Logging"
Cohesion: 0.67
Nodes (3): DEBUG compile-time logging, pnpm dev watch mode, logger utility

## Knowledge Gaps
- **40 isolated node(s):** `version-bump script`, `padVerse`, `SIGN_LANGUAGE_MAP`, `electron shell type declaration`, `locale:all module declaration` (+35 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BibleTextFetcher` connect `Bible Text Fetcher (WOL)` to `Plugin Core & Lifecycle`, `Vault Offline Bible Repository`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `handleBibleImport()` connect `Settings UI Sections` to `Plugin Core & Lifecycle`, `EPUB Bible Import`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Why does `Plugin` connect `Plugin Core & Lifecycle` to `Language Suggest Input`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **What connects `version-bump script`, `padVerse`, `SIGN_LANGUAGE_MAP` to the rest of the system?**
  _43 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Language Suggest Input` be split into smaller, more focused modules?**
  _Cohesion score 0.062388591800356503 - nodes in this community are weakly interconnected._
- **Should `Plugin Core & Lifecycle` be split into smaller, more focused modules?**
  _Cohesion score 0.10052910052910052 - nodes in this community are weakly interconnected._
- **Should `EPUB Bible Import` be split into smaller, more focused modules?**
  _Cohesion score 0.1349206349206349 - nodes in this community are weakly interconnected._