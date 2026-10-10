import { setIcon } from 'obsidian';
import type { BibleReference, Language, LinkReplacerSettings } from '@/types';
import {
  isBibleFinderHref,
  parseVerseFinderHref,
  resolveCitationLanguage,
} from '@/utils/jwLibraryUrl';
import { VERSE_CARD_CLASS } from './VerseCard';
import type { TranslateFn } from './verseCardContent';

export const VERSE_CHEVRON_CLASS = 'jwll-verse-chevron';

export interface VerseLinkDecoratorOptions {
  settings: LinkReplacerSettings;
  t: TranslateFn;
  onToggle: (anchor: HTMLElement, reference: BibleReference, language: Language) => void;
  /** When false, existing chevrons and their dataset markers are removed and nothing is added. */
  enabled: boolean;
}

function isDecorated(anchor: HTMLElement): boolean {
  const next = anchor.nextElementSibling;
  return next instanceof HTMLElement && next.classList.contains(VERSE_CHEVRON_CLASS);
}

/**
 * Remove every chevron and verse dataset marker under `root`.
 *
 * Only our own nodes are touched: the anchors themselves keep their content and attributes
 * (their click handling belongs to Obsidian), so this always leaves a clean, untouched view.
 */
export function removeVerseDecorations(root: ParentNode): void {
  for (const chevron of Array.from(root.querySelectorAll<HTMLElement>(`.${VERSE_CHEVRON_CLASS}`))) {
    chevron.remove();
  }
  for (const anchor of Array.from(
    root.querySelectorAll<HTMLElement>('a[data-jwll-verse-chevron]'),
  )) {
    delete anchor.dataset.jwllVerseChevron;
  }
}

function createChevron(
  anchor: HTMLElement,
  options: VerseLinkDecoratorOptions,
  reference: BibleReference,
  language: Language,
): HTMLElement {
  const chevron = anchor.ownerDocument.createElement('span');
  chevron.className = VERSE_CHEVRON_CLASS;
  chevron.dataset.jwllVerseChevron = 'true';
  chevron.setAttribute('role', 'button');
  chevron.setAttribute('tabindex', '0');
  chevron.setAttribute('aria-label', options.t('card.toggleLabel'));
  setIcon(chevron, 'chevron-down');

  const toggle = (event: Event): void => {
    event.preventDefault();
    event.stopPropagation();
    options.onToggle(anchor, reference, language);
  };

  chevron.addEventListener('click', toggle);
  chevron.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      toggle(event);
    }
  });

  return chevron;
}

/**
 * Add the toggle chevron next to every valid verse link under `root`.
 *
 * The anchor itself is never touched: neither its content nor its attributes change, so its
 * own click handling (opening JW Library) stays entirely with Obsidian. The chevron is
 * inserted as a sibling and prevents default only on itself.
 *
 * With `enabled` false the verse card is switched off, so any chevron and dataset marker
 * already present under `root` is removed and nothing is added.
 */
export function decorateVerseLinks(root: HTMLElement, options: VerseLinkDecoratorOptions): void {
  if (!options.enabled) {
    removeVerseDecorations(root);
    return;
  }

  const anchors = root.querySelectorAll<HTMLAnchorElement>('a[href^="jwlibrary://"]');

  for (const anchor of Array.from(anchors)) {
    if (anchor.closest(`.${VERSE_CARD_CLASS}`)) continue;

    const href = anchor.getAttribute('href');
    if (!href || !isBibleFinderHref(href)) continue;

    const reference = parseVerseFinderHref(href);
    if (!reference || isDecorated(anchor)) continue;

    const language = resolveCitationLanguage(href, options.settings.language);
    anchor.after(createChevron(anchor, options, reference, language));
  }
}
