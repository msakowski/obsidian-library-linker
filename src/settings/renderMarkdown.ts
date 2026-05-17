import { App, MarkdownRenderer } from 'obsidian';
import type JWLibraryLinkerPlugin from '@/main';
import { MarkdownComponent } from '@/settings/MarkdownComponent';

export async function renderMarkdown(
  app: App,
  plugin: JWLibraryLinkerPlugin,
  containerId: string,
  markdown: string,
): Promise<void> {
  const container = activeDocument.getElementById(containerId);
  if (!container) return;
  container.empty();
  const component = new MarkdownComponent();
  await MarkdownRenderer.render(app, markdown, container, '.', component);
  plugin.addChild(component);
}
