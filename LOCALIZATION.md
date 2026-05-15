# Localization and translation

## Supported Languages

| Code | Language                          |
| ---- | --------------------------------- |
| B    | čeština / Czech                   |
| C    | hrvatski / Croatian               |
| D    | Dansk / Danish                    |
| E    | English / English                 |
| F    | français / French                 |
| FI   | suomi / Finnish                   |
| KO   | 한국어 / Korean                   |
| O    | Nederlands / Dutch                |
| S    | español / Spanish                 |
| TPO  | português / Portuguese (Portugal) |
| VT   | Tiếng Việt / Vietnamese           |
| X    | Deutsch / German                  |

### Sign Languages

| Code | Language                                                                  |
| ---- | ------------------------------------------------------------------------- |
| ASL  | American Sign Language / American Sign Language                           |
| AUS  | Auslan (Australian Sign Language) / Australian Sign Language              |
| BFL  | Burkina Faso Sign Language / Burkina Faso Sign Language                   |
| BSL  | British Sign Language / British Sign Language                             |
| BVL  | lengua de señas boliviana / Bolivian Sign Language                        |
| CBS  | lengua de señas cubana / Cuban Sign Language                              |
| CML  | Langue des signes camerounaise / Langue des signes camerounaise           |
| CRS  | Langue des signes centrafricaine / Central African Republic Sign Language |
| DGS  | Deutsche Gebärdensprache / German Sign Language                           |
| FID  | suomalainen viittomakieli / Finnish Sign Language                         |
| HZJ  | hrvatski znakovni jezik / Croatian Sign Language                          |
| ISG  | Irish Sign Language / Irish Sign Language                                 |
| JML  | Jamaican Sign Language / Jamaican Sign Language                           |
| KSL  | 한국 수어 / Korean Sign Language                                          |
| LGP  | Língua Gestual Portuguesa / Portuguese Sign Language                      |
| LSA  | lengua de señas argentina / Argentinean Sign Language                     |
| LSC  | lengua de señas colombiana / Colombian Sign Language                      |
| LSE  | lengua de signos española / Spanish Sign Language                         |
| LSF  | Langue des signes française / French Sign Language                        |
| LSG  | lengua de señas de Guatemala / Guatemalan Sign Language                   |
| LSI  | Langue des signes ivoirienne / Ivorian Sign Language                      |
| LSM  | lengua de señas mexicana / Mexican Sign Language                          |
| LSN  | lenguaje de señas nicaragüense / Nicaraguan Sign Language                 |
| LSP  | lengua de señas paraguaya / Paraguayan Sign Language                      |
| LSQ  | Langue des signes québécoise / Quebec Sign Language                       |
| LSS  | lengua de señas salvadoreña / Salvadoran Sign Language                    |
| LSU  | lengua de señas uruguaya / Uruguayan Sign Language                        |
| LSV  | lengua de señas venezolana / Venezuelan Sign Language                     |
| NGT  | Nederlandse Gebarentaal / Dutch Sign Language                             |
| NZS  | New Zealand Sign Language / New Zealand Sign Language                     |
| OGS  | Österreichische Gebärdensprache / Austrian Sign Language                  |
| PSL  | lengua de señas panameñas / Panamanian Sign Language                      |
| SBF  | Langue des signes de Belgique francophone / Belgian French Sign Language  |
| SCH  | lengua de señas chilena / Chilean Sign Language                           |
| SCR  | lengua de señas costarricense / Costa Rican Sign Language                 |
| SEC  | lengua de señas ecuatoriana / Ecuadorian Sign Language                    |
| SHO  | lengua de señas hondureña / Honduras Sign Language                        |
| SLV  | Việt Nam (Ngôn ngữ ký hiệu) / Vietnamese Sign Language                    |
| SPE  | lengua de señas peruana / Peruvian Sign Language                          |

The plugin UI automatically adapts to your Obsidian language setting, and Bible book names are fully translated for each language.

## Contributing a new language

Thank you for considering adding a new language — every contribution makes the plugin more useful for more people around the world!

To add support for a new language, edit the following files:

1. **`src/consts/languages.ts`** — add the JW Library language code to `LANGUAGE_CODES`, and the Obsidian locale code to `LOCALES` (if not already present)
2. **`src/consts/languages.json`** — move the language's entry from `src/consts/languagesUnsupported.json`; this drives the settings dropdown automatically
3. _(Sign languages only)_ **`src/utils/signLanguage.ts`** — add an entry to `SIGN_LANGUAGE_MAP` to define which spoken language's Bible book names this sign language uses; if the fallback language is already supported, stop here — if not, start from step 1 with the fallback language first
4. **`locale/bibleBooks/<LANG_CODE>.yaml`** — create this file with all 66 books, each with `id`, `aliases`, and `name` (short/medium/long forms)
5. **`locale/<locale>.yaml`** — create this file with all UI translation strings; not needed if the locale already exists

Once your changes are ready, open a pull request and reference the language you added in the description. We are happy to review and merge it!
