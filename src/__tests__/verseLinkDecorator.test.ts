import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { BibleReference, Language } from '@/types';
import { VERSE_CARD_CLASS, verseCard } from '@/ui/VerseCard';
import { VERSE_CHEVRON_CLASS, decorateVerseLinks } from '@/ui/verseLinkDecorator';
import { createSettings } from './__helpers__/createSettings';

type ToggleFn = (anchor: HTMLElement, reference: BibleReference, language: Language) => void;

const SHARE_LINK =
  'jwlibrary:///finder?srcid=jwlshare&wtlocale=K&prefer=lang&pub=nwtsty&bible=43003010';
const SHARE_RANGE_LINK =
  'jwlibrary:///finder?srcid=jwlshare&wtlocale=K&prefer=lang&pub=nwtsty&bible=40024003-40024014';

const t = (key: string): string => `T:${key}`;
const settings = createSettings();

function appendAnchor(href: string, text: string): HTMLAnchorElement {
  const anchor = document.createElement('a');
  anchor.setAttribute('href', href);
  anchor.textContent = text;
  document.body.appendChild(anchor);
  return anchor;
}

function makeOptions(onToggle: ToggleFn = vi.fn<ToggleFn>(), enabled = true) {
  return { settings, t, onToggle, enabled };
}

function chevrons(): NodeListOf<Element> {
  return document.querySelectorAll(`.${VERSE_CHEVRON_CLASS}`);
}

beforeEach(() => {
  document.body.innerHTML = '';
});

afterEach(() => {
  verseCard.close();
  document.body.innerHTML = '';
});

describe('decorateVerseLinks', () => {
  test('adds exactly one chevron and stays idempotent', () => {
    const anchor = appendAnchor(SHARE_LINK, 'Івана 3:10');
    const options = makeOptions();

    decorateVerseLinks(document.body, options);
    expect(chevrons()).toHaveLength(1);
    expect(anchor.nextElementSibling?.classList.contains(VERSE_CHEVRON_CLASS)).toBe(true);
    expect(anchor.nextElementSibling?.getAttribute('data-jwll-verse-chevron')).toBe('true');

    decorateVerseLinks(document.body, options);
    expect(chevrons()).toHaveLength(1);
  });

  test('does not touch the anchor content or attributes', () => {
    const anchor = appendAnchor(SHARE_LINK, 'Івана 3:10');
    const before = anchor.outerHTML;
    const attributeCount = anchor.attributes.length;

    decorateVerseLinks(document.body, makeOptions());

    expect(anchor.outerHTML).toBe(before);
    expect(anchor.attributes.length).toBe(attributeCount);
    expect(anchor.hasAttribute('data-jwll-verse-chevron')).toBe(false);
    expect(chevrons()).toHaveLength(1);
  });

  test('ignores non-finder links and unparseable codes', () => {
    appendAnchor('jwlibrary:///publication?pub=nwtsty', 'publication');
    appendAnchor('https://www.jw.org', 'web');
    appendAnchor('jwlibrary:///finder?wtlocale=K', 'no bible');
    appendAnchor('jwlibrary:///finder?bible=4300301', 'short code');

    decorateVerseLinks(document.body, makeOptions());

    expect(chevrons()).toHaveLength(0);
  });

  test('exposes an accessible toggle and opens on click', () => {
    const anchor = appendAnchor(SHARE_LINK, 'Івана 3:10');
    const options = makeOptions();

    decorateVerseLinks(document.body, options);

    const chevron = document.querySelector<HTMLElement>(`.${VERSE_CHEVRON_CLASS}`);
    expect(chevron?.getAttribute('role')).toBe('button');
    expect(chevron?.getAttribute('tabindex')).toBe('0');
    expect(chevron?.getAttribute('aria-label')).toBe('T:card.toggleLabel');

    chevron?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(options.onToggle).toHaveBeenCalledTimes(1);
    expect(options.onToggle).toHaveBeenCalledWith(
      anchor,
      { book: 43, chapter: 3, verseRanges: [{ start: 10, end: 10 }] },
      'K',
    );

    chevron?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(options.onToggle).toHaveBeenCalledTimes(2);
  });

  test('resolves the citation language from the range link', () => {
    appendAnchor(SHARE_RANGE_LINK, 'Матвія 24:3-14');
    const options = makeOptions();

    decorateVerseLinks(document.body, options);
    document
      .querySelector<HTMLElement>(`.${VERSE_CHEVRON_CLASS}`)
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(options.onToggle).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      { book: 40, chapter: 24, verseRanges: [{ start: 3, end: 14 }] },
      'K',
    );
  });

  test('adds nothing when disabled and clears what is already there', () => {
    const anchor = appendAnchor(SHARE_LINK, 'Івана 3:10');
    decorateVerseLinks(document.body, makeOptions());
    expect(chevrons()).toHaveLength(1);

    decorateVerseLinks(document.body, makeOptions(vi.fn<ToggleFn>(), false));
    expect(chevrons()).toHaveLength(0);
    expect(anchor.nextElementSibling).toBeNull();
    expect(document.querySelector('[data-jwll-verse-chevron]')).toBeNull();
  });

  test('never decorates while the verse card is switched off', () => {
    appendAnchor(SHARE_LINK, 'Івана 3:10');
    decorateVerseLinks(document.body, makeOptions(vi.fn<ToggleFn>(), false));
    expect(chevrons()).toHaveLength(0);
  });

  test('leaves a click on the link text alone', () => {
    const anchor = appendAnchor(SHARE_LINK, 'Івана 3:10');
    const options = makeOptions();

    decorateVerseLinks(document.body, options);

    // jsdom cannot navigate to a custom scheme, so the document-level observer records
    // whether anything cancelled the click and then cancels it itself to keep the run quiet.
    let defaultPrevented: boolean | null = null;
    const observer = (event: MouseEvent): void => {
      defaultPrevented = event.defaultPrevented;
      event.preventDefault();
    };
    document.addEventListener('click', observer);
    anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    document.removeEventListener('click', observer);

    expect(defaultPrevented).toBe(false);
    expect(options.onToggle).not.toHaveBeenCalled();
  });
});

describe('verseCard', () => {
  test('renders plain text with no buttons, updates and closes', () => {
    const anchor = appendAnchor(SHARE_LINK, 'Івана 3:10');

    verseCard.open(anchor, {
      heading: 'John 3:10',
      source: 'T:card.sourceOnline',
      body: 'Line one\nLine two',
      state: 'ready',
    });

    const card = document.querySelector<HTMLElement>(`.${VERSE_CARD_CLASS}`);
    expect(card).not.toBeNull();
    expect(card?.textContent).toContain('John 3:10');
    expect(card?.querySelector('button')).toBeNull();
    expect(card?.querySelector('.jwll-verse-card-body')?.textContent).toBe('Line one\nLine two');
    expect(card?.textContent).not.toContain('jwlibrary://');
    expect(verseCard.isAnchoredTo(anchor)).toBe(true);

    verseCard.update({
      heading: 'John 3:10',
      source: '',
      body: 'T:card.unavailable',
      state: 'unavailable',
    });
    expect(card?.querySelector('.jwll-verse-card-body')?.textContent).toBe('T:card.unavailable');

    verseCard.close();
    expect(document.querySelector(`.${VERSE_CARD_CLASS}`)).toBeNull();
    expect(verseCard.isOpen()).toBe(false);
  });
});
