#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveEntry, repoRoot } from './resolve.mjs';

function serializeBook(book) {
  const { id, standardName, standardAbbreviation, officialAbbreviation } = book;
  const hasPrefix = /^[0-9]/.test(standardName);
  const prefix = hasPrefix ? `  prefix: '${standardName[0]}'\n` : '';
  return (
    `- id: ${id}\n` +
    prefix +
    `  aliases: []\n` +
    `  name:\n` +
    `    long: ${standardName}\n` +
    `    medium: ${standardAbbreviation}\n` +
    `    short: ${officialAbbreviation}`
  );
}

export async function run(entry) {
  const { code, locale, isSignLanguage } = entry;

  if (isSignLanguage) {
    console.log(
      `[fetch-bible-books] ${code} is a sign language — skipping (reuses base language yaml).`,
    );
    return;
  }

  console.log(`[fetch-bible-books] Fetching homepage for locale "${locale}"…`);
  const homeHtml = await fetch(`https://www.jw.org/${locale}/`).then((r) => r.text());

  const match = homeHtml.match(/data-bible_translations_api_nwt="([^"]+)"/);
  if (!match) {
    console.error(`Could not find data-bible_translations_api_nwt on jw.org/${locale}/`);
    process.exit(1);
  }
  const endpoint = match[1];
  console.log(`[fetch-bible-books] Found endpoint: ${endpoint}`);

  const json = await fetch(`https://www.jw.org${endpoint}`).then((r) => r.json());
  const booksObj = json.editionData?.books;
  if (!booksObj) {
    console.error('Unexpected API response — editionData.books not found.');
    process.exit(1);
  }

  const books = Object.entries(booksObj)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([key, value]) => ({
      id: Number(key),
      standardName: value.standardName,
      standardAbbreviation: value.standardAbbreviation,
      officialAbbreviation: value.officialAbbreviation,
    }));

  if (books.length !== 66) {
    console.warn(`Warning: expected 66 books, got ${books.length}.`);
  }
  for (let i = 0; i < books.length; i++) {
    if (books[i].id !== i + 1) {
      console.warn(`Warning: id gap — expected ${i + 1}, got ${books[i].id}.`);
    }
  }

  const yaml = books.map(serializeBook).join('\n') + '\n';
  const outPath = resolve(repoRoot, `locale/bibleBooks/${code}.yaml`);
  writeFileSync(outPath, yaml, 'utf8');

  console.log(`[fetch-bible-books] Wrote ${books.length} entries → locale/bibleBooks/${code}.yaml`);
}

// CLI entry point
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node fetch-bible-books.mjs <locale>');
    process.exit(1);
  }
  await run(resolveEntry(arg));
}
