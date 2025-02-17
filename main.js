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
    const matchLink = subString.match(/(?:^|\s)(?:[-*+]\s+)?\/b\s+([a-z0-9äöüß]+\s*\d+:\d+(?:-\d+)?)?$/i);
    const matchOpen = subString.match(/(?:^|\s)(?:[-*+]\s+)?\/bo\s+([a-z0-9äöüß]+\s*\d+:\d+(?:-\d+)?)?$/i);
    if (!matchLink && !matchOpen)
      return null;
    const match = matchOpen || matchLink;
    if (!match)
      return null;
    return {
      start: {
        ch: match.index + match[0].indexOf("/"),
        // Adjust start position to the actual command
        line: cursor.line
      },
      end: cursor,
      query: match[1] || ""
    };
  }
  getSuggestions(context) {
    const query = context.query;
    const line = context.editor.getLine(context.start.line);
    const isOpenCommand = line.substring(context.start.ch, context.start.ch + 3) === "/bo";
    if (query.match(/^[a-z0-9äöüß]+\s*\d+:\d+(?:-\d+)?$/i)) {
      return [{
        text: query,
        command: isOpenCommand ? "open" : "link"
      }];
    }
    return [];
  }
  renderSuggestion(suggestion, el) {
    const action = suggestion.command === "open" ? "Convert and open" : "Convert";
    el.setText(`${action} "${suggestion.text}" to JW Library link`);
  }
  selectSuggestion(suggestion) {
    if (!this.context)
      return;
    const { context } = this;
    const editor = context.editor;
    const convertedLink = this.plugin.convertBibleTextToMarkdownLink(suggestion.text);
    editor.replaceRange(`${convertedLink} `, context.start, context.end);
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
    const match = input.match(/^([a-z0-9äöüß]+?)(?:\s*(\d+)\s*:\s*(\d+)(?:\s*-\s*(\d+))?$)/i);
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
        const updatedContent = this.convertLinks(currentContent, "bible");
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
        const updatedContent = this.convertLinks(currentContent, "publication");
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
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyIsICJzcmMvYmlibGVCb29rcy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHtcbiAgQXBwLFxuICBFZGl0b3IsXG4gIEVkaXRvclBvc2l0aW9uLFxuICBFZGl0b3JTdWdnZXN0LFxuICBFZGl0b3JTdWdnZXN0Q29udGV4dCxcbiAgRWRpdG9yU3VnZ2VzdFRyaWdnZXJJbmZvLFxuICBNYXJrZG93blZpZXcsXG4gIFBsdWdpbixcbiAgUGx1Z2luU2V0dGluZ1RhYixcbiAgVEZpbGUsXG59IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IGJpYmxlQm9va3NERSB9IGZyb20gJy4vc3JjL2JpYmxlQm9va3MnO1xuXG5pbnRlcmZhY2UgTGlua1JlcGxhY2VyU2V0dGluZ3Mge1xuICAvLyBXZSdsbCBhZGQgc2V0dGluZ3MgbGF0ZXIgaWYgbmVlZGVkXG59XG5cbmNvbnN0IERFRkFVTFRfU0VUVElOR1M6IExpbmtSZXBsYWNlclNldHRpbmdzID0ge1xuICAvLyBEZWZhdWx0IHNldHRpbmdzIHdpbGwgZ28gaGVyZVxufTtcblxuaW50ZXJmYWNlIEJpYmxlU3VnZ2VzdGlvbiB7XG4gIHRleHQ6IHN0cmluZztcbiAgY29tbWFuZDogJ2xpbmsnIHwgJ29wZW4nO1xufVxuXG5pbnRlcmZhY2UgQmlibGVSZWZlcmVuY2Uge1xuICBib29rOiBzdHJpbmc7XG4gIGNoYXB0ZXI6IHN0cmluZztcbiAgdmVyc2U6IHN0cmluZztcbiAgZW5kVmVyc2U/OiBzdHJpbmc7XG59XG5cbmNsYXNzIEJpYmxlUmVmZXJlbmNlU3VnZ2VzdGVyIGV4dGVuZHMgRWRpdG9yU3VnZ2VzdDxCaWJsZVN1Z2dlc3Rpb24+IHtcbiAgcGx1Z2luOiBMaWJyYXJ5TGlua2VyUGx1Z2luO1xuXG4gIGNvbnN0cnVjdG9yKHBsdWdpbjogTGlicmFyeUxpbmtlclBsdWdpbikge1xuICAgIHN1cGVyKHBsdWdpbi5hcHApO1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICB9XG5cbiAgb25UcmlnZ2VyKGN1cnNvcjogRWRpdG9yUG9zaXRpb24sIGVkaXRvcjogRWRpdG9yKTogRWRpdG9yU3VnZ2VzdFRyaWdnZXJJbmZvIHwgbnVsbCB7XG4gICAgY29uc3QgbGluZSA9IGVkaXRvci5nZXRMaW5lKGN1cnNvci5saW5lKTtcbiAgICBjb25zdCBzdWJTdHJpbmcgPSBsaW5lLnN1YnN0cmluZygwLCBjdXJzb3IuY2gpO1xuXG4gICAgLy8gTW9kaWZpZWQgcmVnZXggdG8gaGFuZGxlIGJ1bGxldCBwb2ludHMgYW5kIG90aGVyIGxpc3QgbWFya2VycyBhdCBzdGFydCBvZiBsaW5lXG4gICAgY29uc3QgbWF0Y2hMaW5rID0gc3ViU3RyaW5nLm1hdGNoKC8oPzpefFxccykoPzpbLSorXVxccyspP1xcL2JcXHMrKFthLXowLTlcdTAwRTRcdTAwRjZcdTAwRkNcdTAwREZdK1xccypcXGQrOlxcZCsoPzotXFxkKyk/KT8kL2kpO1xuICAgIGNvbnN0IG1hdGNoT3BlbiA9IHN1YlN0cmluZy5tYXRjaCgvKD86XnxcXHMpKD86Wy0qK11cXHMrKT9cXC9ib1xccysoW2EtejAtOVx1MDBFNFx1MDBGNlx1MDBGQ1x1MDBERl0rXFxzKlxcZCs6XFxkKyg/Oi1cXGQrKT8pPyQvaSk7XG5cbiAgICBpZiAoIW1hdGNoTGluayAmJiAhbWF0Y2hPcGVuKSByZXR1cm4gbnVsbDtcblxuICAgIGNvbnN0IG1hdGNoID0gbWF0Y2hPcGVuIHx8IG1hdGNoTGluaztcbiAgICBpZiAoIW1hdGNoKSByZXR1cm4gbnVsbDtcblxuICAgIHJldHVybiB7XG4gICAgICBzdGFydDoge1xuICAgICAgICBjaDogbWF0Y2guaW5kZXghICsgbWF0Y2hbMF0uaW5kZXhPZignLycpLCAgLy8gQWRqdXN0IHN0YXJ0IHBvc2l0aW9uIHRvIHRoZSBhY3R1YWwgY29tbWFuZFxuICAgICAgICBsaW5lOiBjdXJzb3IubGluZSxcbiAgICAgIH0sXG4gICAgICBlbmQ6IGN1cnNvcixcbiAgICAgIHF1ZXJ5OiBtYXRjaFsxXSB8fCAnJyxcbiAgICB9O1xuICB9XG5cbiAgZ2V0U3VnZ2VzdGlvbnMoY29udGV4dDogRWRpdG9yU3VnZ2VzdENvbnRleHQpOiBCaWJsZVN1Z2dlc3Rpb25bXSB7XG4gICAgY29uc3QgcXVlcnkgPSBjb250ZXh0LnF1ZXJ5O1xuICAgIC8vIEdldCB0aGUgZnVsbCBsaW5lIHRvIGNoZWNrIGZvciAvYm9cbiAgICBjb25zdCBsaW5lID0gY29udGV4dC5lZGl0b3IuZ2V0TGluZShjb250ZXh0LnN0YXJ0LmxpbmUpO1xuICAgIC8vIENoYW5nZWQ6IExvb2sgZm9yIC9ibyBhdCB0aGUgZXhhY3QgdHJpZ2dlciBwb3NpdGlvbiBpbnN0ZWFkIG9mIHRoZSBzdGFydCBvZiBsaW5lXG4gICAgY29uc3QgaXNPcGVuQ29tbWFuZCA9IGxpbmUuc3Vic3RyaW5nKGNvbnRleHQuc3RhcnQuY2gsIGNvbnRleHQuc3RhcnQuY2ggKyAzKSA9PT0gJy9ibyc7XG5cbiAgICAvLyBSZWdleCB0aGF0IGhhbmRsZXMgYm90aCB3aXRoIGFuZCB3aXRob3V0IHNwYWNlXG4gICAgaWYgKHF1ZXJ5Lm1hdGNoKC9eW2EtejAtOVx1MDBFNFx1MDBGNlx1MDBGQ1x1MDBERl0rXFxzKlxcZCs6XFxkKyg/Oi1cXGQrKT8kL2kpKSB7XG4gICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgdGV4dDogcXVlcnksXG4gICAgICAgICAgICBjb21tYW5kOiBpc09wZW5Db21tYW5kID8gJ29wZW4nIDogJ2xpbmsnLFxuICAgICAgICB9XTtcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgcmVuZGVyU3VnZ2VzdGlvbihzdWdnZXN0aW9uOiBCaWJsZVN1Z2dlc3Rpb24sIGVsOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIGNvbnN0IGFjdGlvbiA9IHN1Z2dlc3Rpb24uY29tbWFuZCA9PT0gJ29wZW4nID8gJ0NvbnZlcnQgYW5kIG9wZW4nIDogJ0NvbnZlcnQnO1xuICAgIGVsLnNldFRleHQoYCR7YWN0aW9ufSBcIiR7c3VnZ2VzdGlvbi50ZXh0fVwiIHRvIEpXIExpYnJhcnkgbGlua2ApO1xuICB9XG5cbiAgc2VsZWN0U3VnZ2VzdGlvbihzdWdnZXN0aW9uOiBCaWJsZVN1Z2dlc3Rpb24pOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuY29udGV4dCkgcmV0dXJuO1xuICAgIGNvbnN0IHsgY29udGV4dCB9ID0gdGhpcztcbiAgICBjb25zdCBlZGl0b3IgPSBjb250ZXh0LmVkaXRvcjtcblxuICAgIC8vIENvbnZlcnQgdGhlIEJpYmxlIHJlZmVyZW5jZSB0byBhIGxpbmtcbiAgICBjb25zdCBjb252ZXJ0ZWRMaW5rID0gdGhpcy5wbHVnaW4uY29udmVydEJpYmxlVGV4dFRvTWFya2Rvd25MaW5rKHN1Z2dlc3Rpb24udGV4dCk7XG5cbiAgICAvLyBSZXBsYWNlIHRoZSBlbnRpcmUgY29tbWFuZCBhbmQgcmVmZXJlbmNlIHdpdGggdGhlIGNvbnZlcnRlZCBsaW5rXG4gICAgZWRpdG9yLnJlcGxhY2VSYW5nZShgJHtjb252ZXJ0ZWRMaW5rfSBgLCBjb250ZXh0LnN0YXJ0LCBjb250ZXh0LmVuZCk7XG5cbiAgICAvLyBJZiB0aGlzIHdhcyBhIC9ibyBjb21tYW5kLCBvcGVuIHRoZSBsaW5rXG4gICAgaWYgKHN1Z2dlc3Rpb24uY29tbWFuZCA9PT0gJ29wZW4nKSB7XG4gICAgICBjb25zdCB1cmwgPSB0aGlzLnBsdWdpbi5jb252ZXJ0QmlibGVUZXh0VG9MaW5rKHN1Z2dlc3Rpb24udGV4dCk7XG4gICAgICB3aW5kb3cub3Blbih1cmwpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMaWJyYXJ5TGlua2VyUGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcbiAgc2V0dGluZ3M6IExpbmtSZXBsYWNlclNldHRpbmdzO1xuICBwcml2YXRlIGJpYmxlU3VnZ2VzdGVyOiBCaWJsZVJlZmVyZW5jZVN1Z2dlc3RlcjtcblxuICBwcml2YXRlIGNvbnZlcnRCaWJsZVJlZmVyZW5jZSh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gUmVwbGFjZSAnandwdWI6Ly8nIHdpdGggJ2p3bGlicmFyeTovLydcbiAgICB1cmwgPSB1cmwucmVwbGFjZSgnandwdWI6Ly8nLCAnandsaWJyYXJ5Oi8vJyk7XG4gICAgLy8gRXh0cmFjdCB0aGUgQmlibGUgcmVmZXJlbmNlIHBhcnRzXG4gICAgY29uc3QgcGFydHMgPSB1cmwuc3BsaXQoJy8nKTtcbiAgICBjb25zdCBiaWJsZVJlZiA9IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdO1xuXG4gICAgLy8gRXh0cmFjdCBib29rLCBjaGFwdGVyIGFuZCB2ZXJzZVxuICAgIGNvbnN0IFtzdGFydEJvb2tDaGFwdGVyVmVyc2UsIGVuZEJvb2tDaGFwdGVyVmVyc2VdID0gYmlibGVSZWYuc3BsaXQoJy0nKTtcbiAgICBjb25zdCBbYm9va1N0YXJ0LCBjaGFwdGVyU3RhcnQsIHZlcnNlU3RhcnRdID0gc3RhcnRCb29rQ2hhcHRlclZlcnNlLnNwbGl0KCc6Jyk7XG4gICAgY29uc3QgW2Jvb2tFbmQsIGNoYXB0ZXJFbmQsIHZlcnNlRW5kXSA9IGVuZEJvb2tDaGFwdGVyVmVyc2Uuc3BsaXQoJzonKTtcblxuICAgIC8vIEZvcm1hdCB0aGUgbnVtYmVycyB0byBlbnN1cmUgcHJvcGVyIHBhZGRpbmdcbiAgICBjb25zdCBmb3JtYXR0ZWRDaGFwdGVyU3RhcnQgPSBjaGFwdGVyU3RhcnQucGFkU3RhcnQoMywgJzAnKTtcbiAgICBjb25zdCBmb3JtYXR0ZWRWZXJzZVN0YXJ0ID0gdmVyc2VTdGFydC5wYWRTdGFydCgzLCAnMCcpO1xuICAgIGNvbnN0IGZvcm1hdHRlZENoYXB0ZXJFbmQgPSBjaGFwdGVyRW5kLnBhZFN0YXJ0KDMsICcwJyk7XG4gICAgY29uc3QgZm9ybWF0dGVkVmVyc2VFbmQgPSB2ZXJzZUVuZC5wYWRTdGFydCgzLCAnMCcpO1xuXG4gICAgY29uc3QgZm9ybWF0dGVkUmVmZXJlbmNlU3RhcnQgPSBgJHtib29rU3RhcnR9JHtmb3JtYXR0ZWRDaGFwdGVyU3RhcnR9JHtmb3JtYXR0ZWRWZXJzZVN0YXJ0fWA7XG4gICAgY29uc3QgZm9ybWF0dGVkUmVmZXJlbmNlRW5kID0gYCR7Ym9va0VuZH0ke2Zvcm1hdHRlZENoYXB0ZXJFbmR9JHtmb3JtYXR0ZWRWZXJzZUVuZH1gO1xuXG4gICAgY29uc3QgZm9ybWF0dGVkUmVmZXJlbmNlID0gYCR7Zm9ybWF0dGVkUmVmZXJlbmNlU3RhcnR9LSR7Zm9ybWF0dGVkUmVmZXJlbmNlRW5kfWA7XG5cbiAgICByZXR1cm4gYGp3bGlicmFyeTovLy9maW5kZXI/YmlibGU9JHtmb3JtYXR0ZWRSZWZlcmVuY2V9YDtcbiAgfVxuXG4gIHByaXZhdGUgY29udmVydFB1YmxpY2F0aW9uUmVmZXJlbmNlKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBwYXJ0cyA9IHVybC5zcGxpdCgnLycpO1xuICAgIGNvbnN0IHB1YlJlZiA9IHBhcnRzWzNdO1xuICAgIGNvbnN0IFtsb2NhbGUsIGRvY0lkXSA9IHB1YlJlZi5zcGxpdCgnOicpO1xuICAgIGNvbnN0IHBhcmFncmFwaCA9IHBhcnRzWzRdO1xuXG4gICAgcmV0dXJuIGBqd2xpYnJhcnk6Ly8vZmluZGVyP3d0bG9jYWxlPSR7bG9jYWxlfSZkb2NpZD0ke2RvY0lkfSZwYXI9JHtwYXJhZ3JhcGh9YDtcbiAgfVxuXG4gIHByaXZhdGUgY29udmVydExpbmtzKGNvbnRlbnQ6IHN0cmluZywgdHlwZT86ICdiaWJsZScgfCAncHVibGljYXRpb24nIHwgJ2FsbCcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHdpa2lMaW5rUmVnZXggPSAvXFxbKFteXFxdXSspXFxdXFwoKFteKV0rKVxcKS9nO1xuXG4gICAgcmV0dXJuIGNvbnRlbnQucmVwbGFjZSh3aWtpTGlua1JlZ2V4LCAobWF0Y2gsIHRleHQsIHVybCkgPT4ge1xuICAgICAgLy8gSGFuZGxlIEJpYmxlIHJlZmVyZW5jZXNcbiAgICAgIGlmICh1cmwuc3RhcnRzV2l0aCgnandwdWI6Ly9iLycpICYmICh0eXBlID09PSAnYmlibGUnIHx8IHR5cGUgPT09ICdhbGwnKSkge1xuICAgICAgICByZXR1cm4gYFske3RleHR9XSgke3RoaXMuY29udmVydEJpYmxlUmVmZXJlbmNlKHVybCl9KWA7XG4gICAgICB9XG4gICAgICAvLyBIYW5kbGUgcHVibGljYXRpb24gcmVmZXJlbmNlc1xuICAgICAgaWYgKHVybC5zdGFydHNXaXRoKCdqd3B1YjovL3AvJykgJiYgKHR5cGUgPT09ICdwdWJsaWNhdGlvbicgfHwgdHlwZSA9PT0gJ2FsbCcpKSB7XG4gICAgICAgIHJldHVybiBgWyR7dGV4dH1dKCR7dGhpcy5jb252ZXJ0UHVibGljYXRpb25SZWZlcmVuY2UodXJsKX0pYDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtYXRjaDtcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBjb252ZXJ0QmlibGVUZXh0VG9MaW5rKGlucHV0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZWZlcmVuY2UgPSB0aGlzLnBhcnNlQmlibGVSZWZlcmVuY2UoaW5wdXQpO1xuICAgICAgcmV0dXJuIHRoaXMuZm9ybWF0SldMaWJyYXJ5TGluayhyZWZlcmVuY2UpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjb252ZXJ0aW5nIEJpYmxlIHRleHQ6JywgZXJyb3IubWVzc2FnZSk7XG4gICAgICByZXR1cm4gaW5wdXQ7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBwYXJzZUJpYmxlUmVmZXJlbmNlKGlucHV0OiBzdHJpbmcpOiBCaWJsZVJlZmVyZW5jZSB7XG4gICAgaW5wdXQgPSBpbnB1dC50cmltKCkudG9Mb3dlckNhc2UoKTtcblxuICAgIGNvbnN0IG1hdGNoID0gaW5wdXQubWF0Y2goL14oW2EtejAtOVx1MDBFNFx1MDBGNlx1MDBGQ1x1MDBERl0rPykoPzpcXHMqKFxcZCspXFxzKjpcXHMqKFxcZCspKD86XFxzKi1cXHMqKFxcZCspKT8kKS9pKTtcbiAgICBpZiAoIW1hdGNoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZm9ybWF0Jyk7XG4gICAgfVxuXG4gICAgY29uc3QgWywgYm9va05hbWUsIGNoYXB0ZXIsIHZlcnNlU3RhcnQsIHZlcnNlRW5kXSA9IG1hdGNoO1xuICAgIGNvbnN0IGJvb2tJbmRleCA9IHRoaXMuZmluZEJvb2tJbmRleChib29rTmFtZS50cmltKCkpO1xuICAgIGlmIChib29rSW5kZXggPT09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Jvb2sgbm90IGZvdW5kJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGJvb2s6IGJvb2tJbmRleCA8IDEwID8gYDAke2Jvb2tJbmRleH1gIDogYm9va0luZGV4LnRvU3RyaW5nKCksXG4gICAgICBjaGFwdGVyOiBjaGFwdGVyLnBhZFN0YXJ0KDMsICcwJyksXG4gICAgICB2ZXJzZTogdmVyc2VTdGFydC5wYWRTdGFydCgzLCAnMCcpLFxuICAgICAgZW5kVmVyc2U6IHZlcnNlRW5kID8gdmVyc2VFbmQucGFkU3RhcnQoMywgJzAnKSA6IHVuZGVmaW5lZCxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBmaW5kQm9va0luZGV4KGJvb2tRdWVyeTogc3RyaW5nKTogbnVtYmVyIHtcbiAgICBib29rUXVlcnkgPSBib29rUXVlcnkudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiaWJsZUJvb2tzREUubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGJvb2tFbnRyeSA9IGJpYmxlQm9va3NERVtpXTtcbiAgICAgIC8vIE9ubHkgbWF0Y2ggdGhlIGFiYnJldmlhdGlvbiwgbm90IHRoZSBmdWxsIG5hbWVcbiAgICAgIGNvbnN0IGFiYnJldmlhdGlvbiA9IE9iamVjdC5rZXlzKGJvb2tFbnRyeSlbMF0udG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmIChib29rUXVlcnkgPT09IGFiYnJldmlhdGlvbikge1xuICAgICAgICByZXR1cm4gaSArIDE7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIHByaXZhdGUgZm9ybWF0SldMaWJyYXJ5TGluayhyZWZlcmVuY2U6IEJpYmxlUmVmZXJlbmNlKTogc3RyaW5nIHtcbiAgICBjb25zdCBiYXNlUmVmZXJlbmNlID0gYCR7cmVmZXJlbmNlLmJvb2t9JHtyZWZlcmVuY2UuY2hhcHRlcn0ke3JlZmVyZW5jZS52ZXJzZX1gO1xuICAgIGNvbnN0IHJhbmdlUmVmZXJlbmNlID0gcmVmZXJlbmNlLmVuZFZlcnNlXG4gICAgICA/IGAtJHtyZWZlcmVuY2UuYm9va30ke3JlZmVyZW5jZS5jaGFwdGVyfSR7cmVmZXJlbmNlLmVuZFZlcnNlfWBcbiAgICAgIDogJyc7XG4gICAgcmV0dXJuIGBqd2xpYnJhcnk6Ly8vZmluZGVyP2JpYmxlPSR7YmFzZVJlZmVyZW5jZX0ke3JhbmdlUmVmZXJlbmNlfWA7XG4gIH1cblxuICBwcml2YXRlIGZvcm1hdEJpYmxlVGV4dChpbnB1dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVmZXJlbmNlID0gdGhpcy5wYXJzZUJpYmxlUmVmZXJlbmNlKGlucHV0KTtcbiAgICAgIGNvbnN0IGJvb2tJbmRleCA9IHBhcnNlSW50KHJlZmVyZW5jZS5ib29rKSAtIDE7XG4gICAgICBjb25zdCBib29rRW50cnkgPSBiaWJsZUJvb2tzREVbYm9va0luZGV4XTtcbiAgICAgIGNvbnN0IGZvcm1hdHRlZEJvb2sgPSBPYmplY3QudmFsdWVzKGJvb2tFbnRyeSlbMF07XG5cbiAgICAgIC8vIEZvcm1hdCB0aGUgdmVyc2UgcmVmZXJlbmNlXG4gICAgICBjb25zdCB2ZXJzZVJlZiA9IHJlZmVyZW5jZS5lbmRWZXJzZVxuICAgICAgICA/IGAke3BhcnNlSW50KHJlZmVyZW5jZS52ZXJzZSl9LSR7cGFyc2VJbnQocmVmZXJlbmNlLmVuZFZlcnNlKX1gXG4gICAgICAgIDogcGFyc2VJbnQocmVmZXJlbmNlLnZlcnNlKTtcblxuICAgICAgcmV0dXJuIGAke2Zvcm1hdHRlZEJvb2t9ICR7cGFyc2VJbnQocmVmZXJlbmNlLmNoYXB0ZXIpfToke3ZlcnNlUmVmfWA7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHJldHVybiBpbnB1dDtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgY29udmVydEJpYmxlVGV4dFRvTWFya2Rvd25MaW5rKGlucHV0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB1cmwgPSB0aGlzLmNvbnZlcnRCaWJsZVRleHRUb0xpbmsoaW5wdXQpO1xuICAgICAgY29uc3QgZm9ybWF0dGVkVGV4dCA9IHRoaXMuZm9ybWF0QmlibGVUZXh0KGlucHV0KTtcbiAgICAgIC8vIE9ubHkgY3JlYXRlIG1hcmtkb3duIGxpbmsgaWYgY29udmVyc2lvbiB3YXMgc3VjY2Vzc2Z1bFxuICAgICAgaWYgKHVybCAhPT0gaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIGBbJHtmb3JtYXR0ZWRUZXh0fV0oJHt1cmx9KWA7XG4gICAgICB9XG4gICAgICByZXR1cm4gaW5wdXQ7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHJldHVybiBpbnB1dDtcbiAgICB9XG4gIH1cblxuICBhc3luYyBvbmxvYWQoKSB7XG4gICAgYXdhaXQgdGhpcy5sb2FkU2V0dGluZ3MoKTtcblxuICAgIC8vIEFkZCB0aGUgY29tbWFuZCBmb3IgYWxsIGxpbmsgcmVwbGFjZW1lbnRcbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdyZXBsYWNlLWxpbmtzJyxcbiAgICAgIG5hbWU6ICdSZXBsYWNlIGFsbCBsaW5rcycsXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcjogRWRpdG9yKSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRDb250ZW50ID0gZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgIGNvbnN0IHVwZGF0ZWRDb250ZW50ID0gdGhpcy5jb252ZXJ0TGlua3MoY3VycmVudENvbnRlbnQsICdhbGwnKTtcbiAgICAgICAgaWYgKGN1cnJlbnRDb250ZW50ICE9PSB1cGRhdGVkQ29udGVudCkge1xuICAgICAgICAgIGVkaXRvci5zZXRWYWx1ZSh1cGRhdGVkQ29udGVudCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBBZGQgY29tbWFuZCBmb3IgQmlibGUgbGlua3Mgb25seVxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ3JlcGxhY2UtYmlibGUtbGlua3MnLFxuICAgICAgbmFtZTogJ1JlcGxhY2UgQmlibGUgdmVyc2UgbGlua3MnLFxuICAgICAgZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3I6IEVkaXRvcikgPT4ge1xuICAgICAgICBjb25zdCBjdXJyZW50Q29udGVudCA9IGVkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICBjb25zdCB1cGRhdGVkQ29udGVudCA9IHRoaXMuY29udmVydExpbmtzKGN1cnJlbnRDb250ZW50LCAnYmlibGUnKTtcbiAgICAgICAgaWYgKGN1cnJlbnRDb250ZW50ICE9PSB1cGRhdGVkQ29udGVudCkge1xuICAgICAgICAgIGVkaXRvci5zZXRWYWx1ZSh1cGRhdGVkQ29udGVudCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBBZGQgY29tbWFuZCBmb3IgcHVibGljYXRpb24gbGlua3Mgb25seVxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ3JlcGxhY2UtcHVibGljYXRpb24tbGlua3MnLFxuICAgICAgbmFtZTogJ1JlcGxhY2UgcHVibGljYXRpb24gbGlua3MnLFxuICAgICAgZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3I6IEVkaXRvcikgPT4ge1xuICAgICAgICBjb25zdCBjdXJyZW50Q29udGVudCA9IGVkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICBjb25zdCB1cGRhdGVkQ29udGVudCA9IHRoaXMuY29udmVydExpbmtzKGN1cnJlbnRDb250ZW50LCAncHVibGljYXRpb24nKTtcbiAgICAgICAgaWYgKGN1cnJlbnRDb250ZW50ICE9PSB1cGRhdGVkQ29udGVudCkge1xuICAgICAgICAgIGVkaXRvci5zZXRWYWx1ZSh1cGRhdGVkQ29udGVudCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBBZGQgY29tbWFuZCBmb3IgQmlibGUgdGV4dCBjb252ZXJzaW9uXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnY29udmVydC1iaWJsZS10ZXh0JyxcbiAgICAgIG5hbWU6ICdDb252ZXJ0IEJpYmxlIHJlZmVyZW5jZSB0byBMaWJyYXJ5IGxpbmsnLFxuICAgICAgZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3I6IEVkaXRvcikgPT4ge1xuICAgICAgICBjb25zdCBzZWxlY3Rpb24gPSBlZGl0b3IuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgIGlmIChzZWxlY3Rpb24pIHtcbiAgICAgICAgICBjb25zdCBjb252ZXJ0ZWRMaW5rID0gdGhpcy5jb252ZXJ0QmlibGVUZXh0VG9NYXJrZG93bkxpbmsoc2VsZWN0aW9uKTtcbiAgICAgICAgICBlZGl0b3IucmVwbGFjZVNlbGVjdGlvbihjb252ZXJ0ZWRMaW5rKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIEFkZCBzZXR0aW5ncyB0YWJcbiAgICB0aGlzLmFkZFNldHRpbmdUYWIobmV3IExpbmtSZXBsYWNlclNldHRpbmdUYWIodGhpcy5hcHAsIHRoaXMpKTtcblxuICAgIC8vIFJlZ2lzdGVyIHRoZSBCaWJsZSByZWZlcmVuY2Ugc3VnZ2VzdGVyXG4gICAgdGhpcy5iaWJsZVN1Z2dlc3RlciA9IG5ldyBCaWJsZVJlZmVyZW5jZVN1Z2dlc3Rlcih0aGlzKTtcbiAgICB0aGlzLnJlZ2lzdGVyRWRpdG9yU3VnZ2VzdCh0aGlzLmJpYmxlU3VnZ2VzdGVyKTtcbiAgfVxuXG4gIG9udW5sb2FkKCkge1xuICAgIC8vIENsZWFuIHVwIHBsdWdpbiByZXNvdXJjZXMgaWYgbmVlZGVkXG4gIH1cblxuICBhc3luYyBsb2FkU2V0dGluZ3MoKSB7XG4gICAgdGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIGF3YWl0IHRoaXMubG9hZERhdGEoKSk7XG4gIH1cblxuICBhc3luYyBzYXZlU2V0dGluZ3MoKSB7XG4gICAgYXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcbiAgfVxufVxuXG5jbGFzcyBMaW5rUmVwbGFjZXJTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XG4gIHBsdWdpbjogTGlicmFyeUxpbmtlclBsdWdpbjtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBMaWJyYXJ5TGlua2VyUGx1Z2luKSB7XG4gICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICB9XG5cbiAgZGlzcGxheSgpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xuICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XG5cbiAgICAvLyBXZSdsbCBhZGQgc2V0dGluZ3MgVUkgZWxlbWVudHMgaGVyZSB3aGVuIG5lZWRlZFxuICB9XG59XG4iLCAiZXhwb3J0IHR5cGUgQmlibGVCb29rQWJicmV2aWF0aW9ucyA9IHJlYWRvbmx5IHN0cmluZ1tdO1xuZXhwb3J0IHR5cGUgQmlibGVCb29rcyA9IHJlYWRvbmx5IEJpYmxlQm9va0FiYnJldmlhdGlvbnNbXTtcblxuZXhwb3J0IGNvbnN0IGJpYmxlQm9va3NERSA9IFtcbiAgICB7IFwiMW1vXCI6IFwiMS4gTW9zZVwiIH0sXG4gICAgeyBcIjJtb1wiOiBcIjIuIE1vc2VcIiB9LFxuICAgIHsgXCIzbW9cIjogXCIzLiBNb3NlXCIgfSxcbiAgICB7IFwiNG1vXCI6IFwiNC4gTW9zZVwiIH0sXG4gICAgeyBcIjVtb1wiOiBcIjUuIE1vc2VcIiB9LFxuICAgIHsgXCJqb3NcIjogXCJKb3N1YVwiIH0sXG4gICAgeyBcInJpXCI6IFwiUmljaHRlclwiIH0sXG4gICAgeyBcInJ1XCI6IFwiUnV0aFwiIH0sXG4gICAgeyBcIjFzYW1cIjogXCIxLiBTYW11ZWxcIiB9LFxuICAgIHsgXCIyc2FtXCI6IFwiMi4gU2FtdWVsXCIgfSxcbiAgICB7IFwiMWtcdTAwRjZcIjogXCIxLiBLXHUwMEY2bmlnZVwiIH0sXG4gICAgeyBcIjJrXHUwMEY2XCI6IFwiMi4gS1x1MDBGNm5pZ2VcIiB9LFxuICAgIHsgXCIxY2hcIjogXCIxLiBDaHJvbmlrYVwiIH0sXG4gICAgeyBcIjJjaFwiOiBcIjIuIENocm9uaWthXCIgfSxcbiAgICB7IFwiZXNyXCI6IFwiRXNyYVwiIH0sXG4gICAgeyBcIm5laFwiOiBcIk5laGVtaWFcIiB9LFxuICAgIHsgXCJlc3RcIjogXCJFc3RoZXJcIiB9LFxuICAgIHsgXCJoaVwiOiBcIkhpb2JcIiB9LFxuICAgIHsgXCJwc1wiOiBcIlBzYWxtXCIgfSxcbiAgICB7IFwic3ByXCI6IFwiU3ByXHUwMEZDY2hlXCIgfSxcbiAgICB7IFwicHJlZFwiOiBcIlByZWRpZ2VyXCIgfSxcbiAgICB7IFwiaG9oXCI6IFwiSG9oZXMgTGllZFwiIH0sXG4gICAgeyBcImplc1wiOiBcIkplc2FqYVwiIH0sXG4gICAgeyBcImplclwiOiBcIkplcmVtaWFcIiB9LFxuICAgIHsgXCJrbGFnXCI6IFwiS2xhZ2VsaWVkZXJcIiB9LFxuICAgIHsgXCJoZXNcIjogXCJIZXNla2llbFwiIH0sXG4gICAgeyBcImRhblwiOiBcIkRhbmllbFwiIH0sXG4gICAgeyBcImhvc1wiOiBcIkhvc2VhXCIgfSxcbiAgICB7IFwiam9lXCI6IFwiSm9lbFwiIH0sXG4gICAgeyBcImFtXCI6IFwiQW1vc1wiIH0sXG4gICAgeyBcIm9iXCI6IFwiT2JhZGphXCIgfSxcbiAgICB7IFwiam9uXCI6IFwiSm9uYVwiIH0sXG4gICAgeyBcIm1pXCI6IFwiTWljaGFcIiB9LFxuICAgIHsgXCJuYWhcIjogXCJOYWh1bVwiIH0sXG4gICAgeyBcImhhYlwiOiBcIkhhYmFrdWtcIiB9LFxuICAgIHsgXCJ6ZXBoXCI6IFwiWmVwaGFuamFcIiB9LFxuICAgIHsgXCJoYWdcIjogXCJIYWdnYWlcIiB9LFxuICAgIHsgXCJzYWNoXCI6IFwiU2FjaGFyamFcIiB9LFxuICAgIHsgXCJtYWxcIjogXCJNYWxlYWNoaVwiIH0sXG4gICAgeyBcIm1hdFwiOiBcIk1hdHRoXHUwMEU0dXNcIiB9LFxuICAgIHsgXCJtYXJcIjogXCJNYXJrdXNcIiB9LFxuICAgIHsgXCJsdWtcIjogXCJMdWthc1wiIH0sXG4gICAgeyBcImpvaFwiOiBcIkpvaGFubmVzXCIgfSxcbiAgICB7IFwiYXBnXCI6IFwiQXBvc3RlbGdlc2NoaWNodGVcIiB9LFxuICAgIHsgXCJyXHUwMEY2bVwiOiBcIlJcdTAwRjZtZXJcIiB9LFxuICAgIHsgXCIxa29yXCI6IFwiMS4gS29yaW50aGVyXCIgfSxcbiAgICB7IFwiMmtvclwiOiBcIjIuIEtvcmludGhlclwiIH0sXG4gICAgeyBcImdhbFwiOiBcIkdhbGF0ZXJcIiB9LFxuICAgIHsgXCJlcGhcIjogXCJFcGhlc2VyXCIgfSxcbiAgICB7IFwicGhpbFwiOiBcIlBoaWxpcHBlclwiIH0sXG4gICAgeyBcImtvbFwiOiBcIktvbG9zc2VyXCIgfSxcbiAgICB7IFwiMXRoZXNcIjogXCIxLiBUaGVzc2Fsb25pY2hlclwiIH0sXG4gICAgeyBcIjJ0aGVzXCI6IFwiMi4gVGhlc3NhbG9uaWNoZXJcIiB9LFxuICAgIHsgXCIxdGltXCI6IFwiMS4gVGltb3RoZXVzXCIgfSxcbiAgICB7IFwiMnRpbVwiOiBcIjIuIFRpbW90aGV1c1wiIH0sXG4gICAgeyBcInRpdFwiOiBcIlRpdHVzXCIgfSxcbiAgICB7IFwicGhpbGVtXCI6IFwiUGhpbGVtb25cIiB9LFxuICAgIHsgXCJoZWJcIjogXCJIZWJyXHUwMEU0ZXJcIiB9LFxuICAgIHsgXCJqYWtcIjogXCJKYWtvYnVzXCIgfSxcbiAgICB7IFwiMXBldFwiOiBcIjEuIFBldHJ1c1wiIH0sXG4gICAgeyBcIjJwZXRcIjogXCIyLiBQZXRydXNcIiB9LFxuICAgIHsgXCIxam9oXCI6IFwiMS4gSm9oYW5uZXNcIiB9LFxuICAgIHsgXCIyam9oXCI6IFwiMi4gSm9oYW5uZXNcIiB9LFxuICAgIHsgXCIzam9oXCI6IFwiMy4gSm9oYW5uZXNcIiB9LFxuICAgIHsgXCJqdWRcIjogXCJKdWRhc1wiIH0sXG4gICAgeyBcIm9mZmJcIjogXCJPZmZlbmJhcnVuZ1wiIH1cbl0gYXMgY29uc3Q7Il0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHNCQVdPOzs7QUNSQSxJQUFNLGVBQWU7QUFBQSxFQUN4QixFQUFFLE9BQU8sVUFBVTtBQUFBLEVBQ25CLEVBQUUsT0FBTyxVQUFVO0FBQUEsRUFDbkIsRUFBRSxPQUFPLFVBQVU7QUFBQSxFQUNuQixFQUFFLE9BQU8sVUFBVTtBQUFBLEVBQ25CLEVBQUUsT0FBTyxVQUFVO0FBQUEsRUFDbkIsRUFBRSxPQUFPLFFBQVE7QUFBQSxFQUNqQixFQUFFLE1BQU0sVUFBVTtBQUFBLEVBQ2xCLEVBQUUsTUFBTSxPQUFPO0FBQUEsRUFDZixFQUFFLFFBQVEsWUFBWTtBQUFBLEVBQ3RCLEVBQUUsUUFBUSxZQUFZO0FBQUEsRUFDdEIsRUFBRSxVQUFPLGVBQVk7QUFBQSxFQUNyQixFQUFFLFVBQU8sZUFBWTtBQUFBLEVBQ3JCLEVBQUUsT0FBTyxjQUFjO0FBQUEsRUFDdkIsRUFBRSxPQUFPLGNBQWM7QUFBQSxFQUN2QixFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLEVBQUUsT0FBTyxVQUFVO0FBQUEsRUFDbkIsRUFBRSxPQUFPLFNBQVM7QUFBQSxFQUNsQixFQUFFLE1BQU0sT0FBTztBQUFBLEVBQ2YsRUFBRSxNQUFNLFFBQVE7QUFBQSxFQUNoQixFQUFFLE9BQU8sYUFBVTtBQUFBLEVBQ25CLEVBQUUsUUFBUSxXQUFXO0FBQUEsRUFDckIsRUFBRSxPQUFPLGFBQWE7QUFBQSxFQUN0QixFQUFFLE9BQU8sU0FBUztBQUFBLEVBQ2xCLEVBQUUsT0FBTyxVQUFVO0FBQUEsRUFDbkIsRUFBRSxRQUFRLGNBQWM7QUFBQSxFQUN4QixFQUFFLE9BQU8sV0FBVztB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
