#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveSupportedEntry } from './resolve.mjs';

const dataPath = resolve(fileURLToPath(import.meta.url), '../../languages_by_users.json');

export function run(entry) {
  const { code, name } = entry;
  const arr = JSON.parse(readFileSync(dataPath, 'utf8'));

  const idx = arr.findIndex((e) => e.language.trim().toLowerCase() === name.trim().toLowerCase());

  if (idx === -1) {
    console.warn(
      `[mark-supported] No match for "${name}" in languages_by_users.json — update manually.`,
    );
    return;
  }

  const item = arr[idx];
  if (item.supported === true && item.languageCode === code) {
    console.log(`[mark-supported] "${name}" already marked supported (${code}) — skipped.`);
    return;
  }

  arr[idx] = { ...item, supported: true, languageCode: code };
  writeFileSync(dataPath, JSON.stringify(arr, null, 2) + '\n', 'utf8');
  console.log(`[mark-supported] Marked "${name}" as supported (languageCode: "${code}").`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node mark-supported.mjs <locale>');
    process.exit(1);
  }
  run(resolveSupportedEntry(arg));
}
