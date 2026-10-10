import type { VerseCardContentView } from './verseCardContent';

export const VERSE_CARD_CLASS = 'jwll-verse-card';
const HEADING_CLASS = 'jwll-verse-card-heading';
const SOURCE_CLASS = 'jwll-verse-card-source';
const BODY_CLASS = 'jwll-verse-card-body';
const MESSAGE_CLASS = 'jwll-verse-card-message';

const VIEWPORT_MARGIN = 8;
const ANCHOR_GAP = 6;

function appendTextElement(
  doc: Document,
  parent: HTMLElement,
  tag: 'div' | 'span',
  className: string,
  text: string,
): HTMLElement {
  const el = doc.createElement(tag);
  el.className = className;
  el.textContent = text;
  parent.appendChild(el);
  return el;
}

/**
 * Single floating verse card. It is anchored to the chevron's link, sized and placed with
 * fixed positioning, and rendered through `textContent` only (never markup).
 */
export class VerseCard {
  private element: HTMLElement | null = null;
  private anchor: HTMLElement | null = null;

  isOpen(): boolean {
    return this.element !== null;
  }

  isAnchoredTo(anchor: HTMLElement): boolean {
    return this.anchor === anchor;
  }

  containsNode(node: Node): boolean {
    return this.element?.contains(node) ?? false;
  }

  open(anchor: HTMLElement, view: VerseCardContentView): void {
    const doc = anchor.ownerDocument;
    if (this.element?.ownerDocument !== doc) {
      this.element?.remove();
      const element = doc.createElement('div');
      element.className = VERSE_CARD_CLASS;
      element.setAttribute('role', 'dialog');
      doc.body.appendChild(element);
      this.element = element;
    }

    this.anchor = anchor;
    this.render(view);
    this.position();
  }

  update(view: VerseCardContentView): void {
    if (!this.element) return;
    this.render(view);
    this.position();
  }

  close(): void {
    this.element?.remove();
    this.element = null;
    this.anchor = null;
  }

  private render(view: VerseCardContentView): void {
    const el = this.element;
    if (!el) return;

    const doc = el.ownerDocument;
    el.textContent = '';

    if (view.heading) {
      appendTextElement(doc, el, 'span', HEADING_CLASS, view.heading);
    }
    if (view.source) {
      appendTextElement(doc, el, 'span', SOURCE_CLASS, view.source);
    }

    const body = appendTextElement(doc, el, 'div', BODY_CLASS, view.body);
    if (view.state !== 'ready') {
      body.classList.add(MESSAGE_CLASS);
    }
  }

  /** Place the card under the anchor, flipping above it when there is no room below. */
  private position(): void {
    const el = this.element;
    const anchor = this.anchor;
    if (!el || !anchor || !anchor.isConnected) return;

    const win = el.ownerDocument.defaultView;
    if (!win) return;

    const anchorRect = anchor.getBoundingClientRect();

    el.style.maxHeight = '';
    const cardRect = el.getBoundingClientRect();

    const spaceBelow = win.innerHeight - anchorRect.bottom - ANCHOR_GAP - VIEWPORT_MARGIN;
    const spaceAbove = anchorRect.top - ANCHOR_GAP - VIEWPORT_MARGIN;
    const available = Math.max(0, cardRect.height);

    const placeAbove = spaceBelow < available && spaceAbove > spaceBelow;
    const usable = Math.max(0, placeAbove ? spaceAbove : spaceBelow);

    const left = Math.max(
      VIEWPORT_MARGIN,
      Math.min(anchorRect.left, win.innerWidth - VIEWPORT_MARGIN - cardRect.width),
    );
    el.style.left = `${Math.round(left)}px`;

    const top = placeAbove
      ? anchorRect.top - ANCHOR_GAP - Math.min(available, usable)
      : anchorRect.bottom + ANCHOR_GAP;
    el.style.top = `${Math.round(top)}px`;

    if (available > usable) {
      el.style.maxHeight = `${Math.round(usable)}px`;
    }
  }
}

export const verseCard = new VerseCard();
