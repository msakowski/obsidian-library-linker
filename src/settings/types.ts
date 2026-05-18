import type { App } from 'obsidian';
import type JWLibraryLinkerPlugin from '@/main';

export interface SettingsTabContext {
  plugin: JWLibraryLinkerPlugin;
  t: (key: string, variables?: Record<string, string>) => string;
  app: App;
  containerEl: HTMLElement;
  importInFlight: boolean;
  display(): void;
  updatePreview(): void;
  updateBibleQuotePreview(): void;
}
