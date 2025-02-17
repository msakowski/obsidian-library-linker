/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => LibraryLinkerPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");

// src/bibleBooks.ts
var bibleBooksDE = [
  { "1mo": "1. Mose" },
  { "2mo": "2. Mose" },
  { "3mo": "3. Mose" },
  { "4mo": "4. Mose" },
  { "5mo": "5. Mose" },
  { "jos": "Josua" },
  { "ri": "Richter" },
  { "ru": "Ruth" },
  { "1sam": "1. Samuel" },
  { "2sam": "2. Samuel" },
  { "1k\xF6": "1. K\xF6nige" },
  { "2k\xF6": "2. K\xF6nige" },
  { "1ch": "1. Chronika" },
  { "2ch": "2. Chronika" },
  { "esr": "Esra" },
  { "neh": "Nehemia" },
  { "est": "Esther" },
  { "hi": "Hiob" },
  { "ps": "Psalm" },
  { "spr": "Spr\xFCche" },
  { "pred": "Prediger" },
  { "hoh": "Hohes Lied" },
  { "jes": "Jesaja" },
  { "jer": "Jeremia" },
  { "klag": "Klagelieder" },
  { "hes": "Hesekiel" },
  { "dan": "Daniel" },
  { "hos": "Hosea" },
  { "joe": "Joel" },
  { "am": "Amos" },
  { "ob": "Obadja" },
  { "jon": "Jona" },
  { "mi": "Micha" },
  { "nah": "Nahum" },
  { "hab": "Habakuk" },
  { "zeph": "Zephanja" },
  { "hag": "Haggai" },
  { "sach": "Sacharja" },
  { "mal": "Maleachi" },
  { "mat": "Matth\xE4us" },
  { "mar": "Markus" },
  { "luk": "Lukas" },
  { "joh": "Johannes" },
  { "apg": "Apostelgeschichte" },
  { "r\xF6m": "R\xF6mer" },
  { "1kor": "1. Korinther" },
  { "2kor": "2. Korinther" },
  { "gal": "Galater" },
  { "eph": "Epheser" },
  { "phil": "Philipper" },
  { "kol": "Kolosser" },
  { "1thes": "1. Thessalonicher" },
  { "2thes": "2. Thessalonicher" },
  { "1tim": "1. Timotheus" },
  { "2tim": "2. Timotheus" },
  { "tit": "Titus" },
  { "philem": "Philemon" },
  { "heb": "Hebr\xE4er" },
  { "jak": "Jakobus" },
  { "1pet": "1. Petrus" },
  { "2pet": "2. Petrus" },
  { "1joh": "1. Johannes" },
  { "2joh": "2. Johannes" },
  { "3joh": "3. Johannes" },
  { "jud": "Judas" },
  { "offb": "Offenbarung" }
];

