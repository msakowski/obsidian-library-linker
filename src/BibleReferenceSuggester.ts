import {
  Editor,
  EditorPosition,
  EditorSuggest,
  EditorSuggestContext,
  EditorSuggestTriggerInfo,
} from 'obsidian';
import type { BibleReference, BibleSuggestion } from '@/types';
import { formatBibleText } from '@/utils/formatBibleText';
import { parseBibleReference, extractBibleReferenceFromMatch } from '@/utils/parseBibleReference';
import { formatJWLibraryLink } from '@/utils/formatJWLibraryLink';
import { convertBibleTextToMarkdownLink } from '@/utils/convertBibleTextToMarkdownLink';
import type JWLibraryLinkerPlugin from '@/main';
import { BIBLE_REFERENCE_REGEX } from '@/utils/bibleReferenceRegex';
import { buildBookNameRegex } from '@/utils/buildBookNameRegex';
import { logger } from '@/utils/logger';

const TRIGGER = '/b ';
/** Characters that continue a reference after the cursor: "6" in "John 3:1|6". */
const REFERENCE_CONTINUATION = /^[\p{L}\p{N}:.,\-–]*/u;
/** What may come right before a command: a space, or opening punctuation or markup. */
const BEFORE_COMMAND = /[\s([{*_>"'“‘«]/;

/**
 * Where the `/b` command the cursor is in starts, or -1. The command must
 * start the line or follow a space or opening punctuation or markup (a
 * parenthesis, bracket, emphasis mark or quote), so text such as "km/b 5" is
 * no command; typing before a
 * command keeps detecting references normally.
 */
function findCommandStart(line: string, cursorCh: number): number {
  for (
    let index = line.lastIndexOf(TRIGGER, cursorCh - TRIGGER.length);
    index !== -1;
    index = index > 0 ? line.lastIndexOf(TRIGGER, index - 1) : -1
  ) {
    if (index === 0 || BEFORE_COMMAND.test(line.charAt(index - 1))) return index;
  }

  return -1;
}

/** Whether the suggestion was opened by the `/b` command. */
function isCommandContext(context: EditorSuggestContext): boolean {
  return context.editor.getLine(context.start.line).startsWith(TRIGGER, context.start.ch);
}

export class BibleReferenceSuggester extends EditorSuggest<BibleSuggestion> {
  plugin: JWLibraryLinkerPlugin;
  private t: (key: string, variables?: Record<string, string>) => string;
  private cachedBookRegex: RegExp | null = null;
  private cachedBookRegexLanguage: string | null = null;
  /** The suggestion on show: where it starts, and whether it offered anything. */
  private shown: { editor: Editor; start: EditorPosition; hasSuggestions: boolean } | null = null;
  /** Start of a suggestion the user closed without choosing it. */
  private dismissed: { editor: Editor; start: EditorPosition } | null = null;
  private selecting = false;

  constructor(plugin: JWLibraryLinkerPlugin) {
    super(plugin.app);
    this.plugin = plugin;
    this.t = this.plugin.getTranslationService().t.bind(this.plugin.getTranslationService());
  }

  private getBookRegex(): RegExp {
    const lang = this.plugin.settings.language;
    if (this.cachedBookRegex && this.cachedBookRegexLanguage === lang) {
      return this.cachedBookRegex;
    }
    this.cachedBookRegex = buildBookNameRegex(lang);
    this.cachedBookRegexLanguage = lang;
    return this.cachedBookRegex;
  }

  /**
   * Finds the unlinked reference that contains or ends at the cursor.
   * Only that one is suggested: a line can hold links and other references,
   * and a reference the cursor has moved past (e.g. after Escape) must not reopen the popup.
   */
  private findReferenceAtCursor(
    line: string,
    cursorCh: number,
  ): { start: number; end: number; text: string } | null {
    // Generic regex first; single-chapter books (e.g. "Jude 3") only match the book name regex
    for (const regex of [BIBLE_REFERENCE_REGEX, this.getBookRegex()]) {
      for (const match of line.matchAll(regex)) {
        const rawStart = match.index;
        if (rawStart > cursorCh) break;

        // The regex may over-match leading words (e.g. "some text before John 3:16").
        // Trim from the front to find the actual book name.
        const result = extractBibleReferenceFromMatch(match[0], this.plugin.settings.language);
        if (!result) continue;

        const start = rawStart + result.offset;
        const end = start + result.text.length;
        if (cursorCh < start || cursorCh > end) continue;

        // Skip a reference already inside a markdown link: [***text***](...)
        const hasLinkBefore = /\[\*{0,2}$/.test(line.substring(0, start));
        const hasLinkAfter = /^\*{0,2}\]\(/.test(line.substring(end));
        if (hasLinkBefore && hasLinkAfter) return null;

        return { start, end, text: result.text };
      }
    }

    return null;
  }

  /**
   * Keeps a suggestion the user closed (Escape, a click elsewhere) closed
   * while they go on typing the same reference or `/b` command; a reference
   * starting elsewhere, or moving the cursor away, ends this.
   */
  onTrigger(cursor: EditorPosition, editor: Editor): EditorSuggestTriggerInfo | null {
    const trigger = this.findTrigger(cursor, editor);
    const dismissed = this.dismissed;

    if (
      trigger &&
      dismissed?.editor === editor &&
      dismissed.start.line === trigger.start.line &&
      dismissed.start.ch === trigger.start.ch
    ) {
      this.shown = null;
      return null;
    }

    this.dismissed = null;
    this.shown = trigger ? { editor, start: trigger.start, hasSuggestions: false } : null;
    return trigger;
  }

  close(): void {
    // Closing a suggestion that is still triggered and offered something,
    // without one being chosen, means the user dismissed it.
    if (this.shown?.hasSuggestions && !this.selecting) {
      this.dismissed = { editor: this.shown.editor, start: this.shown.start };
    }
    this.shown = null;
    super.close();
  }

  private findTrigger(cursor: EditorPosition, editor: Editor): EditorSuggestTriggerInfo | null {
    const line = editor.getLine(cursor.line);
    const commandIndex = findCommandStart(line, cursor.ch);

    /**
     * Silent mode: If there is a complete reference at the cursor, show it as a suggestion
     */
    const reference = commandIndex === -1 ? this.findReferenceAtCursor(line, cursor.ch) : null;

    if (reference) {
      return {
        start: {
          ch: reference.start,
          line: cursor.line,
        },
        end: {
          ch: reference.end,
          line: cursor.line,
        },
        query: reference.text,
      };
    }

    /**
     * Command mode: If there is a /b, show detailed suggestions
     */

    if (commandIndex === -1) return null;

    // The command runs to the cursor, plus the rest of a reference being
    // edited in the middle ("/b John 3:1|6"). Text after it, such as the
    // closing bracket of "(/b John 3:16)", stays in the note.
    const end = cursor.ch + (REFERENCE_CONTINUATION.exec(line.slice(cursor.ch))?.[0].length ?? 0);
    const afterCommand = line.slice(commandIndex + TRIGGER.length, end);
    // Show suggestions if there's any text after "/b "
    if (afterCommand.length > 0) {
      return {
        start: {
          ch: commandIndex, // Start from the /b
          line: cursor.line,
        },
        end: {
          ch: end,
          line: cursor.line,
        },
        query: afterCommand.trim(), // Trim to handle the space case
      };
    }

    return null;
  }

  getSuggestions(context: EditorSuggestContext): BibleSuggestion[] {
    const suggestions = this.buildSuggestions(context);
    if (this.shown) this.shown.hasSuggestions = suggestions.length > 0;
    return suggestions;
  }

  private buildSuggestions(context: EditorSuggestContext): BibleSuggestion[] {
    const query = context.query;

    // The query is the text after "/b ", so the command is read from the line
    const isExplicitMode = isCommandContext(context);

    // If query is empty (just typed "/b "), show a simple typing message without the {text} placeholder
    if (query.length === 0 && isExplicitMode) {
      return [
        {
          text: query,
          command: 'link',
          description: this.t('suggestions.typingEmpty'),
        },
      ];
    }

    // Silent mode: use generic regex to avoid false positives
    if (
      !isExplicitMode &&
      !query.match(BIBLE_REFERENCE_REGEX) &&
      !query.match(this.getBookRegex())
    ) {
      return [];
    }

    // Try parsing the reference directly — this handles all book name formats
    // including multi-word, hyphenated, and digit-suffixed names
    let reference: BibleReference;

    try {
      reference = parseBibleReference(query, this.plugin.settings.language);
    } catch (error: unknown) {
      // Expected while the reference is still being typed ("/b J", "/b Jo")
      logger.debug(error instanceof Error ? error.message : String(error));

      if (!isExplicitMode) return [];

      return [
        {
          text: query,
          command: 'typing',
          description: this.t('suggestions.typing', { text: query }),
        },
      ];
    }

    const formattedText = formatBibleText(
      reference,
      this.plugin.settings.bookLength,
      this.plugin.settings.language,
    );

    const links = formatJWLibraryLink(reference, this.plugin.settings.language);
    const hasMultipleLinks = Array.isArray(links) && links.length > 1;

    const suggestions: BibleSuggestion[] = [
      {
        text: query,
        command: 'link',
        description: hasMultipleLinks
          ? this.t('suggestions.createLinks', { text: formattedText })
          : this.t('suggestions.createLink', { text: formattedText }),
      },
    ];

    // If there are multiple links, add individual open options
    if (hasMultipleLinks) {
      suggestions.push({
        text: query,
        command: 'open',
        description: this.t('suggestions.createMultipleAndOpenFirst', { text: formattedText }),
      });
    } else {
      suggestions.push({
        text: query,
        command: 'open',
        description: this.t('suggestions.createAndOpen', { text: formattedText }),
      });
    }
    if (this.plugin.settings.openAutomatically) {
      //Move the create and open suggestion to the top
      suggestions.unshift(suggestions.pop()!);
    }

    return suggestions;
  }

  renderSuggestion(suggestion: BibleSuggestion, el: HTMLElement): void {
    el.setText(suggestion.description);
  }

  selectSuggestion(suggestion: BibleSuggestion): void {
    if (!this.context) return;

    const { context } = this;
    const editor = context.editor;

    const reference = parseBibleReference(suggestion.text, this.plugin.settings.language);
    const linkLanguage = this.plugin.settings.noLanguageParameter
      ? undefined
      : this.plugin.settings.language;

    // Convert the Bible reference to a link
    const convertedLink = convertBibleTextToMarkdownLink(reference, this.plugin.settings);

    if (suggestion.command === 'typing' || !convertedLink) {
      return;
    }

    // Replace the entire command and reference with the converted link
    editor.replaceRange(convertedLink, context.start, context.end);

    // Force close the suggestion box to prevent it from staying open with italic formatting
    this.selecting = true;
    try {
      this.close();
    } finally {
      this.selecting = false;
    }

    // Handle opening links
    if (suggestion.command === 'open') {
      const url = formatJWLibraryLink(reference, linkLanguage);
      if (Array.isArray(url)) {
        // For open-specific, open the specified link, otherwise open first
        window.open(url[suggestion.linkIndex || 0]);
      } else {
        window.open(url);
      }
    }
  }
}
