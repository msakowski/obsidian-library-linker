import {
  Editor,
  EditorPosition,
  EditorSuggest,
  EditorSuggestContext,
  EditorSuggestTriggerInfo,
} from 'obsidian';
import type { BibleReference, BibleSuggestion } from '@/types';
import { formatBibleText } from '@/utils/formatBibleText';
import { parseBibleReference } from '@/utils/parseBibleReference';
import { formatJWLibraryLink } from '@/utils/formatJWLibraryLink';
import { TranslationService } from '@/services/TranslationService';
import { convertBibleTextToMarkdownLink } from '@/utils/convertBibleTextToMarkdownLink';
import type JWLibraryLinkerPlugin from '@/main';
import { bibleReferenceRegex } from '@/utils/bibleReferenceRegex';

export class BibleReferenceSuggester extends EditorSuggest<BibleSuggestion> {
  plugin: JWLibraryLinkerPlugin;
  private t = TranslationService.getInstance().t.bind(TranslationService.getInstance());

  constructor(plugin: JWLibraryLinkerPlugin) {
    super(plugin.app);
    this.plugin = plugin;
  }

  onTrigger(cursor: EditorPosition, editor: Editor): EditorSuggestTriggerInfo | null {
    const line = editor.getLine(cursor.line);
    const subString = line.substring(0, cursor.ch);

    // Find position of /b
    const commandIndex = subString.lastIndexOf('/b');
    if (commandIndex === -1) return null;

    // Get the text after /b
    const afterCommand = subString.slice(commandIndex + 2);

    // Show suggestions immediately after "/b " or if there's any text after "/b"
    if (afterCommand.startsWith(' ') || afterCommand.length > 0) {
      return {
        start: {
          ch: commandIndex, // Start from the /b
          line: cursor.line,
        },
        end: cursor,
        query: afterCommand.trim(), // Trim to handle the space case
      };
    }

    return null;
  }

  getSuggestions(context: EditorSuggestContext): BibleSuggestion[] {
    const query = context.query;

    // If query is empty (just typed "/b "), show a simple typing message without the {text} placeholder
    if (query.length === 0) {
      return [
        {
          text: query,
          command: 'link',
          description: this.t('suggestions.typingEmpty'),
        },
      ];
    }

    // If it's a complete reference, parse and show detailed suggestions
    if (query.match(bibleReferenceRegex)) {
      let reference: BibleReference | null = null;

      try {
        reference = parseBibleReference(query, this.plugin.settings.language);
      } catch (error) {
        console.debug(error);
        return [
          {
            text: query,
            command: 'typing',
            description: this.t('suggestions.typing', { text: query }),
          },
        ];
      }

      if (!reference) {
        return [];
      }

      const formattedText = formatBibleText(
        reference,
        this.plugin.settings.useShortNames,
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
        const verseRanges = reference.verseRanges!.map(({ start, end }) =>
          start === end ? start.toString() : `${start}-${end}`,
        );

        verseRanges.forEach((range, i) => {
          suggestions.push({
            text: query,
            command: 'open',
            description: this.t('suggestions.createAndOpenVerse', { verse: range }),
            linkIndex: i,
          });
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
    // For any other text after /b, show a typing suggestion with the text
    else {
      return [
        {
          text: query,
          command: 'typing',
          description: this.t('suggestions.typing', { text: query }),
        },
      ];
    }
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
