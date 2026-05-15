import fs from 'fs';
import YAML from 'yaml';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function yamlPlugin() {
  return {
    name: 'yaml',
    setup(build) {
      // Handle individual .yaml file imports
      build.onResolve({ filter: /\.yaml$/ }, args => ({
        path: path.isAbsolute(args.path)
          ? args.path
          : path.resolve(args.resolveDir, args.path),
        namespace: 'yaml-loader'
      }));

      build.onLoad({ filter: /.*/, namespace: 'yaml-loader' }, args => {
        const yamlContent = fs.readFileSync(args.path, 'utf8');
        const parsed = YAML.parse(yamlContent);
        return {
          contents: JSON.stringify(parsed),
          loader: 'json'
        };
      });

      // Handle the virtual 'locale:all' module
      build.onResolve({ filter: /^locale:all$/ }, args => ({
        path: args.path,
        namespace: 'locale-all'
      }));

      build.onLoad({ filter: /.*/, namespace: 'locale-all' }, () => {
        const localeDir = path.resolve(__dirname, 'locale');
        const localeFiles = fs.readdirSync(localeDir)
          .filter(f => f.endsWith('.yaml'))
          .map(f => `locale/${f}`);
        const bibleBookFiles = fs.readdirSync(path.join(localeDir, 'bibleBooks'))
          .filter(f => f.endsWith('.yaml'))
          .map(f => `locale/bibleBooks/${f}`);

        const allFiles = [...localeFiles, ...bibleBookFiles].sort();

        // Load and parse all YAML files
        const locales = {};
        for (const file of allFiles) {
          const fullPath = path.resolve(__dirname, file);
          const yamlContent = fs.readFileSync(fullPath, 'utf8');
          const parsed = YAML.parse(yamlContent);
          locales[file.replace(/\\/g, '/')] = parsed;
        }

        // Return as ES module
        return {
          contents: `export default ${JSON.stringify(locales)};`,
          loader: 'js'
        };
      });
    }
  };
}
