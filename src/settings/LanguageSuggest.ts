import { AbstractInputSuggest, App } from 'obsidian';
import type { Language } from '@/types';
import { LANGUAGE_ARRAY } from '@/consts/languages';

export class LanguageSuggest extends AbstractInputSuggest<Language> {
  constructor(
    app: App,
    inputEl: HTMLInputElement,
    private onSelectCb: (value: Language) => void,
  ) {
    super(app, inputEl);
  }

  getSuggestions(query: string): Language[] {
    const lower = query.toLocaleLowerCase();
    return LANGUAGE_ARRAY.filter(
      ({ code, name, vernacular }) =>
        code.toLocaleLowerCase().contains(lower) ||
        name.toLocaleLowerCase().contains(lower) ||
        vernacular.toLocaleLowerCase().contains(lower),
    ).map(({ code }) => code);
  }

  renderSuggestion(lang: Language, el: HTMLElement): void {
    const info = LANGUAGE_ARRAY.find(({ code }) => code === lang);
    el.setText(info ? `${info.vernacular} (${lang})` : lang);
  }

  selectSuggestion(lang: Language, _evt: MouseEvent | KeyboardEvent): void {
    this.onSelectCb(lang);
    this.close();
  }
}
