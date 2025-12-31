import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { glob } from 'glob';
import yaml from 'js-yaml';
import path from 'path';

console.log('Converting YAML files to JSON...');

mkdirSync('dist/locales/bibleBooks', { recursive: true });

// Convert locales
const localeFiles = glob.sync('src/locale/*.yaml');

let localeCount = 0;
for (const file of localeFiles) {
  const content = yaml.load(readFileSync(file, 'utf8'));
  const basename = path.basename(file, '.yaml');
  const outFile = `dist/locales/${basename}.json`;
  writeFileSync(outFile, JSON.stringify(content));
  localeCount++;
  console.log(`  ✓ ${basename}.yaml → ${basename}.json`);
}

// Convert bible books
const bibleBookFiles = glob.sync('src/locale/bibleBooks/*.yaml');

let bibleCount = 0;
for (const file of bibleBookFiles) {
  const content = yaml.load(readFileSync(file, 'utf8'));
  const basename = path.basename(file, '.yaml');
  const outFile = `dist/locales/bibleBooks/${basename}.json`;
  writeFileSync(outFile, JSON.stringify(content));
  bibleCount++;
  console.log(`  ✓ ${basename}.yaml → ${basename}.json`);
}

console.log(`\nConversion complete: ${localeCount} locales, ${bibleCount} bible book sets`);
