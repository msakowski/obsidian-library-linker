import { App, Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, MarkdownView, Plugin, PluginSettingTab, TFile } from 'obsidian';
import { bibleBooksDE } from './src/bibleBooks';

interface LinkReplacerSettings {
	// We'll add settings later if needed
}

const DEFAULT_SETTINGS: LinkReplacerSettings = {
	// Default settings will go here
}

interface BibleSuggestion {
	text: string;
	command: 'link' | 'open';
}

interface BibleReference {
	book: string;
	chapter: string;
	verse: string;
	endVerse?: string;
}

class BibleReferenceSuggester extends EditorSuggest<BibleSuggestion> {
	plugin: LibraryLinkerPlugin;

	constructor(plugin: LibraryLinkerPlugin) {
		super(plugin.app);
		this.plugin = plugin;
	}

	onTrigger(cursor: EditorPosition, editor: Editor): EditorSuggestTriggerInfo | null {
		const line = editor.getLine(cursor.line);
		const subString = line.substring(0, cursor.ch);
		
		// Modified patterns to better handle spaces
		const matchLink = subString.match(/\/b\s+([a-z0-9äöüß]+)\s*(\d+:\d+(?:-\d+)?)?$/i);
		const matchOpen = subString.match(/\/bo\s+([a-z0-9äöüß]+)\s*(\d+:\d+(?:-\d+)?)?$/i);
		
		if (!matchLink && !matchOpen) return null;

		const match = matchOpen || matchLink;
		if (!match) return null;

		return {
			start: {
				ch: match.index!,
				line: cursor.line
			},
			end: cursor,
			query: {
				text: match[1] && match[2] ? `${match[1]} ${match[2]}` : '',
				command: matchOpen ? 'open' : 'link'
			}
		};
	}

	getSuggestions(context: EditorSuggestContext & { query: BibleSuggestion }): BibleSuggestion[] {
		if (context.query.text.match(/^[a-z0-9äöüß]+\s*\d+:\d+(?:-\d+)?$/i)) {
			return [{
				text: context.query.text,
				command: context.query.command
			}];
		}
		return [];
	}

	renderSuggestion(suggestion: BibleSuggestion, el: HTMLElement): void {
		const action = suggestion.command === 'open' ? 'Convert and open' : 'Convert';
		el.setText(`${action} "${suggestion.text}" to JW Library link`);
	}

	selectSuggestion(suggestion: BibleSuggestion): void {
		if (!this.context) return;
		const { context } = this;
		const editor = context.editor;
		
		// Convert the Bible reference to a link
		const convertedLink = this.plugin.convertBibleTextToMarkdownLink(suggestion.text);
		
		// Replace the entire command and reference with the converted link
		editor.replaceRange(
			convertedLink,
			context.start,
			context.end
		);

		// If this was a /bo command, open the link
		if (suggestion.command === 'open') {
			const url = this.plugin.convertBibleTextToLink(suggestion.text);
			window.open(url);
		}
	}
}

export default class LibraryLinkerPlugin extends Plugin {
	settings: LinkReplacerSettings;
	private bibleSuggester: BibleReferenceSuggester;

	private convertBibleReference(url: string): string {
		// Replace 'jwpub://' with 'jwlibrary://'
		url = url.replace('jwpub://', 'jwlibrary://');
		// Extract the Bible reference parts
		const parts = url.split('/');
		const bibleRef = parts[parts.length - 1];
		
		// Extract book, chapter and verse
		const [startBookChapterVerse, endBookChapterVerse] = bibleRef.split('-');
		const [bookStart, chapterStart, verseStart] = startBookChapterVerse.split(':');
		const [bookEnd, chapterEnd, verseEnd] = endBookChapterVerse.split(':');
		
		// Format the numbers to ensure proper padding
		const formattedChapterStart = chapterStart.padStart(3, '0');
		const formattedVerseStart = verseStart.padStart(3, '0');
		const formattedChapterEnd = chapterEnd.padStart(3, '0');
		const formattedVerseEnd = verseEnd.padStart(3, '0');

		const formattedReferenceStart = `${bookStart}${formattedChapterStart}${formattedVerseStart}`;
		const formattedReferenceEnd = `${bookEnd}${formattedChapterEnd}${formattedVerseEnd}`;

		const formattedReference = `${formattedReferenceStart}-${formattedReferenceEnd}`;
		
		// Construct the new URL format
		return `jwlibrary:///finder?bible=${formattedReference}`;
	}

	private convertPublicationReference(url: string): string {
		// Extract the publication reference parts
		const parts = url.split('/');
		const pubRef = parts[3];
		const [locale, docId] = pubRef.split(':');
		const paragraph = parts[4];
		
		// Construct the new URL format
		return `jwlibrary:///finder?wtlocale=${locale}&docid=${docId}&par=${paragraph}`;
	}

	private convertLinks(content: string, type?: 'bible' | 'publication' | 'all'): string {
		const wikiLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
		
		return content.replace(wikiLinkRegex, (match, text, url) => {
			// Handle Bible references
			if (url.startsWith('jwpub://b/') && (type === 'bible' || type === 'all')) {
				return `[${text}](${this.convertBibleReference(url)})`;
			}
			// Handle publication references
			if (url.startsWith('jwpub://p/') && (type === 'publication' || type === 'all')) {
				return `[${text}](${this.convertPublicationReference(url)})`;
			}
			return match;
		});
	}

