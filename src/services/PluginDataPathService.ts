import { FileSystemAdapter, type App } from 'obsidian';

function joinPath(...segments: string[]): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
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
