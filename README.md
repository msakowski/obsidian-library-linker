# JW Library Linker for Obsidian

Instantly create, convert, and enrich Bible references with direct links to [JW Library](https://www.jw.org/en/online-help/jw-library/). Type a reference, get a clickable link — it's that simple.

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

## Features

### 1. Create Bible Reference Links

Type a Bible reference and the plugin creates a markdown link that opens directly in JW Library.

**Command mode** — type `/b` followed by a reference:

```txt
/b mat 24:14     →  [Matthew 24:14](jwlibrary:///finder?bible=40024014)
/b joh 3:16      →  [John 3:16](jwlibrary:///finder?bible=43003016)
```

**Silent mode** — just type the reference directly. Once a valid reference is detected, the suggestion popup appears automatically.

**Supported reference formats:**

| Format               | Example                      | Result                    |
| -------------------- | ---------------------------- | ------------------------- |
| Single verse         | `/b mat 24:14`               | Matthew 24:14             |
| Verse range          | `/b rom 8:28-30`             | Romans 8:28-30            |
| Multiple verses      | `/b joh 1:1,2,4`             | John 1:1-2, 4             |
| Complex ranges       | `/b joh 1:1,2,4,6,7-8,12-14` | John 1:1-2, 4, 6-8, 12-14 |
| Multi-chapter        | `/b mat 3:1-4:11`            | Matthew 3:1–4:11          |
| Single-chapter books | `/b jude 3`                  | Jude 3                    |

### 2. Insert Bible Quotes

Fetch actual Bible text from jw.org and insert it directly into your notes.

**Three ways to insert quotes:**

1. **Command palette** → "Insert Bible quotes for JW Library links" — processes selected text or the entire note
2. **Command palette** → "Insert Bible quote at cursor" — inserts a quote for the link at your cursor
3. **Right-click** on a JW Library link → "Insert Bible quote"

**Customizable quote templates:**

```markdown
<!-- Link + quote -->

[Matthew 6:33](jwlibrary:///finder?bible=40006033)
> But keep on seeking first the Kingdom...

<!-- Foldable callout (collapsed by default) -->

> [!quote]- [Matthew 6:33](jwlibrary:///finder?bible=40006033)
> But keep on seeking first the Kingdom...

<!-- Expanded callout -->

> [!quote] [Matthew 6:33](jwlibrary:///finder?bible=40006033)
> But keep on seeking first the Kingdom...
```

You can also create your own template using the variables `{bibleRef}`, `{bibleRefLinked}`, and `{quote}`.

### 3. Convert Existing Links

Convert `jwpub://` links, publication links, and jw.org web links into `jwlibrary://` links that open directly in JW Library.

1. Select text containing links
2. Open the command palette (Ctrl/Cmd + P)
3. Run "Convert links in selection to JW Library links"
4. Choose what to convert:
   - **All** — Bible verses, publications, and web links
   - **Bible** — Bible verse links only
   - **Publication** — Publication links only

### 4. Link Unlinked Bible References

Have plain-text Bible references in your notes? Convert them all at once.

1. Select text containing references like "John 3:16" or "Romans 8:28"
2. Open the command palette (Ctrl/Cmd + P)
3. Run "Link unlinked Bible references"

The plugin detects valid references and converts them to JW Library links.

## Settings

### Language

Choose the language for Bible book names and link generation. The plugin UI language follows your Obsidian language setting automatically.

### Open Automatically

Moves the "Create link and open" option to the top of the suggestion list, so pressing Enter opens the link in JW Library immediately.

### Link Styling

Customize how links appear in your notes:

- **Book name length** — short (`Mat`), medium (`Matt.`), or long (`Matthew`)
- **Prefix/suffix** — add text before or after the link (e.g., parentheses)
- **Font style** — normal, _italic_, or **bold**
- **Presets** — quickly apply common styles like `(Mat 3:16)` or `📖 Mat 3:16`

### Language-Independent Links

Omits the language parameter from generated links. Links will open in JW Library's default language instead.

### Keep Link Text

When converting existing links, choose whether to preserve the original link text or reformat it using your plugin settings.

### Reconvert Existing Links

Re-process already converted `jwlibrary://` links with your current formatting settings.

### Bible Quote Template

Customize the format of inserted Bible quotes with a live preview. Choose from presets or write your own template.

## Commands

| Command                                        | Description                                                |
| ---------------------------------------------- | ---------------------------------------------------------- |
| Link unlinked Bible references                 | Convert plain text references in selection to links        |
| Convert links in selection to JW Library links | Convert jwpub/web links to JW Library format               |
| Insert Bible quotes for JW Library links       | Fetch and insert Bible text for links in selection or note |
| Insert Bible quote at cursor                   | Insert Bible text for the link at cursor position          |

## Known Issues

| Plugin                                                                                            | Issue                             | Fix                                     |
| ------------------------------------------------------------------------------------------------- | --------------------------------- | --------------------------------------- |
| [Iconize](obsidian://show-plugin?id=obsidian-icon-folder)                                         | Clock emoji shows when typing `:` | Change Iconize trigger from `:` to `::` |
| [Various Complements](https://tadashi-aikawa.github.io/docs-obsidian-various-complements-plugin/) | Suggestions get overwritten       | No fix available                        |

## Contributing

If you have ideas or want to help improve this plugin, take a look at our [contribution guidelines](https://github.com/msakowski/obsidian-library-linker/blob/main/CONTRIBUTING.md).

## Support

If you find this plugin useful, consider [buying me a coffee](https://buymeacoffee.com/m12i).
