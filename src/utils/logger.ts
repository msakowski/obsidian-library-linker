declare const DEBUG: string;

const debugEnabled = typeof DEBUG !== 'undefined' && DEBUG === 'true';
const PREFIX = '[JWLinker]';

// Methods that don't take a prefix as the first argument
const noPrefixMethods = new Set(['table', 'dir', 'dirxml', 'clear', 'groupEnd']);

// Methods that should always pass through regardless of debug mode
const alwaysEnabled = new Set(['error', 'warn']);

export const logger: Console = new Proxy(console, {
  get(target, prop: keyof Console) {
    const method = target[prop];
    if (typeof method !== 'function') return method;

    return (...args: unknown[]) => {
      if (!debugEnabled && !alwaysEnabled.has(prop)) return;
      if (noPrefixMethods.has(prop)) {
        return (method as (...args: unknown[]) => void).apply(target, args);
      }
      return (method as (...args: unknown[]) => void).apply(target, [PREFIX, ...args]);
    };
  },
});
