import { FileSystemAdapter, type App } from 'obsidian';
import { join } from 'path';

export function getPluginDataPath(app: App, pluginId: string): string {
  const adapter = app.vault.adapter;

  if (!(adapter instanceof FileSystemAdapter)) {
    throw new Error('Offline Bible storage requires the desktop file system adapter.');
  }

  return join(adapter.getBasePath(), app.vault.configDir, 'plugins', pluginId);
}

export function getOfflineBibleRootPath(app: App, pluginId: string): string {
  return join(getPluginDataPath(app, pluginId), 'offline-bible');
}
