import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type JWLibraryLinkerPlugin from '@/main';
import { BIBLE_QUOTE_TEMPLATES, type LinkReplacerSettings } from '@/types';
import { VERSE_CARD_CLASS, verseCard } from '@/ui/VerseCard';
import { VERSE_CHEVRON_CLASS } from '@/ui/verseLinkDecorator';
import { refreshVerseLinks, registerVerseCard } from '@/ui/registerVerseCard';
import { createSettings } from './__helpers__/createSettings';

const SHARE_LINK =
  'jwlibrary:///finder?srcid=jwlshare&wtlocale=K&prefer=lang&pub=nwtsty&bible=43003010';

type PostProcessor = (element: HTMLElement) => void;

interface FakePlugin {
  settings: LinkReplacerSettings;
  postProcessors: PostProcessor[];
  registered: Array<() => void>;
  plugin: JWLibraryLinkerPlugin;
}

function makePlugin(template: string): FakePlugin {
  const settings = createSettings({ bibleQuote: { template } });
  const postProcessors: PostProcessor[] = [];
  const registered: Array<() => void> = [];

  const plugin = {
    settings,
    registerMarkdownPostProcessor: (callback: PostProcessor) => {
      postProcessors.push(callback);
    },
    registerDomEvent: () => undefined,
    register: (callback: () => void) => {
      registered.push(callback);
    },
    getTranslationService: () => ({ t: (key: string) => `T:${key}` }),
    getBibleCitationProvider: () => ({ getCitation: vi.fn() }),
  } as unknown as JWLibraryLinkerPlugin;

  return { settings, postProcessors, registered, plugin };
}

function makeRoot(): { root: HTMLElement; anchor: HTMLAnchorElement } {
  const root = document.createElement('div');
  root.className = 'markdown-rendered';
  const anchor = document.createElement('a');
  anchor.setAttribute('href', SHARE_LINK);
  anchor.textContent = 'Івана 3:10';
  root.appendChild(anchor);
  document.body.appendChild(root);
  return { root, anchor };
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

describe('BIBLE_QUOTE_TEMPLATES.card', () => {
  test('is the plain reference plus the verse text, with no link and no blockquote marker', () => {
    expect(BIBLE_QUOTE_TEMPLATES.card).toBe('{bibleRef}\n\n{quote}');
  });
});

describe('registerVerseCard preset gate', () => {
  test('decorates only while the card preset is the selected template', () => {
    const fake = makePlugin(BIBLE_QUOTE_TEMPLATES.card);
    registerVerseCard(fake.plugin);

    const { root } = makeRoot();
    fake.postProcessors[0]?.(root);

    expect(chevrons()).toHaveLength(1);
  });

  test.each([
    BIBLE_QUOTE_TEMPLATES.short,
    BIBLE_QUOTE_TEMPLATES.plain,
    BIBLE_QUOTE_TEMPLATES.foldable,
    BIBLE_QUOTE_TEMPLATES.expanded,
    '{quote}',
  ])('adds nothing for the "%s" template', (template) => {
    const fake = makePlugin(template);
    registerVerseCard(fake.plugin);

    const { root } = makeRoot();
    fake.postProcessors[0]?.(root);

    expect(chevrons()).toHaveLength(0);
  });
});

describe('refreshVerseLinks', () => {
  test('clears chevrons when the preset is switched off and restores them when it is on', () => {
    const fake = makePlugin(BIBLE_QUOTE_TEMPLATES.card);
    registerVerseCard(fake.plugin);
    makeRoot();

    refreshVerseLinks();
    expect(chevrons()).toHaveLength(1);

    fake.settings.bibleQuote.template = BIBLE_QUOTE_TEMPLATES.expanded;
    refreshVerseLinks();
    expect(chevrons()).toHaveLength(0);
    expect(document.querySelector('[data-jwll-verse-chevron]')).toBeNull();

    fake.settings.bibleQuote.template = BIBLE_QUOTE_TEMPLATES.card;
    refreshVerseLinks();
    expect(chevrons()).toHaveLength(1);
  });

  test('closes the open card when the preset is switched off', () => {
    const fake = makePlugin(BIBLE_QUOTE_TEMPLATES.card);
    registerVerseCard(fake.plugin);
    const { anchor } = makeRoot();

    verseCard.open(anchor, { heading: 'H', source: '', body: 'B', state: 'ready' });
    expect(verseCard.isOpen()).toBe(true);

    fake.settings.bibleQuote.template = BIBLE_QUOTE_TEMPLATES.short;
    refreshVerseLinks();

    expect(verseCard.isOpen()).toBe(false);
    expect(document.querySelector(`.${VERSE_CARD_CLASS}`)).toBeNull();
  });

  test('stops refreshing once the plugin unloads', () => {
    const fake = makePlugin(BIBLE_QUOTE_TEMPLATES.card);
    registerVerseCard(fake.plugin);
    makeRoot();

    refreshVerseLinks();
    expect(chevrons()).toHaveLength(1);

    for (const dispose of fake.registered) dispose();

    expect(() => refreshVerseLinks()).not.toThrow();
    expect(chevrons()).toHaveLength(1);
  });
});
