#!/usr/bin/env node
import { findEntry, resolveSupportedEntry } from './resolve.mjs';
import { run as fetchBibleBooks } from './fetch-bible-books.mjs';
import { run as verifyBibleBooks } from './verify-bible-books.mjs';
import { run as moveLanguage } from './move-language.mjs';
import { run as wireLanguage } from './wire-language.mjs';
import { run as markSupported } from './mark-supported.mjs';

const arg = process.argv[2];
if (!arg) {
  console.error('Usage: node add-language.mjs <locale>');
  process.exit(1);
}

// Resolve from unsupported first; fall back to supported for idempotent re-runs
const entry = findEntry(arg) ?? resolveSupportedEntry(arg);
console.log(`\nAdding language: ${entry.name} (${entry.code}) [locale: ${entry.locale}]\n`);

await fetchBibleBooks(entry);
verifyBibleBooks(entry);
moveLanguage(entry);
wireLanguage(entry);
markSupported(entry);

const manualSteps = entry.isSignLanguage
  ? `  • src/consts/languages.ts  — add code to LANGUAGE_CODES (sign block) and SIGN_LANGUAGE_MAP in src/utils/signLanguage.ts
  • LOCALIZATION.md          — add row to Sign Languages table`
  : '';

const signNote = manualSteps ? `\n${manualSteps}` : '';
console.log(`
Done. Remaining manual steps (see SKILL.md):${signNote}
  • locale/${entry.locale}.yaml    — create UI strings if missing (translate from locale/en.yaml)
  • pnpm test:lint && pnpm test:types && pnpm test:jest
`);
