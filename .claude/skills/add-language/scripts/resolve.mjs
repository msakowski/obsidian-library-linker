import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const skillDir = resolve(fileURLToPath(import.meta.url), '../..');
export const repoRoot = resolve(skillDir, '../../..');

const unsupportedPath = resolve(repoRoot, 'src/consts/languagesUnsupported.json');
const supportedPath = resolve(repoRoot, 'src/consts/languages.json');

export function findEntry(locale) {
  const entries = JSON.parse(readFileSync(unsupportedPath, 'utf8'));
  return entries.find((e) => e.locale === locale.trim()) ?? null;
}

export function resolveEntry(locale) {
  const entry = findEntry(locale);
  if (!entry) {
    console.error(`No language with locale "${locale}" found in languagesUnsupported.json.`);
    process.exit(1);
  }
  return entry;
}

export function resolveSupportedEntry(locale) {
  const entries = JSON.parse(readFileSync(supportedPath, 'utf8'));
  const entry = entries.find((e) => e.locale === locale.trim());
  if (!entry) {
    console.error(`No language with locale "${locale}" found in languages.json.`);
    process.exit(1);
  }
  return entry;
}