// main.ts
var DEFAULT_SETTINGS = {
  // Default settings will go here
};
var BibleReferenceSuggester = class extends import_obsidian.EditorSuggest {
  constructor(plugin) {
    super(plugin.app);
    this.plugin = plugin;
  }
  onTrigger(cursor, editor) {
    const line = editor.getLine(cursor.line);
    const subString = line.substring(0, cursor.ch);
    const match = subString.match(
      /\/b\s+([a-z0-9äöüß]+\s*\d+:\d+(?:-\d+)?)?$/i
    );
    if (!match)
      return null;
    return {
      start: {
        ch: match.index,
        line: cursor.line
      },
      end: cursor,
      query: match[1] || ""
    };
  }
  getSuggestions(context) {
    const query = context.query;
    if (query.match(/^[a-z0-9äöüß]+\s*\d+:\d+(?:-\d+)?$/i)) {
      return [
        {
          text: query,
          command: "link",
          description: "Create JW Library link"
        },
        {
          text: query,
          command: "open",
          description: "Create JW Library link and open"
        }
      ];
    }
    return [];
  }
  renderSuggestion(suggestion, el) {
    el.setText(`${suggestion.description}`);
  }
  selectSuggestion(suggestion) {
    if (!this.context)
      return;
    const { context } = this;
    const editor = context.editor;
    const convertedLink = this.plugin.convertBibleTextToMarkdownLink(
      suggestion.text
    );
    editor.replaceRange(convertedLink, context.start, context.end);
    if (suggestion.command === "open") {
      const url = this.plugin.convertBibleTextToLink(suggestion.text);
      window.open(url);
    }
  }
};
var LibraryLinkerPlugin = class extends import_obsidian.Plugin {
  convertBibleReference(url) {
    url = url.replace("jwpub://", "jwlibrary://");
    const parts = url.split("/");
    const bibleRef = parts[parts.length - 1];
    const [startBookChapterVerse, endBookChapterVerse] = bibleRef.split("-");
    const [bookStart, chapterStart, verseStart] = startBookChapterVerse.split(":");
    const [bookEnd, chapterEnd, verseEnd] = endBookChapterVerse.split(":");
    const formattedChapterStart = chapterStart.padStart(3, "0");
    const formattedVerseStart = verseStart.padStart(3, "0");
    const formattedChapterEnd = chapterEnd.padStart(3, "0");
    const formattedVerseEnd = verseEnd.padStart(3, "0");
    const formattedReferenceStart = `${bookStart}${formattedChapterStart}${formattedVerseStart}`;
    const formattedReferenceEnd = `${bookEnd}${formattedChapterEnd}${formattedVerseEnd}`;
    const formattedReference = `${formattedReferenceStart}-${formattedReferenceEnd}`;
    return `jwlibrary:///finder?bible=${formattedReference}`;
  }
  convertPublicationReference(url) {
    const parts = url.split("/");
    const pubRef = parts[3];
    const [locale, docId] = pubRef.split(":");
    const paragraph = parts[4];
    return `jwlibrary:///finder?wtlocale=${locale}&docid=${docId}&par=${paragraph}`;
  }
  convertLinks(content, type) {
    const wikiLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    return content.replace(wikiLinkRegex, (match, text, url) => {
      if (url.startsWith("jwpub://b/") && (type === "bible" || type === "all")) {
        return `[${text}](${this.convertBibleReference(url)})`;
      }
      if (url.startsWith("jwpub://p/") && (type === "publication" || type === "all")) {
        return `[${text}](${this.convertPublicationReference(url)})`;
      }
      return match;
    });
  }
  convertBibleTextToLink(input) {
    try {
      const reference = this.parseBibleReference(input);
      return this.formatJWLibraryLink(reference);
    } catch (error) {
      console.error("Error converting Bible text:", error.message);
      return input;
    }
  }
  parseBibleReference(input) {
    input = input.trim().toLowerCase();
    const match = input.match(
      /^([a-z0-9äöüß]+?)(?:\s*(\d+)\s*:\s*(\d+)(?:\s*-\s*(\d+))?$)/i
    );
    if (!match) {
      throw new Error("Invalid format");
    }
    const [, bookName, chapter, verseStart, verseEnd] = match;
    const bookIndex = this.findBookIndex(bookName.trim());
    if (bookIndex === -1) {
      throw new Error("Book not found");
    }
    return {
      book: bookIndex < 10 ? `0${bookIndex}` : bookIndex.toString(),
      chapter: chapter.padStart(3, "0"),
      verse: verseStart.padStart(3, "0"),
      endVerse: verseEnd ? verseEnd.padStart(3, "0") : void 0
    };
  }
  findBookIndex(bookQuery) {
    bookQuery = bookQuery.toLowerCase().trim();
    for (let i = 0; i < bibleBooksDE.length; i++) {
      const bookEntry = bibleBooksDE[i];
      const abbreviation = Object.keys(bookEntry)[0].toLowerCase();
      if (bookQuery === abbreviation) {
        return i + 1;
      }
    }
    return -1;
  }
  formatJWLibraryLink(reference) {
    const baseReference = `${reference.book}${reference.chapter}${reference.verse}`;
    const rangeReference = reference.endVerse ? `-${reference.book}${reference.chapter}${reference.endVerse}` : "";
    return `jwlibrary:///finder?bible=${baseReference}${rangeReference}`;
  }
  formatBibleText(input) {
    try {
      const reference = this.parseBibleReference(input);
      const bookIndex = parseInt(reference.book) - 1;
      const bookEntry = bibleBooksDE[bookIndex];
      const formattedBook = Object.values(bookEntry)[0];
      const verseRef = reference.endVerse ? `${parseInt(reference.verse)}-${parseInt(reference.endVerse)}` : parseInt(reference.verse);
      return `${formattedBook} ${parseInt(reference.chapter)}:${verseRef}`;
    } catch (error) {
      return input;
    }
  }
  convertBibleTextToMarkdownLink(input) {
    try {
      const url = this.convertBibleTextToLink(input);
      const formattedText = this.formatBibleText(input);
      if (url !== input) {
        return `[${formattedText}](${url})`;
      }
      return input;
    } catch (error) {
      return input;
    }
  }
  async onload() {
    await this.loadSettings();
    this.addCommand({
      id: "replace-links",
      name: "Replace all links",
      editorCallback: (editor) => {
        const currentContent = editor.getValue();
        const updatedContent = this.convertLinks(currentContent, "all");
        if (currentContent !== updatedContent) {
          editor.setValue(updatedContent);
        }
      }
    });
    this.addCommand({
      id: "replace-bible-links",
      name: "Replace Bible verse links",
      editorCallback: (editor) => {
        const currentContent = editor.getValue();
        const updatedContent = this.convertLinks(
          currentContent,
          "bible"
        );
        if (currentContent !== updatedContent) {
          editor.setValue(updatedContent);
        }
      }
    });
    this.addCommand({
      id: "replace-publication-links",
      name: "Replace publication links",
      editorCallback: (editor) => {
        const currentContent = editor.getValue();
        const updatedContent = this.convertLinks(
          currentContent,
          "publication"
        );
        if (currentContent !== updatedContent) {
          editor.setValue(updatedContent);
        }
      }
    });
    this.addCommand({
      id: "convert-bible-text",
      name: "Convert Bible reference to Library link",
      editorCallback: (editor) => {
        const selection = editor.getSelection();
        if (selection) {
          const convertedLink = this.convertBibleTextToMarkdownLink(selection);
          editor.replaceSelection(convertedLink);
        }
      }
    });
    this.addSettingTab(new LinkReplacerSettingTab(this.app, this));
    this.bibleSuggester = new BibleReferenceSuggester(this);
    this.registerEditorSuggest(this.bibleSuggester);
  }
  onunload() {
  }
  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var LinkReplacerSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyIsICJzcmMvYmlibGVCb29rcy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHtcblx0QXBwLFxuXHRFZGl0b3IsXG5cdEVkaXRvclBvc2l0aW9uLFxuXHRFZGl0b3JTdWdnZXN0LFxuXHRFZGl0b3JTdWdnZXN0Q29udGV4dCxcblx0RWRpdG9yU3VnZ2VzdFRyaWdnZXJJbmZvLFxuXHRNYXJrZG93blZpZXcsXG5cdFBsdWdpbixcblx0UGx1Z2luU2V0dGluZ1RhYixcblx0VEZpbGUsXG59IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IGJpYmxlQm9va3NERSB9IGZyb20gJy4vc3JjL2JpYmxlQm9va3MnO1xuXG5pbnRlcmZhY2UgTGlua1JlcGxhY2VyU2V0dGluZ3Mge1xuXHQvLyBXZSdsbCBhZGQgc2V0dGluZ3MgbGF0ZXIgaWYgbmVlZGVkXG59XG5cbmNvbnN0IERFRkFVTFRfU0VUVElOR1M6IExpbmtSZXBsYWNlclNldHRpbmdzID0ge1xuXHQvLyBEZWZhdWx0IHNldHRpbmdzIHdpbGwgZ28gaGVyZVxufTtcblxuaW50ZXJmYWNlIEJpYmxlU3VnZ2VzdGlvbiB7XG5cdHRleHQ6IHN0cmluZztcblx0Y29tbWFuZDogJ2xpbmsnIHwgJ29wZW4nO1xuXHRkZXNjcmlwdGlvbjogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgQmlibGVSZWZlcmVuY2Uge1xuXHRib29rOiBzdHJpbmc7XG5cdGNoYXB0ZXI6IHN0cmluZztcblx0dmVyc2U6IHN0cmluZztcblx0ZW5kVmVyc2U/OiBzdHJpbmc7XG59XG5cbmNsYXNzIEJpYmxlUmVmZXJlbmNlU3VnZ2VzdGVyIGV4dGVuZHMgRWRpdG9yU3VnZ2VzdDxCaWJsZVN1Z2dlc3Rpb24+IHtcblx0cGx1Z2luOiBMaWJyYXJ5TGlua2VyUGx1Z2luO1xuXG5cdGNvbnN0cnVjdG9yKHBsdWdpbjogTGlicmFyeUxpbmtlclBsdWdpbikge1xuXHRcdHN1cGVyKHBsdWdpbi5hcHApO1xuXHRcdHRoaXMucGx1Z2luID0gcGx1Z2luO1xuXHR9XG5cblx0b25UcmlnZ2VyKFxuXHRcdGN1cnNvcjogRWRpdG9yUG9zaXRpb24sXG5cdFx0ZWRpdG9yOiBFZGl0b3IsXG5cdCk6IEVkaXRvclN1Z2dlc3RUcmlnZ2VySW5mbyB8IG51bGwge1xuXHRcdGNvbnN0IGxpbmUgPSBlZGl0b3IuZ2V0TGluZShjdXJzb3IubGluZSk7XG5cdFx0Y29uc3Qgc3ViU3RyaW5nID0gbGluZS5zdWJzdHJpbmcoMCwgY3Vyc29yLmNoKTtcblxuXHRcdC8vIE1vZGlmaWVkIHJlZ2V4IHRvIG1ha2Ugc3BhY2UgYmV0d2VlbiBib29rIGFuZCBjaGFwdGVyIG9wdGlvbmFsXG5cdFx0Y29uc3QgbWF0Y2ggPSBzdWJTdHJpbmcubWF0Y2goXG5cdFx0XHQvXFwvYlxccysoW2EtejAtOVx1MDBFNFx1MDBGNlx1MDBGQ1x1MDBERl0rXFxzKlxcZCs6XFxkKyg/Oi1cXGQrKT8pPyQvaSxcblx0XHQpO1xuXG5cdFx0aWYgKCFtYXRjaCkgcmV0dXJuIG51bGw7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0c3RhcnQ6IHtcblx0XHRcdFx0Y2g6IG1hdGNoLmluZGV4ISxcblx0XHRcdFx0bGluZTogY3Vyc29yLmxpbmUsXG5cdFx0XHR9LFxuXHRcdFx0ZW5kOiBjdXJzb3IsXG5cdFx0XHRxdWVyeTogbWF0Y2hbMV0gfHwgJycsXG5cdFx0fTtcblx0fVxuXG5cdGdldFN1Z2dlc3Rpb25zKGNvbnRleHQ6IEVkaXRvclN1Z2dlc3RDb250ZXh0KTogQmlibGVTdWdnZXN0aW9uW10ge1xuXHRcdGNvbnN0IHF1ZXJ5ID0gY29udGV4dC5xdWVyeTtcblxuXHRcdC8vIFJlZ2V4IHRoYXQgaGFuZGxlcyBib3RoIHdpdGggYW5kIHdpdGhvdXQgc3BhY2Vcblx0XHRpZiAocXVlcnkubWF0Y2goL15bYS16MC05XHUwMEU0XHUwMEY2XHUwMEZDXHUwMERGXStcXHMqXFxkKzpcXGQrKD86LVxcZCspPyQvaSkpIHtcblx0XHRcdHJldHVybiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0ZXh0OiBxdWVyeSxcblx0XHRcdFx0XHRjb21tYW5kOiAnbGluaycsXG5cdFx0XHRcdFx0ZGVzY3JpcHRpb246ICdDcmVhdGUgSlcgTGlicmFyeSBsaW5rJyxcblx0XHRcdFx0fSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRleHQ6IHF1ZXJ5LFxuXHRcdFx0XHRcdGNvbW1hbmQ6ICdvcGVuJyxcblx0XHRcdFx0XHRkZXNjcmlwdGlvbjogJ0NyZWF0ZSBKVyBMaWJyYXJ5IGxpbmsgYW5kIG9wZW4nLFxuXHRcdFx0XHR9LFxuXHRcdFx0XTtcblx0XHR9XG5cdFx0cmV0dXJuIFtdO1xuXHR9XG5cblx0cmVuZGVyU3VnZ2VzdGlvbihzdWdnZXN0aW9uOiBCaWJsZVN1Z2dlc3Rpb24sIGVsOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuXHRcdGVsLnNldFRleHQoYCR7c3VnZ2VzdGlvbi5kZXNjcmlwdGlvbn1gKTtcblx0fVxuXG5cdHNlbGVjdFN1Z2dlc3Rpb24oc3VnZ2VzdGlvbjogQmlibGVTdWdnZXN0aW9uKTogdm9pZCB7XG5cdFx0aWYgKCF0aGlzLmNvbnRleHQpIHJldHVybjtcblxuXHRcdGNvbnN0IHsgY29udGV4dCB9ID0gdGhpcztcblx0XHRjb25zdCBlZGl0b3IgPSBjb250ZXh0LmVkaXRvcjtcblxuXHRcdC8vIENvbnZlcnQgdGhlIEJpYmxlIHJlZmVyZW5jZSB0byBhIGxpbmtcblx0XHRjb25zdCBjb252ZXJ0ZWRMaW5rID0gdGhpcy5wbHVnaW4uY29udmVydEJpYmxlVGV4dFRvTWFya2Rvd25MaW5rKFxuXHRcdFx0c3VnZ2VzdGlvbi50ZXh0LFxuXHRcdCk7XG5cblx0XHQvLyBSZXBsYWNlIHRoZSBlbnRpcmUgY29tbWFuZCBhbmQgcmVmZXJlbmNlIHdpdGggdGhlIGNvbnZlcnRlZCBsaW5rXG5cdFx0ZWRpdG9yLnJlcGxhY2VSYW5nZShjb252ZXJ0ZWRMaW5rLCBjb250ZXh0LnN0YXJ0LCBjb250ZXh0LmVuZCk7XG5cblx0XHQvLyBJZiB0aGlzIHdhcyBhIC9ibyBjb21tYW5kLCBvcGVuIHRoZSBsaW5rXG5cdFx0aWYgKHN1Z2dlc3Rpb24uY29tbWFuZCA9PT0gJ29wZW4nKSB7XG5cdFx0XHRjb25zdCB1cmwgPSB0aGlzLnBsdWdpbi5jb252ZXJ0QmlibGVUZXh0VG9MaW5rKHN1Z2dlc3Rpb24udGV4dCk7XG5cdFx0XHR3aW5kb3cub3Blbih1cmwpO1xuXHRcdH1cblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMaWJyYXJ5TGlua2VyUGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcblx0c2V0dGluZ3M6IExpbmtSZXBsYWNlclNldHRpbmdzO1xuXHRwcml2YXRlIGJpYmxlU3VnZ2VzdGVyOiBCaWJsZVJlZmVyZW5jZVN1Z2dlc3RlcjtcblxuXHRwcml2YXRlIGNvbnZlcnRCaWJsZVJlZmVyZW5jZSh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG5cdFx0Ly8gUmVwbGFjZSAnandwdWI6Ly8nIHdpdGggJ2p3bGlicmFyeTovLydcblx0XHR1cmwgPSB1cmwucmVwbGFjZSgnandwdWI6Ly8nLCAnandsaWJyYXJ5Oi8vJyk7XG5cdFx0Ly8gRXh0cmFjdCB0aGUgQmlibGUgcmVmZXJlbmNlIHBhcnRzXG5cdFx0Y29uc3QgcGFydHMgPSB1cmwuc3BsaXQoJy8nKTtcblx0XHRjb25zdCBiaWJsZVJlZiA9IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdO1xuXG5cdFx0Ly8gRXh0cmFjdCBib29rLCBjaGFwdGVyIGFuZCB2ZXJzZVxuXHRcdGNvbnN0IFtzdGFydEJvb2tDaGFwdGVyVmVyc2UsIGVuZEJvb2tDaGFwdGVyVmVyc2VdID1cblx0XHRcdGJpYmxlUmVmLnNwbGl0KCctJyk7XG5cdFx0Y29uc3QgW2Jvb2tTdGFydCwgY2hhcHRlclN0YXJ0LCB2ZXJzZVN0YXJ0XSA9XG5cdFx0XHRzdGFydEJvb2tDaGFwdGVyVmVyc2Uuc3BsaXQoJzonKTtcblx0XHRjb25zdCBbYm9va0VuZCwgY2hhcHRlckVuZCwgdmVyc2VFbmRdID0gZW5kQm9va0NoYXB0ZXJWZXJzZS5zcGxpdCgnOicpO1xuXG5cdFx0Ly8gRm9ybWF0IHRoZSBudW1iZXJzIHRvIGVuc3VyZSBwcm9wZXIgcGFkZGluZ1xuXHRcdGNvbnN0IGZvcm1hdHRlZENoYXB0ZXJTdGFydCA9IGNoYXB0ZXJTdGFydC5wYWRTdGFydCgzLCAnMCcpO1xuXHRcdGNvbnN0IGZvcm1hdHRlZFZlcnNlU3RhcnQgPSB2ZXJzZVN0YXJ0LnBhZFN0YXJ0KDMsICcwJyk7XG5cdFx0Y29uc3QgZm9ybWF0dGVkQ2hhcHRlckVuZCA9IGNoYXB0ZXJFbmQucGFkU3RhcnQoMywgJzAnKTtcblx0XHRjb25zdCBmb3JtYXR0ZWRWZXJzZUVuZCA9IHZlcnNlRW5kLnBhZFN0YXJ0KDMsICcwJyk7XG5cblx0XHRjb25zdCBmb3JtYXR0ZWRSZWZlcmVuY2VTdGFydCA9IGAke2Jvb2tTdGFydH0ke2Zvcm1hdHRlZENoYXB0ZXJTdGFydH0ke2Zvcm1hdHRlZFZlcnNlU3RhcnR9YDtcblx0XHRjb25zdCBmb3JtYXR0ZWRSZWZlcmVuY2VFbmQgPSBgJHtib29rRW5kfSR7Zm9ybWF0dGVkQ2hhcHRlckVuZH0ke2Zvcm1hdHRlZFZlcnNlRW5kfWA7XG5cblx0XHRjb25zdCBmb3JtYXR0ZWRSZWZlcmVuY2UgPSBgJHtmb3JtYXR0ZWRSZWZlcmVuY2VTdGFydH0tJHtmb3JtYXR0ZWRSZWZlcmVuY2VFbmR9YDtcblxuXHRcdHJldHVybiBgandsaWJyYXJ5Oi8vL2ZpbmRlcj9iaWJsZT0ke2Zvcm1hdHRlZFJlZmVyZW5jZX1gO1xuXHR9XG5cblx0cHJpdmF0ZSBjb252ZXJ0UHVibGljYXRpb25SZWZlcmVuY2UodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdGNvbnN0IHBhcnRzID0gdXJsLnNwbGl0KCcvJyk7XG5cdFx0Y29uc3QgcHViUmVmID0gcGFydHNbM107XG5cdFx0Y29uc3QgW2xvY2FsZSwgZG9jSWRdID0gcHViUmVmLnNwbGl0KCc6Jyk7XG5cdFx0Y29uc3QgcGFyYWdyYXBoID0gcGFydHNbNF07XG5cblx0XHRyZXR1cm4gYGp3bGlicmFyeTovLy9maW5kZXI/d3Rsb2NhbGU9JHtsb2NhbGV9JmRvY2lkPSR7ZG9jSWR9JnBhcj0ke3BhcmFncmFwaH1gO1xuXHR9XG5cblx0cHJpdmF0ZSBjb252ZXJ0TGlua3MoXG5cdFx0Y29udGVudDogc3RyaW5nLFxuXHRcdHR5cGU/OiAnYmlibGUnIHwgJ3B1YmxpY2F0aW9uJyB8ICdhbGwnLFxuXHQpOiBzdHJpbmcge1xuXHRcdGNvbnN0IHdpa2lMaW5rUmVnZXggPSAvXFxbKFteXFxdXSspXFxdXFwoKFteKV0rKVxcKS9nO1xuXG5cdFx0cmV0dXJuIGNvbnRlbnQucmVwbGFjZSh3aWtpTGlua1JlZ2V4LCAobWF0Y2gsIHRleHQsIHVybCkgPT4ge1xuXHRcdFx0Ly8gSGFuZGxlIEJpYmxlIHJlZmVyZW5jZXNcblx0XHRcdGlmIChcblx0XHRcdFx0dXJsLnN0YXJ0c1dpdGgoJ2p3cHViOi8vYi8nKSAmJlxuXHRcdFx0XHQodHlwZSA9PT0gJ2JpYmxlJyB8fCB0eXBlID09PSAnYWxsJylcblx0XHRcdCkge1xuXHRcdFx0XHRyZXR1cm4gYFske3RleHR9XSgke3RoaXMuY29udmVydEJpYmxlUmVmZXJlbmNlKHVybCl9KWA7XG5cdFx0XHR9XG5cdFx0XHQvLyBIYW5kbGUgcHVibGljYXRpb24gcmVmZXJlbmNlc1xuXHRcdFx0aWYgKFxuXHRcdFx0XHR1cmwuc3RhcnRzV2l0aCgnandwdWI6Ly9wLycpICYmXG5cdFx0XHRcdCh0eXBlID09PSAncHVibGljYXRpb24nIHx8IHR5cGUgPT09ICdhbGwnKVxuXHRcdFx0KSB7XG5cdFx0XHRcdHJldHVybiBgWyR7dGV4dH1dKCR7dGhpcy5jb252ZXJ0UHVibGljYXRpb25SZWZlcmVuY2UodXJsKX0pYDtcblx0XHRcdH1cblx0XHRcdHJldHVybiBtYXRjaDtcblx0XHR9KTtcblx0fVxuXG5cdHB1YmxpYyBjb252ZXJ0QmlibGVUZXh0VG9MaW5rKGlucHV0OiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCByZWZlcmVuY2UgPSB0aGlzLnBhcnNlQmlibGVSZWZlcmVuY2UoaW5wdXQpO1xuXHRcdFx0cmV0dXJuIHRoaXMuZm9ybWF0SldMaWJyYXJ5TGluayhyZWZlcmVuY2UpO1xuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKCdFcnJvciBjb252ZXJ0aW5nIEJpYmxlIHRleHQ6JywgZXJyb3IubWVzc2FnZSk7XG5cdFx0XHRyZXR1cm4gaW5wdXQ7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBwYXJzZUJpYmxlUmVmZXJlbmNlKGlucHV0OiBzdHJpbmcpOiBCaWJsZVJlZmVyZW5jZSB7XG5cdFx0aW5wdXQgPSBpbnB1dC50cmltKCkudG9Mb3dlckNhc2UoKTtcblxuXHRcdGNvbnN0IG1hdGNoID0gaW5wdXQubWF0Y2goXG5cdFx0XHQvXihbYS16MC05XHUwMEU0XHUwMEY2XHUwMEZDXHUwMERGXSs/KSg/OlxccyooXFxkKylcXHMqOlxccyooXFxkKykoPzpcXHMqLVxccyooXFxkKykpPyQpL2ksXG5cdFx0KTtcblx0XHRpZiAoIW1hdGNoKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZm9ybWF0Jyk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgWywgYm9va05hbWUsIGNoYXB0ZXIsIHZlcnNlU3RhcnQsIHZlcnNlRW5kXSA9IG1hdGNoO1xuXHRcdGNvbnN0IGJvb2tJbmRleCA9IHRoaXMuZmluZEJvb2tJbmRleChib29rTmFtZS50cmltKCkpO1xuXHRcdGlmIChib29rSW5kZXggPT09IC0xKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0Jvb2sgbm90IGZvdW5kJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGJvb2s6IGJvb2tJbmRleCA8IDEwID8gYDAke2Jvb2tJbmRleH1gIDogYm9va0luZGV4LnRvU3RyaW5nKCksXG5cdFx0XHRjaGFwdGVyOiBjaGFwdGVyLnBhZFN0YXJ0KDMsICcwJyksXG5cdFx0XHR2ZXJzZTogdmVyc2VTdGFydC5wYWRTdGFydCgzLCAnMCcpLFxuXHRcdFx0ZW5kVmVyc2U6IHZlcnNlRW5kID8gdmVyc2VFbmQucGFkU3RhcnQoMywgJzAnKSA6IHVuZGVmaW5lZCxcblx0XHR9O1xuXHR9XG5cblx0cHJpdmF0ZSBmaW5kQm9va0luZGV4KGJvb2tRdWVyeTogc3RyaW5nKTogbnVtYmVyIHtcblx0XHRib29rUXVlcnkgPSBib29rUXVlcnkudG9Mb3dlckNhc2UoKS50cmltKCk7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBiaWJsZUJvb2tzREUubGVuZ3RoOyBpKyspIHtcblx0XHRcdGNvbnN0IGJvb2tFbnRyeSA9IGJpYmxlQm9va3NERVtpXTtcblx0XHRcdC8vIE9ubHkgbWF0Y2ggdGhlIGFiYnJldmlhdGlvbiwgbm90IHRoZSBmdWxsIG5hbWVcblx0XHRcdGNvbnN0IGFiYnJldmlhdGlvbiA9IE9iamVjdC5rZXlzKGJvb2tFbnRyeSlbMF0udG9Mb3dlckNhc2UoKTtcblx0XHRcdGlmIChib29rUXVlcnkgPT09IGFiYnJldmlhdGlvbikge1xuXHRcdFx0XHRyZXR1cm4gaSArIDE7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiAtMTtcblx0fVxuXG5cdHByaXZhdGUgZm9ybWF0SldMaWJyYXJ5TGluayhyZWZlcmVuY2U6IEJpYmxlUmVmZXJlbmNlKTogc3RyaW5nIHtcblx0XHRjb25zdCBiYXNlUmVmZXJlbmNlID0gYCR7cmVmZXJlbmNlLmJvb2t9JHtyZWZlcmVuY2UuY2hhcHRlcn0ke3JlZmVyZW5jZS52ZXJzZX1gO1xuXHRcdGNvbnN0IHJhbmdlUmVmZXJlbmNlID0gcmVmZXJlbmNlLmVuZFZlcnNlXG5cdFx0XHQ/IGAtJHtyZWZlcmVuY2UuYm9va30ke3JlZmVyZW5jZS5jaGFwdGVyfSR7cmVmZXJlbmNlLmVuZFZlcnNlfWBcblx0XHRcdDogJyc7XG5cdFx0cmV0dXJuIGBqd2xpYnJhcnk6Ly8vZmluZGVyP2JpYmxlPSR7YmFzZVJlZmVyZW5jZX0ke3JhbmdlUmVmZXJlbmNlfWA7XG5cdH1cblxuXHRwcml2YXRlIGZvcm1hdEJpYmxlVGV4dChpbnB1dDogc3RyaW5nKTogc3RyaW5nIHtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgcmVmZXJlbmNlID0gdGhpcy5wYXJzZUJpYmxlUmVmZXJlbmNlKGlucHV0KTtcblx0XHRcdGNvbnN0IGJvb2tJbmRleCA9IHBhcnNlSW50KHJlZmVyZW5jZS5ib29rKSAtIDE7XG5cdFx0XHRjb25zdCBib29rRW50cnkgPSBiaWJsZUJvb2tzREVbYm9va0luZGV4XTtcblx0XHRcdGNvbnN0IGZvcm1hdHRlZEJvb2sgPSBPYmplY3QudmFsdWVzKGJvb2tFbnRyeSlbMF07XG5cblx0XHRcdC8vIEZvcm1hdCB0aGUgdmVyc2UgcmVmZXJlbmNlXG5cdFx0XHRjb25zdCB2ZXJzZVJlZiA9IHJlZmVyZW5jZS5lbmRWZXJzZVxuXHRcdFx0XHQ/IGAke3BhcnNlSW50KHJlZmVyZW5jZS52ZXJzZSl9LSR7cGFyc2VJbnQocmVmZXJlbmNlLmVuZFZlcnNlKX1gXG5cdFx0XHRcdDogcGFyc2VJbnQocmVmZXJlbmNlLnZlcnNlKTtcblxuXHRcdFx0cmV0dXJuIGAke2Zvcm1hdHRlZEJvb2t9ICR7cGFyc2VJbnQocmVmZXJlbmNlLmNoYXB0ZXIpfToke3ZlcnNlUmVmfWA7XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdHJldHVybiBpbnB1dDtcblx0XHR9XG5cdH1cblxuXHRwdWJsaWMgY29udmVydEJpYmxlVGV4dFRvTWFya2Rvd25MaW5rKGlucHV0OiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCB1cmwgPSB0aGlzLmNvbnZlcnRCaWJsZVRleHRUb0xpbmsoaW5wdXQpO1xuXHRcdFx0Y29uc3QgZm9ybWF0dGVkVGV4dCA9IHRoaXMuZm9ybWF0QmlibGVUZXh0KGlucHV0KTtcblx0XHRcdC8vIE9ubHkgY3JlYXRlIG1hcmtkb3duIGxpbmsgaWYgY29udmVyc2lvbiB3YXMgc3VjY2Vzc2Z1bFxuXHRcdFx0aWYgKHVybCAhPT0gaW5wdXQpIHtcblx0XHRcdFx0cmV0dXJuIGBbJHtmb3JtYXR0ZWRUZXh0fV0oJHt1cmx9KWA7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gaW5wdXQ7XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdHJldHVybiBpbnB1dDtcblx0XHR9XG5cdH1cblxuXHRhc3luYyBvbmxvYWQoKSB7XG5cdFx0YXdhaXQgdGhpcy5sb2FkU2V0dGluZ3MoKTtcblxuXHRcdC8vIEFkZCB0aGUgY29tbWFuZCBmb3IgYWxsIGxpbmsgcmVwbGFjZW1lbnRcblx0XHR0aGlzLmFkZENvbW1hbmQoe1xuXHRcdFx0aWQ6ICdyZXBsYWNlLWxpbmtzJyxcblx0XHRcdG5hbWU6ICdSZXBsYWNlIGFsbCBsaW5rcycsXG5cdFx0XHRlZGl0b3JDYWxsYmFjazogKGVkaXRvcjogRWRpdG9yKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGN1cnJlbnRDb250ZW50ID0gZWRpdG9yLmdldFZhbHVlKCk7XG5cdFx0XHRcdGNvbnN0IHVwZGF0ZWRDb250ZW50ID0gdGhpcy5jb252ZXJ0TGlua3MoY3VycmVudENvbnRlbnQsICdhbGwnKTtcblx0XHRcdFx0aWYgKGN1cnJlbnRDb250ZW50ICE9PSB1cGRhdGVkQ29udGVudCkge1xuXHRcdFx0XHRcdGVkaXRvci5zZXRWYWx1ZSh1cGRhdGVkQ29udGVudCk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0fSk7XG5cblx0XHQvLyBBZGQgY29tbWFuZCBmb3IgQmlibGUgbGlua3Mgb25seVxuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0XHRpZDogJ3JlcGxhY2UtYmlibGUtbGlua3MnLFxuXHRcdFx0bmFtZTogJ1JlcGxhY2UgQmlibGUgdmVyc2UgbGlua3MnLFxuXHRcdFx0ZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3I6IEVkaXRvcikgPT4ge1xuXHRcdFx0XHRjb25zdCBjdXJyZW50Q29udGVudCA9IGVkaXRvci5nZXRWYWx1ZSgpO1xuXHRcdFx0XHRjb25zdCB1cGRhdGVkQ29udGVudCA9IHRoaXMuY29udmVydExpbmtzKFxuXHRcdFx0XHRcdGN1cnJlbnRDb250ZW50LFxuXHRcdFx0XHRcdCdiaWJsZScsXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmIChjdXJyZW50Q29udGVudCAhPT0gdXBkYXRlZENvbnRlbnQpIHtcblx0XHRcdFx0XHRlZGl0b3Iuc2V0VmFsdWUodXBkYXRlZENvbnRlbnQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdH0pO1xuXG5cdFx0Ly8gQWRkIGNvbW1hbmQgZm9yIHB1YmxpY2F0aW9uIGxpbmtzIG9ubHlcblx0XHR0aGlzLmFkZENvbW1hbmQoe1xuXHRcdFx0aWQ6ICdyZXBsYWNlLXB1YmxpY2F0aW9uLWxpbmtzJyxcblx0XHRcdG5hbWU6ICdSZXBsYWNlIHB1YmxpY2F0aW9uIGxpbmtzJyxcblx0XHRcdGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yOiBFZGl0b3IpID0+IHtcblx0XHRcdFx0Y29uc3QgY3VycmVudENvbnRlbnQgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcblx0XHRcdFx0Y29uc3QgdXBkYXRlZENvbnRlbnQgPSB0aGlzLmNvbnZlcnRMaW5rcyhcblx0XHRcdFx0XHRjdXJyZW50Q29udGVudCxcblx0XHRcdFx0XHQncHVibGljYXRpb24nLFxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAoY3VycmVudENvbnRlbnQgIT09IHVwZGF0ZWRDb250ZW50KSB7XG5cdFx0XHRcdFx0ZWRpdG9yLnNldFZhbHVlKHVwZGF0ZWRDb250ZW50KTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHR9KTtcblxuXHRcdC8vIEFkZCBjb21tYW5kIGZvciBCaWJsZSB0ZXh0IGNvbnZlcnNpb25cblx0XHR0aGlzLmFkZENvbW1hbmQoe1xuXHRcdFx0aWQ6ICdjb252ZXJ0LWJpYmxlLXRleHQnLFxuXHRcdFx0bmFtZTogJ0NvbnZlcnQgQmlibGUgcmVmZXJlbmNlIHRvIExpYnJhcnkgbGluaycsXG5cdFx0XHRlZGl0b3JDYWxsYmFjazogKGVkaXRvcjogRWRpdG9yKSA9PiB7XG5cdFx0XHRcdGNvbnN0IHNlbGVjdGlvbiA9IGVkaXRvci5nZXRTZWxlY3Rpb24oKTtcblx0XHRcdFx0aWYgKHNlbGVjdGlvbikge1xuXHRcdFx0XHRcdGNvbnN0IGNvbnZlcnRlZExpbmsgPVxuXHRcdFx0XHRcdFx0dGhpcy5jb252ZXJ0QmlibGVUZXh0VG9NYXJrZG93bkxpbmsoc2VsZWN0aW9uKTtcblx0XHRcdFx0XHRlZGl0b3IucmVwbGFjZVNlbGVjdGlvbihjb252ZXJ0ZWRMaW5rKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHR9KTtcblxuXHRcdC8vIEFkZCBzZXR0aW5ncyB0YWJcblx0XHR0aGlzLmFkZFNldHRpbmdUYWIobmV3IExpbmtSZXBsYWNlclNldHRpbmdUYWIodGhpcy5hcHAsIHRoaXMpKTtcblxuXHRcdC8vIFJlZ2lzdGVyIHRoZSBCaWJsZSByZWZlcmVuY2Ugc3VnZ2VzdGVyXG5cdFx0dGhpcy5iaWJsZVN1Z2dlc3RlciA9IG5ldyBCaWJsZVJlZmVyZW5jZVN1Z2dlc3Rlcih0aGlzKTtcblx0XHR0aGlzLnJlZ2lzdGVyRWRpdG9yU3VnZ2VzdCh0aGlzLmJpYmxlU3VnZ2VzdGVyKTtcblx0fVxuXG5cdG9udW5sb2FkKCkge1xuXHRcdC8vIENsZWFuIHVwIHBsdWdpbiByZXNvdXJjZXMgaWYgbmVlZGVkXG5cdH1cblxuXHRhc3luYyBsb2FkU2V0dGluZ3MoKSB7XG5cdFx0dGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oXG5cdFx0XHR7fSxcblx0XHRcdERFRkFVTFRfU0VUVElOR1MsXG5cdFx0XHRhd2FpdCB0aGlzLmxvYWREYXRhKCksXG5cdFx0KTtcblx0fVxuXG5cdGFzeW5jIHNhdmVTZXR0aW5ncygpIHtcblx0XHRhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuc2V0dGluZ3MpO1xuXHR9XG59XG5cbmNsYXNzIExpbmtSZXBsYWNlclNldHRpbmdUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcblx0cGx1Z2luOiBMaWJyYXJ5TGlua2VyUGx1Z2luO1xuXG5cdGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IExpYnJhcnlMaW5rZXJQbHVnaW4pIHtcblx0XHRzdXBlcihhcHAsIHBsdWdpbik7XG5cdFx0dGhpcy5wbHVnaW4gPSBwbHVnaW47XG5cdH1cblxuXHRkaXNwbGF5KCk6IHZvaWQge1xuXHRcdGNvbnN0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XG5cdFx0Y29udGFpbmVyRWwuZW1wdHkoKTtcblxuXHRcdC8vIFdlJ2xsIGFkZCBzZXR0aW5ncyBVSSBlbGVtZW50cyBoZXJlIHdoZW4gbmVlZGVkXG5cdH1cbn1cbiIsICJleHBvcnQgdHlwZSBCaWJsZUJvb2tBYmJyZXZpYXRpb25zID0gcmVhZG9ubHkgc3RyaW5nW107XG5leHBvcnQgdHlwZSBCaWJsZUJvb2tzID0gcmVhZG9ubHkgQmlibGVCb29rQWJicmV2aWF0aW9uc1tdO1xuXG5leHBvcnQgY29uc3QgYmlibGVCb29rc0RFID0gW1xuICAgIHsgXCIxbW9cIjogXCIxLiBNb3NlXCIgfSxcbiAgICB7IFwiMm1vXCI6IFwiMi4gTW9zZVwiIH0sXG4gICAgeyBcIjNtb1wiOiBcIjMuIE1vc2VcIiB9LFxuICAgIHsgXCI0bW9cIjogXCI0LiBNb3NlXCIgfSxcbiAgICB7IFwiNW1vXCI6IFwiNS4gTW9zZVwiIH0sXG4gICAgeyBcImpvc1wiOiBcIkpvc3VhXCIgfSxcbiAgICB7IFwicmlcIjogXCJSaWNodGVyXCIgfSxcbiAgICB7IFwicnVcIjogXCJSdXRoXCIgfSxcbiAgICB7IFwiMXNhbVwiOiBcIjEuIFNhbXVlbFwiIH0sXG4gICAgeyBcIjJzYW1cIjogXCIyLiBTYW11ZWxcIiB9LFxuICAgIHsgXCIxa1x1MDBGNlwiOiBcIjEuIEtcdTAwRjZuaWdlXCIgfSxcbiAgICB7IFwiMmtcdTAwRjZcIjogXCIyLiBLXHUwMEY2bmlnZVwiIH0sXG4gICAgeyBcIjFjaFwiOiBcIjEuIENocm9uaWthXCIgfSxcbiAgICB7IFwiMmNoXCI6IFwiMi4gQ2hyb25pa2FcIiB9LFxuICAgIHsgXCJlc3JcIjogXCJFc3JhXCIgfSxcbiAgICB7IFwibmVoXCI6IFwiTmVoZW1pYVwiIH0sXG4gICAgeyBcImVzdFwiOiBcIkVzdGhlclwiIH0sXG4gICAgeyBcImhpXCI6IFwiSGlvYlwiIH0sXG4gICAgeyBcInBzXCI6IFwiUHNhbG1cIiB9LFxuICAgIHsgXCJzcHJcIjogXCJTcHJcdTAwRkNjaGVcIiB9LFxuICAgIHsgXCJwcmVkXCI6IFwiUHJlZGlnZXJcIiB9LFxuICAgIHsgXCJob2hcIjogXCJIb2hlcyBMaWVkXCIgfSxcbiAgICB7IFwiamVzXCI6IFwiSmVzYWphXCIgfSxcbiAgICB7IFwiamVyXCI6IFwiSmVyZW1pYVwiIH0sXG4gICAgeyBcImtsYWdcIjogXCJLbGFnZWxpZWRlclwiIH0sXG4gICAgeyBcImhlc1wiOiBcIkhlc2VraWVsXCIgfSxcbiAgICB7IFwiZGFuXCI6IFwiRGFuaWVsXCIgfSxcbiAgICB7IFwiaG9zXCI6IFwiSG9zZWFcIiB9LFxuICAgIHsgXCJqb2VcIjogXCJKb2VsXCIgfSxcbiAgICB7IFwiYW1cIjogXCJBbW9zXCIgfSxcbiAgICB7IFwib2JcIjogXCJPYmFkamFcIiB9LFxuICAgIHsgXCJqb25cIjogXCJKb25hXCIgfSxcbiAgICB7IFwibWlcIjogXCJNaWNoYVwiIH0sXG4gICAgeyBcIm5haFwiOiBcIk5haHVtXCIgfSxcbiAgICB7IFwiaGFiXCI6IFwiSGFiYWt1a1wiIH0sXG4gICAgeyBcInplcGhcIjogXCJaZXBoYW5qYVwiIH0sXG4gICAgeyBcImhhZ1wiOiBcIkhhZ2dhaVwiIH0sXG4gICAgeyBcInNhY2hcIjogXCJTYWNoYXJqYVwiIH0sXG4gICAgeyBcIm1hbFwiOiBcIk1hbGVhY2hpXCIgfSxcbiAgICB7IFwibWF0XCI6IFwiTWF0dGhcdTAwRTR1c1wiIH0sXG4gICAgeyBcIm1hclwiOiBcIk1hcmt1c1wiIH0sXG4gICAgeyBcImx1a1wiOiBcIkx1a2FzXCIgfSxcbiAgICB7IFwiam9oXCI6IFwiSm9oYW5uZXNcIiB9LFxuICAgIHsgXCJhcGdcIjogXCJBcG9zdGVsZ2VzY2hpY2h0ZVwiIH0sXG4gICAgeyBcInJcdTAwRjZtXCI6IFwiUlx1MDBGNm1lclwiIH0sXG4gICAgeyBcIjFrb3JcIjogXCIxLiBLb3JpbnRoZXJcIiB9LFxuICAgIHsgXCIya29yXCI6IFwiMi4gS29yaW50aGVyXCIgfSxcbiAgICB7IFwiZ2FsXCI6IFwiR2FsYXRlclwiIH0sXG4gICAgeyBcImVwaFwiOiBcIkVwaGVzZXJcIiB9LFxuICAgIHsgXCJwaGlsXCI6IFwiUGhpbGlwcGVyXCIgfSxcbiAgICB7IFwia29sXCI6IFwiS29sb3NzZXJcIiB9LFxuICAgIHsgXCIxdGhlc1wiOiBcIjEuIFRoZXNzYWxvbmljaGVyXCIgfSxcbiAgICB7IFwiMnRoZXNcIjogXCIyLiBUaGVzc2Fsb25pY2hlclwiIH0sXG4gICAgeyBcIjF0aW1cIjogXCIxLiBUaW1vdGhldXNcIiB9LFxuICAgIHsgXCIydGltXCI6IFwiMi4gVGltb3RoZXVzXCIgfSxcbiAgICB7IFwidGl0XCI6IFwiVGl0dXNcIiB9LFxuICAgIHsgXCJwaGlsZW1cIjogXCJQaGlsZW1vblwiIH0sXG4gICAgeyBcImhlYlwiOiBcIkhlYnJcdTAwRTRlclwiIH0sXG4gICAgeyBcImpha1wiOiBcIkpha29idXNcIiB9LFxuICAgIHsgXCIxcGV0XCI6IFwiMS4gUGV0cnVzXCIgfSxcbiAgICB7IFwiMnBldFwiOiBcIjIuIFBldHJ1c1wiIH0sXG4gICAgeyBcIjFqb2hcIjogXCIxLiBKb2hhbm5lc1wiIH0sXG4gICAgeyBcIjJqb2hcIjogXCIyLiBKb2hhbm5lc1wiIH0sXG4gICAgeyBcIjNqb2hcIjogXCIzLiBKb2hhbm5lc1wiIH0sXG4gICAgeyBcImp1ZFwiOiBcIkp1ZGFzXCIgfSxcbiAgICB7IFwib2ZmYlwiOiBcIk9mZmVuYmFydW5nXCIgfVxuXSBhcyBjb25zdDsiXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsc0JBV087OztBQ1JBLElBQU0sZUFBZTtBQUFBLEVBQ3hCLEVBQUUsT0FBTyxVQUFVO0FBQUEsRUFDbkIsRUFBRSxPQUFPLFVBQVU7QUFBQSxFQUNuQixFQUFFLE9B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
