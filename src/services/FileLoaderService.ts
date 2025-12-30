import type { App } from 'obsidian';

/**
 * Service for loading JSON files from the plugin's data directory
 * Provides caching to avoid redundant file reads
 */
export class FileLoaderService {
  private cache = new Map<string, unknown>();

  constructor(
    private app: App,
    private manifestDir: string,
  ) {}

  /**
   * Load and parse a JSON file from the plugin's data directory
   * Returns cached version if already loaded
   *
   * @param relativePath - Path relative to the data directory (e.g., 'locales/en.json')
   * @returns Parsed JSON content
   * @throws Error if file cannot be loaded or parsed
   */
  async loadJSON<T>(relativePath: string): Promise<T> {
    // Return cached version if available
    if (this.cache.has(relativePath)) {
      return this.cache.get(relativePath) as T;
    }

    const fullPath = `${this.manifestDir}/${relativePath}`;

    try {
      const content = await this.app.vault.adapter.read(fullPath);
      const parsed = JSON.parse(content) as T;
      this.cache.set(relativePath, parsed);
      return parsed;
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error(`Corrupted JSON file: ${fullPath}`, error);
        throw new Error(`Corrupted data file: ${relativePath}. Please reinstall the plugin.`);
      }
      console.error(`Failed to load ${fullPath}:`, error);
      throw new Error(`Failed to load resource: ${relativePath}`);
    }
  }

  /**
   * Check if a file exists in the data directory
   *
   * @param relativePath - Path relative to the data directory
   * @returns True if file exists, false otherwise
   */
  async exists(relativePath: string): Promise<boolean> {
    const fullPath = `${this.manifestDir}/${relativePath}`;
    try {
      return await this.app.vault.adapter.exists(fullPath);
    } catch {
      return false;
    }
  }

  /**
   * Clear cache for a specific file or all files
   *
   * @param relativePath - Optional path to clear. If not provided, clears all cache
   */
  clearCache(relativePath?: string): void {
    if (relativePath) {
      this.cache.delete(relativePath);
    } else {
      this.cache.clear();
    }
  }
}
