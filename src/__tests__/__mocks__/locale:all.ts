// Mock for the bundled locale data used in tests
// This loads the actual YAML files from the filesystem
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { globSync } from 'glob';

// In Jest/CommonJS context, __dirname is available
const projectRoot = path.resolve(__dirname, '..');

// Discover all locale files using glob (same as build time)
const localeFiles = globSync('locale/*.yaml', { cwd: projectRoot, absolute: false });
const bibleBookFiles = globSync('locale/bibleBooks/*.yaml', { cwd: projectRoot, absolute: false });

const allFiles = [...localeFiles, ...bibleBookFiles].sort();

// Load and parse all YAML files
const locales: Record<string, unknown> = {};
for (const file of allFiles) {
  const fullPath = path.resolve(projectRoot, file);
  const yamlContent = fs.readFileSync(fullPath, 'utf8');
  const parsed = yaml.load(yamlContent, { schema: yaml.JSON_SCHEMA });
  locales[file] = parsed;
}

export default locales;
