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
		
		// Modified regex to make space between book and chapter optional
		const matchLink = subString.match(/\/b\s+([a-z0-9äöüß]+\s*\d+:\d+(?:-\d+)?)?$/i);
		const matchOpen = subString.match(/\/bo\s+([a-z0-9äöüß]+\s*\d+:\d+(?:-\d+)?)?$/i);
		
		if (!matchLink && !matchOpen) return null;

		const match = matchOpen || matchLink;
		if (!match) return null;

		return {
			start: {
				ch: match.index!,
				line: cursor.line
			},
			end: cursor,
			query: match[1] || ''
		};
	}

	getSuggestions(context: EditorSuggestContext): BibleSuggestion[] {
		const query = context.query;
		// Get the full line to check for /bo
		const line = context.editor.getLine(context.start.line);
		const isOpenCommand = line.substring(0, context.start.ch + 3) === '/bo';
		
		// Regex that handles both with and without space
		if (query.match(/^[a-z0-9äöüß]+\s*\d+:\d+(?:-\d+)?$/i)) {
			return [{
				text: query,
				command: isOpenCommand ? 'open' : 'link'
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
		
		return `jwlibrary:///finder?bible=${formattedReference}`;
	}

	private convertPublicationReference(url: string): string {
		const parts = url.split('/');
		const pubRef = parts[3];
		const [locale, docId] = pubRef.split(':');
		const paragraph = parts[4];
		
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
			endVerse: verseEnd ? verseEnd.padStart(3, "0") : undefined
		};
	}

	private findBookIndex(bookQuery: string): number {
		bookQuery = bookQuery.toLowerCase().trim();
		for (let i = 0; i < bibleBooksDE.length; i++) {
			const bookEntry = bibleBooksDE[i];
			// Only match the abbreviation, not the full name
			const abbreviation = Object.keys(bookEntry)[0].toLowerCase();
			if (bookQuery === abbreviation) {
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
		try {
			const reference = this.parseBibleReference(input);
			const bookIndex = parseInt(reference.book) - 1;
			const bookEntry = bibleBooksDE[bookIndex];
			const formattedBook = Object.values(bookEntry)[0];
			
			// Format the verse reference
			const verseRef = reference.endVerse 
				? `${parseInt(reference.verse)}-${parseInt(reference.endVerse)}` 
				: parseInt(reference.verse);
			
			return `${formattedBook} ${parseInt(reference.chapter)}:${verseRef}`;
		} catch (error) {
			return input;
		}
	}

	public convertBibleTextToMarkdownLink(input: string): string {
		try {
			const url = this.convertBibleTextToLink(input);
			const formattedText = this.formatBibleText(input);
			// Only create markdown link if conversion was successful
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
