#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveSupportedEntry, repoRoot } from './resolve.mjs';

function parseYaml(code) {
  const text = readFileSync(resolve(repoRoot, `locale/bibleBooks/${code}.yaml`), 'utf8');
  const books = [];
  let current = null;

  for (const raw of text.split('\n')) {
    const line = raw.trimEnd();
    const idMatch = line.match(/^- id: (\d+)$/);
    if (idMatch) {
      if (current) books.push(current);
      current = { id: Number(idMatch[1]), prefix: null, long: null, medium: null, short: null };
      continue;
    }
    if (!current) continue;
    const prefixMatch = line.match(/^  prefix: '(.+)'$/);
    if (prefixMatch) {
      current.prefix = prefixMatch[1];
      continue;
    }
    const longMatch = line.match(/^    long: (.+)$/);
    if (longMatch) {
      current.long = longMatch[1];
      continue;
    }
    const mediumMatch = line.match(/^    medium: (.+)$/);
    if (mediumMatch) {
      current.medium = mediumMatch[1];
      continue;
    }
    const shortMatch = line.match(/^    short: (.+)$/);
    if (shortMatch) {
      current.short = shortMatch[1];
      continue;
    }
  }
  if (current) books.push(current);
  return books;
}

export function run(entry) {
  const { code, isSignLanguage } = entry;

  if (isSignLanguage) {
    console.log(`[verify-bible-books] ${code} is a sign language — skipped (reuses base yaml).`);
    return;
  }

  const books = parseYaml(code);
  const errors = [];

  if (books.length !== 66) {
    errors.push(`Expected 66 books, got ${books.length}.`);
  }

  for (let i = 0; i < books.length; i++) {
    const b = books[i];
    const expected = i + 1;
    if (b.id !== expected) errors.push(`Book ${i}: expected id ${expected}, got ${b.id}.`);
    if (!b.long) errors.push(`Book id ${b.id}: missing name.long.`);
    if (!b.medium) errors.push(`Book id ${b.id}: missing name.medium.`);
    if (!b.short) errors.push(`Book id ${b.id}: missing name.short.`);
    if (b.long) {
      const shouldHavePrefix = /^[0-9]/.test(b.long);
      if (shouldHavePrefix && !b.prefix) {
        errors.push(`Book id ${b.id}: name.long starts with digit but prefix is missing.`);
      } else if (shouldHavePrefix && b.prefix !== b.long[0]) {
        errors.push(`Book id ${b.id}: prefix '${b.prefix}' !== '${b.long[0]}'.`);
      } else if (!shouldHavePrefix && b.prefix) {
        errors.push(
          `Book id ${b.id}: unexpected prefix '${b.prefix}' (name does not start with digit).`,
        );
      }
    }
  }

  if (errors.length > 0) {
    errors.forEach((e) => console.error(`[verify-bible-books] ERROR: ${e}`));
    process.exit(1);
  }

  console.log(`[verify-bible-books] ${code}.yaml OK (66 books).`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node verify-bible-books.mjs <locale>');
    process.exit(1);
  }
  run(resolveSupportedEntry(arg));
}
