// Node.js modules are lazy-required so these helpers can be imported on mobile
// without crashing. Callers must only invoke them on desktop (where Node.js is available).

/* eslint-disable @typescript-eslint/no-require-imports */

export function getFs(): typeof import('fs') {
  return require('fs') as typeof import('fs');
}

export function getFsPromises(): typeof import('fs/promises') {
  return require('fs/promises') as typeof import('fs/promises');
}

export function lazyPath(): typeof import('path') {
  return require('path') as typeof import('path');
}

export function joinPath(...segments: string[]): string {
  return lazyPath().join(...segments);
}

export function lazyReadFile(): typeof import('fs/promises').readFile {
  return getFsPromises().readFile;
}

export function lazyCreateHash(): typeof import('crypto').createHash {
  return (require('crypto') as typeof import('crypto')).createHash;
}
