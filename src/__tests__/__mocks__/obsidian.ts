export class App {
  vault = {
    adapter: new FileSystemAdapter(),
    configDir: '.obsidian',
  };
  constructor() {}
}

export class Plugin {
  manifest = { id: 'jw-library-linker' };
  app = new App();
  constructor() {}
  addChild(component: Component) {}
  removeChild(component: Component) {}
  addCommand() {}
  addSettingTab() {}
  registerEditorSuggest() {}
  registerEvent() {}
  loadData() {
    return Promise.resolve({});
  }
  saveData() {
    return Promise.resolve();
  }
  onload() {}
  onunload() {}
}

export class PluginSettingTab {
  containerEl = document.createElement('div');
  app: App;
  plugin: Plugin;
  constructor(app: App, plugin: Plugin) {
    this.app = app;
    this.plugin = plugin;
  }
}
export class Editor {}
export class EditorPosition {}
export class EditorSuggest {}
export class MarkdownView {}
export class TFile {}
export class Notice {
  constructor(public message?: string) {}
}
export class Menu {
  addItem(
    callback: (item: {
      setTitle: () => unknown;
      setIcon: () => unknown;
      onClick: () => unknown;
    }) => void,
  ) {
    callback({
      setTitle: () => this,
      setIcon: () => this,
      onClick: () => this,
    });
  }
}
export class Setting {
  constructor(public containerEl: HTMLElement) {}
  setName() {
    return this;
  }
  setDesc() {
    return this;
  }
  setClass() {
    return this;
  }
  addDropdown(
    callback: (component: {
      addOptions: () => unknown;
      setValue: () => unknown;
      onChange: () => unknown;
    }) => void,
  ) {
    callback({
      addOptions: () => this,
      setValue: () => this,
      onChange: () => this,
    });
    return this;
  }
  addToggle(
    callback: (component: {
      setValue: () => unknown;
      setDisabled: () => unknown;
      onChange: () => unknown;
    }) => void,
  ) {
    callback({
      setValue: () => this,
      setDisabled: () => this,
      onChange: () => this,
    });
    return this;
  }
  addText(callback: (component: { setValue: () => unknown; onChange: () => unknown }) => void) {
    callback({
      setValue: () => this,
      onChange: () => this,
    });
    return this;
  }
  addTextArea(
    callback: (component: {
      setValue: () => unknown;
      setPlaceholder: () => unknown;
      onChange: () => unknown;
      inputEl: HTMLTextAreaElement;
    }) => void,
  ) {
    callback({
      setValue: () => this,
      setPlaceholder: () => this,
      onChange: () => this,
      inputEl: document.createElement('textarea'),
    });
    return this;
  }
  addButton(
    callback: (component: {
      setButtonText: () => unknown;
      setCta: () => unknown;
      setDisabled: () => unknown;
      onClick: () => unknown;
    }) => void,
  ) {
    callback({
      setButtonText: () => this,
      setCta: () => this,
      setDisabled: () => this,
      onClick: () => this,
    });
    return this;
  }
  addExtraButton(
    callback: (component: {
      setIcon: () => unknown;
      setTooltip: () => unknown;
      onClick: () => unknown;
    }) => void,
  ) {
    callback({
      setIcon: () => this,
      setTooltip: () => this,
      onClick: () => this,
    });
    return this;
  }
}
export class FileSystemAdapter {
  getBasePath() {
    return '/tmp';
  }
}

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

// Mock request function (older API, returns string directly)
export const request = jest.fn();

// Mock Platform
export const Platform = {
  isMobileApp: true,
  isDesktopApp: false,
};

// Add any other Obsidian classes/types you need to mock