	public convertBibleTextToLink(input: string): string {
		try {
			const reference = this.parseBibleReference(input);
			return this.formatJWLibraryLink(reference);
		} catch (error) {
			console.error("Error converting Bible text:", error.message);
			return input;
		}
	}

	private parseBibleReference(input: string): BibleReference {
		input = input.trim().toLowerCase();
		
		const match = input.match(/^([a-z0-9äöüß]+)\s*(\d+):(\d+)(?:-(\d+))?$/i);
		if (!match) {
			throw new Error("Invalid format");
		}

		const [, bookQuery, chapter, verse, endVerse] = match;
		const bookIndex = this.findBookIndex(bookQuery);
		if (bookIndex === -1) {
			throw new Error("Book not found");
		}

		return {
			book: bookIndex < 10 ? `0${bookIndex}` : bookIndex.toString(),
			chapter: chapter.padStart(3, "0"),
			verse: verse.padStart(3, "0"),
			endVerse: endVerse?.padStart(3, "0")
		};
	}

	private findBookIndex(bookQuery: string): number {
		for (let i = 0; i < bibleBooksDE.length; i++) {
			if (bibleBooksDE[i].includes(bookQuery)) {
				return i + 1;
			}
		}
		return -1;
	}

	private formatJWLibraryLink(reference: BibleReference): string {
		const baseReference = `${reference.book}${reference.chapter}${reference.verse}`;
		const rangeReference = reference.endVerse 
			? `-${reference.book}${reference.chapter}${reference.endVerse}`
			: '';
		return `jwlibrary:///finder?bible=${baseReference}${rangeReference}`;
	}

	private formatBibleText(input: string): string {
		// Remove extra spaces and ensure consistent formatting
		const trimmed = input.trim();
		// Match the pattern "book chapter:verse-verse"
		const match = trimmed.match(/^([a-z0-9äöüß]+)\s*(\d+):(\d+)(?:-(\d+))?$/i);
		if (!match) return input;

		const [, book, chapter, verse, endVerse] = match;
		
		// Find the book index and get the full name
		const bookIndex = this.findBookIndex(book);
		let formattedBook = book;
		if (bookIndex !== -1) {
			formattedBook = bibleBooksDE[bookIndex - 1][1]; // Use the second value (full name)
		}
		// Format book title according to rules
		if (formattedBook) {
			if (formattedBook.match(/^\d/)) {
				// Starts with number: Add dot and space, capitalize word
				formattedBook = formattedBook.replace(/^(\d+)(\w+)/, (_, num, word) => 
					`${num}. ${word.charAt(0).toUpperCase()}${word.slice(1)}`
				);
			} else if (formattedBook.includes(" ")) {
				// Two words: Capitalize both
				formattedBook = formattedBook.split(" ")
					.map(word => word.charAt(0).toUpperCase() + word.slice(1))
					.join(" ");
			} else {
				// Single word: Capitalize first letter
				formattedBook = formattedBook.charAt(0).toUpperCase() + formattedBook.slice(1);
			}
		}
		return endVerse 
			? `${formattedBook} ${chapter}:${verse}-${endVerse}`
			: `${formattedBook} ${chapter}:${verse}`;
	}

	public convertBibleTextToMarkdownLink(input: string): string {
		const url = this.convertBibleTextToLink(input);
		const formattedText = this.formatBibleText(input);
		return `[${formattedText}](${url})`;
	}

	async onload() {
		await this.loadSettings();

		// Add the command for all link replacement
		this.addCommand({
			id: 'replace-links',
			name: 'Replace all links',
			editorCallback: (editor: Editor) => {
				const currentContent = editor.getValue();
				const updatedContent = this.convertLinks(currentContent, 'all');
				if (currentContent !== updatedContent) {
					editor.setValue(updatedContent);
				}
			}
		});

		// Add command for Bible links only
		this.addCommand({
			id: 'replace-bible-links',
			name: 'Replace Bible verse links',
			editorCallback: (editor: Editor) => {
				const currentContent = editor.getValue();
				const updatedContent = this.convertLinks(currentContent, 'bible');
				if (currentContent !== updatedContent) {
					editor.setValue(updatedContent);
				}
			}
		});

		// Add command for publication links only
		this.addCommand({
			id: 'replace-publication-links',
			name: 'Replace publication links',
			editorCallback: (editor: Editor) => {
				const currentContent = editor.getValue();
				const updatedContent = this.convertLinks(currentContent, 'publication');
				if (currentContent !== updatedContent) {
					editor.setValue(updatedContent);
				}
			}
		});

		// Add command for Bible text conversion
		this.addCommand({
			id: 'convert-bible-text',
			name: 'Convert Bible reference to Library link',
			editorCallback: (editor: Editor) => {
				const selection = editor.getSelection();
				if (selection) {
					const convertedLink = this.convertBibleTextToMarkdownLink(selection);
					editor.replaceSelection(convertedLink);
				}
			}
		});

		// Add settings tab
		this.addSettingTab(new LinkReplacerSettingTab(this.app, this));

		// Register the Bible reference suggester
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

class LinkReplacerSettingTab extends PluginSettingTab {
	plugin: LibraryLinkerPlugin;

	constructor(app: App, plugin: LibraryLinkerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		// We'll add settings UI elements here when needed
	}
}
