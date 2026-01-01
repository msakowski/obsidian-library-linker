export class App {
  constructor() {}
}

export class Plugin {
  constructor() {}
  addChild(component: Component) {}
  removeChild(component: Component) {}
  onload() {}
  onunload() {}
}

export class PluginSettingTab {}
export class Editor {}
export class EditorPosition {}
export class EditorSuggest {}
export class MarkdownView {}
export class TFile {}
export class Notice {}

export class FuzzySuggestModal<T> {
  constructor() {}
  open() {}
  close() {}
  onChooseItem(item: T, evt: MouseEvent | KeyboardEvent) {}
  getItems(): T[] {
    return [];
  }
  getItemText(item: T): string {
    return String(item);
  }
  onChooseSuggestion(value: T, evt: MouseEvent | KeyboardEvent) {}
}

export class Component {
  constructor() {}
  addChild(component: Component) {}
  removeChild(component: Component) {}
  onload() {}
  onunload() {}
}

export class MarkdownRenderer {
  static render(
    app: App,
    markdown: string,
    container: HTMLElement,
    sourcePath: string,
    component: Component,
  ) {
    return Promise.resolve();
  }
}

// Mock requestUrl function
export const requestUrl = jest.fn();

// Add any other Obsidian classes/types you need to mock
