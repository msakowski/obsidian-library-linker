import { BibleTextFetcher } from '@/services/BibleTextFetcher';
import type { WorkspaceLeaf } from 'obsidian';

describe('webviewer element detection', () => {
  test('accepts a webview from another window through Obsidian instanceOf', async () => {
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);
    try {
      const container = frame.contentDocument!.createElement('div');
      const webview = frame.contentDocument!.createElement('webview');
      container.appendChild(webview);
      // Emulate Obsidian recognizing an element from a different window.
      const instanceOf = vi.fn(() => true);
      Object.defineProperty(webview, 'instanceOf', { value: instanceOf });
      expect(webview instanceof HTMLElement).toBe(false);

      const leaf = { view: { containerEl: container } } as unknown as WorkspaceLeaf;
      await expect(BibleTextFetcher['waitForWebviewElement'](leaf)).resolves.toBe(webview);
      expect(instanceOf).toHaveBeenCalledWith(HTMLElement);
    } finally {
      frame.remove();
    }
  });
});
