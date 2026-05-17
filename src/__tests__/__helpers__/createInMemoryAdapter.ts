import type { DataAdapter, ListedFiles, Stat } from 'obsidian';

export interface InMemoryAdapter extends DataAdapter {
  /** Direct access to the underlying file map for assertions in tests. */
  files: Map<string, string>;
}

export function createInMemoryAdapter(): InMemoryAdapter {
  const files = new Map<string, string>();
  const dirs = new Set<string>(['']);

  function ensureParentDirs(filePath: string): void {
    const parts = filePath.split('/').slice(0, -1);
    let acc = '';
    for (const part of parts) {
      acc = acc ? `${acc}/${part}` : part;
      dirs.add(acc);
    }
  }

  return {
    files,
    exists(path: string): Promise<boolean> {
      return Promise.resolve(files.has(path) || dirs.has(path));
    },
    read(path: string): Promise<string> {
      const value = files.get(path);
      if (value === undefined) {
        return Promise.reject(new Error(`ENOENT: no such file '${path}'`));
      }
      return Promise.resolve(value);
    },
    async readBinary(path: string): Promise<ArrayBuffer> {
      const value = await this.read(path);
      return new TextEncoder().encode(value).buffer;
    },
    write(path: string, data: string): Promise<void> {
      ensureParentDirs(path);
      files.set(path, data);
      return Promise.resolve();
    },
    writeBinary(path: string, data: ArrayBuffer): Promise<void> {
      ensureParentDirs(path);
      files.set(path, new TextDecoder().decode(new Uint8Array(data)));
      return Promise.resolve();
    },
    mkdir(path: string): Promise<void> {
      ensureParentDirs(`${path}/_`);
      dirs.add(path);
      return Promise.resolve();
    },
    list(path: string): Promise<ListedFiles> {
      const prefix = path === '' ? '' : `${path}/`;
      const childFiles: string[] = [];
      const childFolders = new Set<string>();
      for (const file of files.keys()) {
        if (!file.startsWith(prefix)) continue;
        const rest = file.slice(prefix.length);
        if (rest.includes('/')) {
          childFolders.add(`${prefix}${rest.split('/')[0]}`);
        } else {
          childFiles.push(file);
        }
      }
      for (const dir of dirs) {
        if (!dir.startsWith(prefix) || dir === path) continue;
        const rest = dir.slice(prefix.length);
        if (rest && !rest.includes('/')) childFolders.add(dir);
      }
      return Promise.resolve({
        files: childFiles.sort(),
        folders: Array.from(childFolders).sort(),
      });
    },
    remove(path: string): Promise<void> {
      files.delete(path);
      return Promise.resolve();
    },
    rmdir(path: string, recursive: boolean): Promise<void> {
      if (recursive) {
        for (const file of Array.from(files.keys())) {
          if (file === path || file.startsWith(`${path}/`)) files.delete(file);
        }
        for (const dir of Array.from(dirs)) {
          if (dir === path || dir.startsWith(`${path}/`)) dirs.delete(dir);
        }
        return Promise.resolve();
      }
      dirs.delete(path);
      return Promise.resolve();
    },
    stat(path: string): Promise<Stat | null> {
      if (files.has(path)) {
        const size = files.get(path)?.length ?? 0;
        return Promise.resolve({ type: 'file', ctime: 0, mtime: 0, size });
      }
      if (dirs.has(path)) return Promise.resolve({ type: 'folder', ctime: 0, mtime: 0, size: 0 });
      return Promise.resolve(null);
    },
    getName(): string {
      return 'in-memory';
    },
    append(): Promise<void> {
      return Promise.reject(new Error('append not implemented in test adapter'));
    },
    appendBinary(): Promise<void> {
      return Promise.reject(new Error('appendBinary not implemented in test adapter'));
    },
    copy(): Promise<void> {
      return Promise.reject(new Error('copy not implemented in test adapter'));
    },
    process(): Promise<string> {
      return Promise.reject(new Error('process not implemented in test adapter'));
    },
    rename(oldPath: string, newPath: string): Promise<void> {
      const value = files.get(oldPath);
      if (value === undefined) return Promise.reject(new Error(`ENOENT: ${oldPath}`));
      files.delete(oldPath);
      ensureParentDirs(newPath);
      files.set(newPath, value);
      return Promise.resolve();
    },
    async trashLocal(path: string): Promise<void> {
      await this.remove(path);
    },
    async trashSystem(path: string): Promise<boolean> {
      await this.remove(path);
      return true;
    },
    getResourcePath(): string {
      return '';
    },
  };
}
