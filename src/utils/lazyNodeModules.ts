import { Platform } from 'obsidian';

/* eslint-disable @typescript-eslint/no-require-imports -- dynamic requires for desktop-only Node.js APIs */

function assertDesktop(): void {
  if (!Platform.isDesktop) {
    throw new Error('Node.js APIs are not available on mobile');
  }
}

export function getFs(): typeof import('fs') {
  assertDesktop();
  return require('fs') as typeof import('fs');
}

export function getFsPromises(): typeof import('fs/promises') {
  assertDesktop();
  return require('fs/promises') as typeof import('fs/promises');
}

export function lazyPath(): typeof import('path') {
  assertDesktop();
  return require('path') as typeof import('path');
}

export function joinPath(...segments: string[]): string {
  return lazyPath().join(...segments);
}

export function lazyReadFile(): typeof import('fs/promises').readFile {
  return getFsPromises().readFile;
}

export function lazyCreateHash(): typeof import('crypto').createHash {
  assertDesktop();
  return (require('crypto') as typeof import('crypto')).createHash;
}
