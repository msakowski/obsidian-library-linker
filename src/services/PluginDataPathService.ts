import { FileSystemAdapter, Platform, type App } from 'obsidian';

function joinPath(...segments: string[]): string {
  if (!Platform.isDesktop) {
    throw new Error('Node.js APIs are not available on mobile');
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- dynamic require for desktop-only Node.js API
  const { join } = require('path') as typeof import('path');
  return join(...segments);
}

function getPluginDataPath(app: App, pluginId: string): string {
  const adapter = app.vault.adapter;

  if (!(adapter instanceof FileSystemAdapter)) {
    throw new Error('Offline Bible storage requires the desktop file system adapter.');
  }

  return joinPath(adapter.getBasePath(), app.vault.configDir, 'plugins', pluginId);
}

export function getOfflineBibleRootPath(app: App, pluginId: string): string {
  return joinPath(getPluginDataPath(app, pluginId), 'offline-bible');
}
