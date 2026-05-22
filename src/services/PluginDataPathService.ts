import { FileSystemAdapter, type App } from 'obsidian';

export function getOfflineBibleVaultPath(app: App, pluginId: string): string {
  return `${app.vault.configDir}/plugins/${pluginId}/offline-bible`;
}

export function getOfflineBibleAbsolutePath(app: App, pluginId: string): string {
  const adapter = app.vault.adapter;
  if (!(adapter instanceof FileSystemAdapter)) {
    throw new Error('Absolute path is only available on the desktop file system adapter.');
  }
  return `${adapter.getBasePath()}/${getOfflineBibleVaultPath(app, pluginId)}`;
}
