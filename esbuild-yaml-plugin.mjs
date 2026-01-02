import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import { glob } from 'glob';
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
        const parsed = yaml.load(yamlContent, { schema: yaml.JSON_SCHEMA });
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

      build.onLoad({ filter: /.*/, namespace: 'locale-all' }, async () => {
        // Discover all locale files using glob
        const localeFiles = await glob('locale/*.yaml', {
          cwd: path.resolve(__dirname),
          absolute: false
        });
        const bibleBookFiles = await glob('locale/bibleBooks/*.yaml', {
          cwd: path.resolve(__dirname),
          absolute: false
        });

        const allFiles = [...localeFiles, ...bibleBookFiles].sort();

        // Load and parse all YAML files
        const locales = {};
        for (const file of allFiles) {
          const fullPath = path.resolve(__dirname, file);
          const yamlContent = fs.readFileSync(fullPath, 'utf8');
          const parsed = yaml.load(yamlContent, { schema: yaml.JSON_SCHEMA });
          locales[file] = parsed;
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
