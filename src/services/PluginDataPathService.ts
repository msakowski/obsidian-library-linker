import { FileSystemAdapter, Platform, type App } from 'obsidian';

function joinPath(...segments: string[]): string {
  if (!Platform.isDesktop) {
    throw new Error('Node.js APIs are not available on mobile');
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- dynamic require for desktop-only Node.js API
  const { join } = require('path') as typeof import('path');
  return join(...segments);
}

export function getOfflineBibleVaultPath(app: App, pluginId: string): string {
  return `${app.vault.configDir}/plugins/${pluginId}/offline-bible`;
}

export function getOfflineBibleAbsolutePath(app: App, pluginId: string): string {
  const adapter = app.vault.adapter;
  if (!(adapter instanceof FileSystemAdapter)) {
    throw new Error('Absolute path is only available on the desktop file system adapter.');
  }
  return joinPath(adapter.getBasePath(), getOfflineBibleVaultPath(app, pluginId));
}
