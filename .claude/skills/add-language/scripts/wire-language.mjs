#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveSupportedEntry, repoRoot } from './resolve.mjs';

const languagesTsPath = resolve(repoRoot, 'src/consts/languages.ts');
const localizationMdPath = resolve(repoRoot, 'LOCALIZATION.md');
const changesetDir = resolve(repoRoot, '.changeset');

function insertAlphabetically(lines, newLine, extractValue) {
  const newVal = extractValue(newLine);
  for (let i = 0; i < lines.length; i++) {
    if (extractValue(lines[i]) > newVal) {
      lines.splice(i, 0, newLine);
      return;
    }
  }
  lines.push(newLine);
}

function updateLanguagesTs(code, locale) {
  let src = readFileSync(languagesTsPath, 'utf8');
  let changed = false;

  // --- LANGUAGE_CODES spoken block ---
  const signComment = '  // Sign languages';
  const lcStart = src.indexOf('export const LANGUAGE_CODES = [');
  const signIdx = src.indexOf(signComment, lcStart);

  if (!src.slice(lcStart, signIdx).includes(`'${code}'`)) {
    // Extract spoken-block lines (between the opening '[' and the sign comment)
    const openBracket = src.indexOf('[', lcStart);
    const spokenBlock = src.slice(openBracket + 1, signIdx);
    const spokenLines = spokenBlock.split('\n').filter((l) => l.trim().startsWith("'"));

    insertAlphabetically(spokenLines, `  '${code}',`, (l) =>
      l.trim().replace(/'/g, '').replace(',', ''),
    );

    src = src.slice(0, openBracket + 1) + '\n' + spokenLines.join('\n') + '\n' + src.slice(signIdx);
    changed = true;
    console.log(`[wire-language] Added '${code}' to LANGUAGE_CODES`);
  } else {
    console.log(`[wire-language] '${code}' already in LANGUAGE_CODES — skipped`);
  }

  // --- LOCALES ---
  const localesStart = src.indexOf('export const LOCALES = [');
  const localesEnd = src.indexOf('] as const;', localesStart);
  const localesBlock = src.slice(localesStart, localesEnd);

  if (!localesBlock.includes(`'${locale}'`)) {
    const openBracket2 = src.indexOf('[', localesStart);
    const localesInner = src.slice(openBracket2 + 1, localesEnd);
    const localeLines = localesInner.split('\n').filter((l) => l.trim().startsWith("'"));

    insertAlphabetically(localeLines, `  '${locale}',`, (l) =>
      l.trim().replace(/'/g, '').replace(',', ''),
    );

    src =
      src.slice(0, openBracket2 + 1) + '\n' + localeLines.join('\n') + '\n' + src.slice(localesEnd);
    changed = true;
    console.log(`[wire-language] Added '${locale}' to LOCALES`);
  } else {
    console.log(`[wire-language] '${locale}' already in LOCALES — skipped`);
  }

  if (changed) writeFileSync(languagesTsPath, src, 'utf8');
}

function updateLocalizationMd(code, vernacular, name) {
  const content = readFileSync(localizationMdPath, 'utf8');
  const lines = content.split('\n');

  const supportedStart = lines.findIndex((l) => l.startsWith('## Supported Languages'));
  const signStart = lines.findIndex((l) => l.startsWith('### Sign Languages'));

  const tableLines = lines.slice(supportedStart + 1, signStart);
  const headerIdx = tableLines.findIndex((l) => l.startsWith('|') && l.includes('Code'));
  const sepLine = tableLines[headerIdx + 1];
  const dataStartOffset = headerIdx + 2;
  const dataLines = tableLines.slice(dataStartOffset).filter((l) => l.startsWith('|'));

  const langCell = `${vernacular} / ${name}`;

  // Idempotency check
  if (dataLines.some((l) => l.split('|')[1].trim() === code)) {
    console.log(`[wire-language] '${code}' row already in LOCALIZATION.md — skipped`);
    return;
  }

  // Read existing column widths from the separator line (e.g. "| ---- | ---... |")
  const sepParts = sepLine.split('|').slice(1, -1);
  const colCode = sepParts[0].trim().length;
  let colLang = sepParts[1].trim().length;

  // Widen if the new language cell doesn't fit
  const newLangLen = langCell.length;
  if (newLangLen > colLang) colLang = newLangLen;

  const fmtRow = (c, l) => `| ${c.padEnd(colCode)} | ${l.padEnd(colLang)} |`;

  const newRow = fmtRow(code, langCell);

  if (newLangLen > sepParts[1].trim().length) {
    // Rare: new entry is wider — rebuild separator and existing rows too
    const newSep = `| ${'-'.repeat(colCode)} | ${'-'.repeat(colLang)} |`;
    const newHeader = fmtRow('Code', 'Language');
    const existingData = dataLines.map((l) => {
      const parts = l
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());
      return fmtRow(parts[0], parts[1]);
    });
    const allRows = [...existingData, newRow].sort((a, b) => {
      const ca = a.split('|')[1].trim();
      const cb = b.split('|')[1].trim();
      return ca < cb ? -1 : ca > cb ? 1 : 0;
    });
    const tableStart = supportedStart + 1 + headerIdx;
    const tableEnd = tableStart + 2 + dataLines.length;
    lines.splice(tableStart, tableEnd - tableStart, newHeader, newSep, ...allRows);
  } else {
    // Common: find insertion point and splice in only the new row
    let insertAt = supportedStart + 1 + dataStartOffset;
    for (let i = 0; i < dataLines.length; i++) {
      const existingCode = dataLines[i].split('|')[1].trim();
      if (existingCode > code) {
        insertAt = supportedStart + 1 + dataStartOffset + i;
        break;
      }
      insertAt = supportedStart + 1 + dataStartOffset + i + 1;
    }
    lines.splice(insertAt, 0, newRow);
  }

  writeFileSync(localizationMdPath, lines.join('\n'), 'utf8');
  console.log(`[wire-language] Added '${code}' row to LOCALIZATION.md`);
}

function addChangeset(name) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const path = resolve(changesetDir, `add-${slug}-language-support.md`);
  if (existsSync(path)) {
    console.log(`[wire-language] Changeset already exists — skipped`);
    return;
  }
  writeFileSync(path, `---\n'jw-library-linker': patch\n---\n\nAdd support for ${name}.\n`, 'utf8');
  console.log(`[wire-language] Created .changeset/add-${slug}-language-support.md`);
}

export function run(entry) {
  const { code, locale, vernacular, name, isSignLanguage } = entry;

  if (isSignLanguage) {
    console.log(
      `[wire-language] ${code} is a sign language — wiring is manual (see SKILL.md steps 2,3,6).`,
    );
    return;
  }

  updateLanguagesTs(code, locale);
  updateLocalizationMd(code, vernacular, name);
  addChangeset(name);
}

// CLI entry point — resolves from languages.json (post-move)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node wire-language.mjs <locale>');
    process.exit(1);
  }
  run(resolveSupportedEntry(arg));
}
