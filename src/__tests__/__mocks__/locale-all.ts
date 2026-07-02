// Mock for the bundled locale data used in tests
// This loads the actual YAML files from the filesystem
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

// Vitest injects __dirname per test module.
const projectRoot = path.resolve(__dirname, '../../..');

const localeDir = path.resolve(projectRoot, 'locale');
const localeFiles = fs
  .readdirSync(localeDir)
  .filter((f) => f.endsWith('.yaml'))
  .map((f) => `locale/${f}`);
const bibleBookFiles = fs
  .readdirSync(path.join(localeDir, 'bibleBooks'))
  .filter((f) => f.endsWith('.yaml'))
  .map((f) => `locale/bibleBooks/${f}`);

const allFiles = [...localeFiles, ...bibleBookFiles].sort();

// Load and parse all YAML files
const locales: Record<string, unknown> = {};
for (const file of allFiles) {
  const fullPath = path.resolve(projectRoot, file);
  const yamlContent = fs.readFileSync(fullPath, 'utf8');
  locales[file] = YAML.parse(yamlContent) as unknown;
}

export default locales;
