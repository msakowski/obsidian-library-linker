import type JWLibraryLinkerPlugin from '@/main';
import type { BibleCitationResult, BibleReference, Language } from '@/types';
import { BIBLE_QUOTE_TEMPLATES } from '@/types';
import { logger } from '@/utils/logger';
import { verseCard } from './VerseCard';
import { buildVerseCardContent, type TranslateFn } from './verseCardContent';
import { decorateVerseLinks, removeVerseDecorations } from './verseLinkDecorator';

/** Monotonic id of the newest card request; stale answers are dropped. */
let activeRequest = 0;

/** Set while the plugin is loaded; lets `refreshVerseLinks` reach the live decoration state. */
let refreshHandler: (() => void) | null = null;

/**
 * Re-apply the verse-card decoration to every rendered note.
 *
 * Called when the quote preset changes, because an already rendered note would otherwise keep
 * the chevrons of the previous preset. Safe to call at any time: it only removes and re-adds
 * our own chevrons and dataset markers, never the note text or the anchors.
 */
export function refreshVerseLinks(): void {
  refreshHandler?.();
}

/**
 * Wire the verse card into the plugin: one markdown post processor, dismiss listeners, and
 * the card singleton. Everything is unregistered on plugin unload.
 */
export function registerVerseCard(plugin: JWLibraryLinkerPlugin): void {
  activeRequest = 0;

  const t: TranslateFn = (key, variables) => plugin.getTranslationService().t(key, variables);

  /** The card is active only while its exact preset is the selected quote template. */
  const isCardPresetActive = (): boolean =>
    plugin.settings.bibleQuote.template === BIBLE_QUOTE_TEMPLATES.card;

  const loadCitation = async (
    reference: BibleReference,
    language: Language,
  ): Promise<BibleCitationResult> => {
    try {
      return await plugin.getBibleCitationProvider().getCitation(reference, language);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Verse card: citation lookup failed', message);
      return { success: false, source: 'online', text: '', citation: '', error: message };
    }
  };

  const toggleCard = (anchor: HTMLElement, reference: BibleReference, language: Language): void => {
    if (verseCard.isAnchoredTo(anchor) && verseCard.isOpen()) {
      verseCard.close();
      activeRequest += 1;
      return;
    }

    const requestId = (activeRequest += 1);
    verseCard.open(
      anchor,
      buildVerseCardContent({
        reference,
        result: null,
        settings: plugin.settings,
        language,
        t,
      }),
    );

    void loadCitation(reference, language).then((result) => {
      if (requestId !== activeRequest || !verseCard.isAnchoredTo(anchor)) return;
      verseCard.update(
        buildVerseCardContent({ reference, result, settings: plugin.settings, language, t }),
      );
    });
  };

  plugin.registerMarkdownPostProcessor((element) => {
    decorateVerseLinks(element, {
      settings: plugin.settings,
      t,
      onToggle: toggleCard,
      enabled: isCardPresetActive(),
    });
  });

  plugin.registerDomEvent(document, 'click', (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (verseCard.isOpen() && !verseCard.containsNode(target)) {
      verseCard.close();
    }
  });

  plugin.registerDomEvent(document, 'keydown', (event) => {
    if (event.key === 'Escape' && verseCard.isOpen()) {
      verseCard.close();
    }
  });

  const refresh = (): void => {
    activeRequest += 1;
    verseCard.close();
    removeVerseDecorations(document);
    if (!isCardPresetActive()) return;

    const roots = document.querySelectorAll<HTMLElement>('.markdown-rendered');
    for (const root of Array.from(roots)) {
      decorateVerseLinks(root, {
        settings: plugin.settings,
        t,
        onToggle: toggleCard,
        enabled: true,
      });
    }
  };

  refreshHandler = refresh;

  plugin.register(() => {
    refreshHandler = null;
    verseCard.close();
  });
}
