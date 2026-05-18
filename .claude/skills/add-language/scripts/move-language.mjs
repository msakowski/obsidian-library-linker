#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveEntry, repoRoot } from './resolve.mjs';

const unsupportedPath = resolve(repoRoot, 'src/consts/languagesUnsupported.json');
const supportedPath = resolve(repoRoot, 'src/consts/languages.json');

export function run(entry) {
  const { code, locale } = entry;

  const unsupported = JSON.parse(readFileSync(unsupportedPath, 'utf8'));
  const supported = JSON.parse(readFileSync(supportedPath, 'utf8'));

  if (supported.some((e) => e.code === code || e.locale === locale)) {
    console.log(
      `[move-language] ${code} (${locale}) is already in languages.json — nothing to do.`,
    );
    return;
  }

  const idx = unsupported.findIndex((e) => e.code === code);
  if (idx === -1) {
    console.error(`[move-language] ${code} not found in languagesUnsupported.json.`);
    process.exit(1);
  }

  const [moved] = unsupported.splice(idx, 1);
  supported.push(moved);

  writeFileSync(unsupportedPath, JSON.stringify(unsupported, null, 2) + '\n', 'utf8');
  writeFileSync(supportedPath, JSON.stringify(supported, null, 2) + '\n', 'utf8');

  console.log(`[move-language] Moved "${moved.name}" (${code}) → languages.json`);
}

// CLI entry point
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node move-language.mjs <locale>');
    process.exit(1);
  }
  const supported = JSON.parse(readFileSync(supportedPath, 'utf8'));
  if (supported.some((e) => e.locale === arg)) {
    console.log(`[move-language] locale "${arg}" is already in languages.json — nothing to do.`);
    process.exit(0);
  }
  run(resolveEntry(arg));
}
